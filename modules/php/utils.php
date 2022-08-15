<?php

require_once(__DIR__.'/objects/shape.php');
require_once(__DIR__.'/objects/objects.php');
require_once(__DIR__.'/objects/player.php');
require_once(__DIR__.'/objects/constellation.php');

trait UtilTrait {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Utility functions
    ////////////

    function array_find(array $array, callable $fn) {
        foreach ($array as $value) {
            if($fn($value)) {
                return $value;
            }
        }
        return null;
    }

    function array_find_key(array $array, callable $fn) {
        foreach ($array as $key => $value) {
            if($fn($value)) {
                return $key;
            }
        }
        return null;
    }

    function array_some(array $array, callable $fn) {
        foreach ($array as $value) {
            if($fn($value)) {
                return true;
            }
        }
        return false;
    }
    
    function array_every(array $array, callable $fn) {
        foreach ($array as $value) {
            if(!$fn($value)) {
                return false;
            }
        }
        return true;
    }

    function array_identical(array $a1, array $a2) {
        if (count($a1) != count($a2)) {
            return false;
        }
        for ($i=0;$i<count($a1);$i++) {
            if ($a1[$i] != $a2[$i]) {
                return false;
            }
        }
        return true;
    }

    function getPlayersIds() {
        return array_keys($this->loadPlayersBasicInfos());
    }

    function getPlayerName(int $playerId) {
        return self::getUniqueValueFromDB("SELECT player_name FROM player WHERE player_id = $playerId");
    }

    function getPlayer(int $id) {
        $sql = "SELECT * FROM player WHERE player_id = $id";// SELECT * FROM player WHERE player_id = 2343493
        $dbResults = $this->getCollectionFromDb($sql);
        return array_map(fn($dbResult) => new LatsPlayer($dbResult), array_values($dbResults))[0];
    }

    function getPlayers() {
        $sql = "SELECT * FROM player ORDER BY player_no";
        $dbResults = $this->getCollectionFromDb($sql);
        return array_map(fn($dbResult) => new LatsPlayer($dbResult), array_values($dbResults));
    }

    function incPlayerScore(int $playerId, int $amount, $message = '', $args = []) {
        $this->DbQuery("UPDATE player SET `player_score` = `player_score` + $amount WHERE player_id = $playerId");
            
        $this->notifyAllPlayers('score', $message, [
            'playerId' => $playerId,
            'score' => $this->getPlayer($playerId)->score,
        ] + $args);
    }

    function lineStrToLine(string $lineStr) {
        return [[hexdec($lineStr[0]), hexdec($lineStr[1])], [hexdec($lineStr[2]), hexdec($lineStr[3])]];
    }

    function linesStrToLines(array $linesStr) {
        return array_map(fn($lineStr) => $this->lineStrToLine($lineStr), $linesStr);
    }

    function getCardFromDb(/*array|null*/ $dbCard) {
        if ($dbCard == null) {
            return null;
        }
        return new Card($dbCard, $this->SHAPES);
    }

    function getCardsFromDb(array $dbCards) {
        return array_map(fn($dbCard) => $this->getCardFromDb($dbCard), array_values($dbCards));
    }

    function setupCards() {
        $shapes = [
            [ 'type' => 1, 'type_arg' => null, 'nbr' => 3 ] // shooting stars
        ];
        // shapes
        foreach ($this->SHAPES as $typeArg => $shape) {
            $shapes[] = [ 'type' => 2, 'type_arg' => $typeArg, 'nbr' => 1 ];
        }
        $this->shapes->createCards($shapes, 'deck');
        $this->shapes->shuffle('deck');
        for ($i=1; $i<=18; $i++) {
            $this->shapes->pickCardForLocation('deck', 'piles', $i);
        }
    }

    function setupObjectives() {
        $default = $this->getGameStateValue(OBJECTIVES) == '1';

        $star1 = $default ? 2 : bga_rand(0, 9);
        $star2 = $default ? 3 : bga_rand(0, 8);
        
        $this->setGameStateInitialValue(STAR1, $star1);
        $this->setGameStateInitialValue(STAR2, $star2);
    }

    function getCurrentCard(bool $linesAsString) {
        $card = $this->getCardFromDb($this->shapes->getCardOnTop('piles'), $linesAsString);
        return $linesAsString ? Card::linesAsString($card) : $card;
    }

    function shiftLines(array $lines, int $x, int $y, int $rotation) {
        $rotatedLines = json_decode(json_encode($lines), true);
        if ($rotation == 1 || $rotation == 3) {
            // rotate 90°
            $rotatedLines = array_map(fn($line) => [
                [$line[0][1], 3 - $line[0][0]],
                [$line[1][1], 3 - $line[1][0]],                
            ], $rotatedLines);
        }
        if ($rotation == 2 || $rotation == 3) {
            // rotate 180°
            $rotatedLines = array_map(fn($line) => [
                [3 - $line[0][0], 3 - $line[0][1]],
                [3 - $line[1][0], 3 - $line[1][1]],
            ], $rotatedLines);
        }

        $rotatedAndShiftedLines = array_map(fn($line) => [[$x + $line[0][0], $y + $line[0][1]], [$x + $line[1][0], $y + $line[1][1]]], $rotatedLines);
        return $rotatedAndShiftedLines;
    }

    function shiftCoordinates(array $coordinates, int $x, int $y, int $rotation) {
        $rotatedCoordinates = json_decode(json_encode($coordinates), true);
        if ($rotation == 1 || $rotation == 3) {
            // rotate 90°
            $rotatedCoordinates = [$rotatedCoordinates[1], 3 - $rotatedCoordinates[0]];
        }
        if ($rotation == 2 || $rotation == 3) {
            // rotate 180°
            $rotatedCoordinates = [3 - $rotatedCoordinates[0], 3 - $rotatedCoordinates[1]];
        }

        $rotatedAndShiftedCoordinates = [$x + $rotatedCoordinates[0], $y + $rotatedCoordinates[1]];
        return $rotatedAndShiftedCoordinates;
    }

    function coordinatesInArray(array $coordinates, array $arrayOfCoordinates) {
        return $this->array_some($arrayOfCoordinates, fn($iCoord) => $coordinates[0] == $iCoord[0] && $coordinates[1] == $iCoord[1]);
    }

    function sameCoordinates(array $coordinates1, array $coordinates2) {
        return $coordinates1[0] == $coordinates2[0] && $coordinates1[1] == $coordinates2[1];
    }

    function sameLine(array $line1, array $line2) {
        return (
            $this->sameCoordinates($line1[0], $line2[0]) && $this->sameCoordinates($line1[1], $line2[1])
        ) || (
            $this->sameCoordinates($line1[0], $line2[1]) && $this->sameCoordinates($line1[1], $line2[0])
        );
    }

    function lineConnected(array $line, array $toLine) {
        return $this->coordinatesInArray($line[0], $toLine) || $this->coordinatesInArray($line[1], $toLine) || $this->lineCross($line, $toLine);
    }

    function lineCross(array $line, array $withLine) {
        return 
            ($line[0][0] + $line[1][0] == $withLine[0][0] + $withLine[1][0]) &&
            ($line[0][1] + $line[1][1] == $withLine[0][1] + $withLine[1][1]);
    }

    function getDay() {
        $day = 0;
        $cardsLength = intval($this->shapes->countCardInLocation('piles'));
        if ($cardsLength <= 6) {
            $day = 2;
        } else if ($cardsLength <= 12) {
            $day = 1;
        }
        return $day;
    }

    function isPossiblePosition(array $shiftedLines, Sheet $playerSheet, array $placedLines, object $placedObjects, bool $canTouchLines) {
        // not oustside the board
        $minY = 2 * $this->getDay();
        if ($this->array_some($shiftedLines, fn($line) => $this->array_some($line, fn($coordinates) => $coordinates[0] < 0 || $coordinates[0] > 9 || $coordinates[1] < $minY || $coordinates[1] > 10))) {
            return false;
        }

        // no always forbidden points, sheet forbidden points, or planet
        $forbiddenCoordinates = array_merge(
            $this->ALWAYS_FORBIDDEN_POINTS,
            $playerSheet->forbiddenStars,
            $playerSheet->planets,
        );

        if ($this->array_some($shiftedLines, fn($line) => $this->array_some($line, fn($coordinates) => $this->coordinatesInArray($coordinates, $forbiddenCoordinates)))) {
            return false;
        }

        // no pre-existing line
        if ($this->array_some($shiftedLines, fn($line) => $this->array_some($placedLines, fn($placedLine) => $this->sameLine($line, $placedLine)))) {
            return false;
        }

        if (!$canTouchLines && $this->array_some($shiftedLines, fn($line) => $this->array_some($placedLines, fn($placedLine) => $this->lineConnected($line, $placedLine)))) {
            return false;
        }

        // no touching a shooting star
        if ($this->array_some($shiftedLines, fn($line) => $this->array_some($placedObjects->shootingStars, fn($shootingStar) => $this->array_some($shootingStar->lines, fn($shootingStarLine) => $this->lineConnected($line, $shootingStarLine))))) {
            return false;
        }

        return true;
    }

    function getPossiblePositions(int $playerId, array $shapeLines, bool $keysAsString, bool $canTouchLines) {
        $player = $this->getPlayer($playerId);
        //$this->debug([$playerId, $player]);
        $playerSheet = $this->SHEETS[$player->sheet];
        $placedLines = array_merge(
            $this->linesStrToLines($player->lines),
            $playerSheet->lines
        );
        $placedObjects = $player->objects;
        $placedObjects->shootingStars = ShootingStarType::linesAndHeadAsArrays($placedObjects->shootingStars);

        $result = [];

        for ($x = -1; $x <= 7; $x++) {
            for ($y = -1; $y <= 8; $y++) {
                $key = $keysAsString ? dechex($x + 1).dechex($y + 1) : [$x, $y];
                $possibleRotationsForPosition = [];
                for ($rotation = 0; $rotation <= 3; $rotation++) {
                    $shiftedLines = $this->shiftLines($shapeLines, $x, $y, $rotation);
                    if ($this->isPossiblePosition(
                        $shiftedLines,
                        $playerSheet,
                        $placedLines, 
                        $placedObjects,
                        $canTouchLines
                    )) {
                        $possibleRotationsForPosition[] = $rotation;
                    }
                }
                $result[$key] = $possibleRotationsForPosition;
            }
        }
        return $result;
    }

    function getValidConstellations(array $constellations) {
        return array_values(array_filter($constellations, fn($constellation) => $constellation->getSize() >= 3 && $constellation->getSize() <= 8));
    }

    function getConstellations(array $lines) {
        $constellations = [];

        foreach ($lines as $line) {
            $constellation = $this->array_find($constellations, fn($iConstellation) => $this->array_some($iConstellation->lines, fn($iLine) => 
                $this->lineConnected($line, $iLine)
            ));

            if ($constellation) {
                $constellation->addLine($line);

                $otherConstellationConnectedToLineIndex = $this->array_find_key($constellations, fn($iConstellation) => 
                    $iConstellation->key != $constellation->key && $this->array_some($iConstellation->lines, fn($iLine) => $this->lineConnected($line, $iLine))
                );

                while ($otherConstellationConnectedToLineIndex !== null) {
                    $constellation->addConstellation($constellations[$otherConstellationConnectedToLineIndex]);

                    array_splice($constellations, $otherConstellationConnectedToLineIndex, 1);

                    $otherConstellationConnectedToLineIndex = $this->array_find_key($constellations, fn($iConstellation) => 
                        $iConstellation->key != $constellation->key && $this->array_some($iConstellation->lines, fn($iLine) => $this->lineConnected($line, $iLine))
                    );
                }
            } else {
                $constellation = new Constellation($line);
                $constellations[] = $constellation;
            }
        }

        return $constellations;
    }

    private function calculateConstellationsScore(PlayerScore &$playerScore, array $constellations) {
        for ($size = 3; $size <=8; $size++) {
            if ($this->array_some($constellations, fn($constellation) => $constellation->getSize() == $size)) {
                $playerScore->checkedConstellations[] = $size;
                $playerScore->constellations += $size;
            }
        }
    }

    private function calculatePlanetScore(PlayerScore &$playerScore, array $constellations, array $planet) {
        $planetConstellations = [];
        for ($x = $planet[0]-1; $x <= $planet[0]+1; $x++) {
            for ($y = $planet[1]-1; $y <= $planet[1]+1; $y++) {
                if ($x != 0 || $y != 0) {
                    $coordinates = [$x, $y];
                    $constellation = $this->array_find($constellations, fn($iConstellation) => $this->array_some($iConstellation->lines, fn($line) => 
                        $this->coordinatesInArray($coordinates, $line)
                    ));
                    if ($constellation && !in_array($constellation->key, $planetConstellations)) {
                        $planetConstellations[] = $constellation->key;
                    }
                }
            }
        }

        $playerScore->planets += count($planetConstellations);
    }

    private function calculatePlanetsScore(PlayerScore &$playerScore, array $constellations, array $planets) {
        foreach ($planets as $planet) {
            $this->calculatePlanetScore($playerScore, $constellations, $planet);
        }
    }

    private function calculateShootingStarsScore(PlayerScore &$playerScore, array $shootingStars) {
        foreach ($shootingStars as $shootingStar) {
            $playerScore->shootingStars += count($shootingStar->lines);
        }
    }

    private function calculateStar1Score(PlayerScore &$playerScore, array $lines) {
        $objective = $this->STAR1[intval($this->getGameStateValue(STAR1))];
        // TODO
    }

    private function calculateStar2Score(PlayerScore &$playerScore) {
        // TODO
    }

    private function getPlayerScore(LatsPlayer $player) {
        $playerScore = new PlayerScore();
        $playerSheet = $this->SHEETS[$player->sheet];
        $placedLines = array_merge(
            $this->linesStrToLines($player->lines),
            $playerSheet->lines,
        );
        $placedObjects = $player->objects;

        $constellations = $this->getConstellations($placedLines);
        $validConstellations = $this->getValidConstellations($constellations);
        //$player->id == 2343492 && $this->debug($validConstellations);
        $planets = $playerSheet->planets;

        $this->calculateConstellationsScore($playerScore, $validConstellations);
        $this->calculatePlanetsScore($playerScore, $validConstellations, $planets);
        $this->calculateShootingStarsScore($playerScore, $placedObjects->shootingStars);
        $this->calculateStar1Score($playerScore, $placedLines);
        $this->calculateStar2Score($playerScore);
        
        $playerScore->calculateTotal();

        return $playerScore;
    }
}
