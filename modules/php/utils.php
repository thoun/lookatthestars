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
        return $this->getUniqueValueFromDB("SELECT player_name FROM player WHERE player_id = $playerId");
    }

    function getPlayer(int $id) {
        $sql = "SELECT * FROM player WHERE player_id = $id";
        $dbResults = $this->getCollectionFromDb($sql);
        return array_map(fn($dbResult) => new LatsPlayer($dbResult, $this->SHEETS), array_values($dbResults))[0];
    }

    function getPlayers() {
        $sql = "SELECT * FROM player ORDER BY player_no";
        $dbResults = $this->getCollectionFromDb($sql);
        return array_map(fn($dbResult) => new LatsPlayer($dbResult, $this->SHEETS), array_values($dbResults));
    }

    function incPlayerScore(int $playerId, int $amount, $message = '', $args = []) {
        $this->DbQuery("UPDATE player SET `player_score` = `player_score` + $amount WHERE player_id = $playerId");
            
        $this->notifyAllPlayers('score', $message, [
            'playerId' => $playerId,
            'score' => $this->getPlayer($playerId)->score,
        ] + $args);
    }

    function coordinateStrToCoordinate(string $coordinatesStr) {
        return [hexdec($coordinatesStr[0]), hexdec($coordinatesStr[1])];
    }

    function coordinatesStrToCoordinates(array $coordinatesStr) {
        return array_map(fn($coordinateStr) => $this->coordinateStrToCoordinate($coordinateStr), $coordinatesStr);
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
        $star1option = intval($this->getGameStateValue(POINT_BONUS_CARD_OPTION));
        $star2option = intval($this->getGameStateValue(POWER_BONUS_CARD_OPTION));

        $star1 = DEFAULT_STAR1;
        if ($star1option > 2) {
            $star1 = $star1option - 3;
        } else if ($star1option == 2) {
            $star1 = bga_rand(0, 9);
        }

        $this->setGameStateInitialValue(STAR1, $star1);

        $star2 = DEFAULT_STAR2;
        if ($star2option > 3) {
            $POWERS_MAPPING = [
                1,
                3,
                2,
                4,
                7,
                6,
                0,
                8,
                5,
            ];
            $star2 = $POWERS_MAPPING[$star2option - 4];
        } else if ($star2option == 3) {
            $star2 = bga_rand(0, 8);
        } else if ($star2option == 2) {
            $EASY_OBJECTIVES = [1, 2, 3, 4, 7];
            $star2 = $EASY_OBJECTIVES[bga_rand(0, 4)];
        }
        
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

    function lineInArray(array $line, array $lines) {
        return $this->array_some($lines, fn($iLine) => $this->sameLine($iLine, $line));
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

    function isFreeCoordinates(array $coordinates, LatsPlayer $player, int $day, bool $ignoreBlackHole = false) {
        // not outside the board
        $minY = 2 * $day;
        if ($coordinates[0] < 0 || $coordinates[0] > 9 || $coordinates[1] < $minY || $coordinates[1] > 10) {
            return false;
        }

        // no always forbidden points, sheet forbidden points, or planet
        $forbiddenCoordinates = $player->getForbiddenCoordinates($ignoreBlackHole);

        if ($this->coordinatesInArray($coordinates, $forbiddenCoordinates)) {
            return false;
        }

        $placedLines = $player->getLines(true);
        if ($this->array_some($placedLines, fn($placedLine) => $this->coordinatesInArray($coordinates, $placedLine))) {
            return false;
        }

        // no touching a shooting star
        $shootingStars = $player->getShootingStars();
        if ($this->array_some($shootingStars, fn($shootingStar) => $this->array_some($shootingStar->lines, fn($shootingStarLine) => $this->coordinatesInArray($coordinates, $shootingStarLine)))) {
            return false;
        }

        return true;
    }

    function isFreeCoordinatesForStar(array $coordinates, LatsPlayer $player, int $day) {
        // not outside the board
        $minY = 2 * $day;
        if ($coordinates[0] < 0 || $coordinates[0] > 9 || $coordinates[1] < $minY || $coordinates[1] > 10) {
            return false;
        }

        return $this->coordinatesInArray($coordinates, $player->getSheetForbiddenCoordinates(true, true));
    }

    function isPossiblePositionForLine(array $line, LatsPlayer $player, int $day, bool $canTouchLines, array $constellations) {
        // not outside the board
        $minY = 2 * $day;
        if ($this->array_some($line, fn($coordinates) => $coordinates[0] < 0 || $coordinates[0] > 9 || $coordinates[1] < $minY || $coordinates[1] > 10)) {
            return false;
        }

        // no always forbidden points, sheet forbidden points, or planet
        $forbiddenCoordinates = $player->getForbiddenCoordinates();

        if ($this->array_some($line, fn($coordinates) => $this->coordinatesInArray($coordinates, $forbiddenCoordinates))) {
            return false;
        }

        $placedLines = $player->getLines();
        // no pre-existing line
        if ($this->array_some($placedLines, fn($placedLine) => $this->sameLine($line, $placedLine))) {
            return false;
        }

        if (!$canTouchLines && $this->array_some($placedLines, fn($placedLine) => $this->lineConnected($line, $placedLine))) {
            return false;
        }

        // no touching a shooting star
        $shootingStars = $player->getShootingStars();
        if ($this->array_some($shootingStars, fn($shootingStar) => $this->array_some($shootingStar->lines, fn($shootingStarLine) => $this->lineConnected($line, $shootingStarLine)))) {
            return false;
        }

        // no touching a constellation with a luminous aura
        foreach ($constellations as $constellation) {
            if ($this->luminousAuraInConstellation($player->objects->luminousAuras, $constellation) && 
                $this->array_some($constellation->lines, fn($constellationLine) => $this->lineConnected($line, $constellationLine))
            ) {
                return false;
            }
        }

        return true;
    }

    function isPossiblePositionForLines(array $shiftedLines, LatsPlayer $player, int $day, bool $canTouchLines, array $constellations) {
        return $this->array_every($shiftedLines, fn($line) => $this->isPossiblePositionForLine($line, $player, $day, $canTouchLines, $constellations));
    }

    function getPossiblePositions(int $playerId, array $shapeLines, bool $canTouchLines) {
        $player = $this->getPlayer($playerId);
        $day = $this->getDay();
        $constellations = $this->getConstellations($player->getLines(true));

        $result = [];

        for ($x = -2; $x <= 8; $x++) {
            for ($y = -2; $y <= 9; $y++) {
                $possibleRotationsForPosition = [];
                for ($rotation = 0; $rotation <= 3; $rotation++) {
                    $shiftedLines = $this->shiftLines($shapeLines, $x, $y, $rotation);
                    if ($this->isPossiblePositionForLines(
                        $shiftedLines,
                        $player,
                        $day,
                        $canTouchLines, 
                        $constellations
                    )) {
                        $possibleRotationsForPosition[] = $rotation;
                    }
                }
                $result[json_encode([$x, $y])] = $possibleRotationsForPosition;
            }
        }
        return $result;
    }

    function getPossiblePositionsForLine(int $playerId) {
        $player = $this->getPlayer($playerId);
        $day = $this->getDay();
        $constellations = $this->getConstellations($player->getLines(true));

        $possibleLines = [];

        for ($x = 0; $x <= 9; $x++) {
            for ($y = 0; $y <= 10; $y++) {
                if ($this->isPossiblePositionForLine(
                    [[$x, $y], [$x+1, $y]], // to the right
                    $player, 
                    $day,
                    true,
                    $constellations
                )) {
                    $possibleLines[] = dechex($x).dechex($y).dechex($x+1).dechex($y);
                }
                if ($this->isPossiblePositionForLine(
                    [[$x, $y], [$x, $y+1]], // to the top
                    $player,
                    $day,
                    true,
                    $constellations
                )) {
                    $possibleLines[] = dechex($x).dechex($y).dechex($x).dechex($y+1);
                }
                if ($this->isPossiblePositionForLine(
                    [[$x, $y], [$x+1, $y+1]], // to top right
                    $player,
                    $day,
                    true,
                    $constellations
                )) {
                    $possibleLines[] = dechex($x).dechex($y).dechex($x+1).dechex($y+1);
                }
                if ($this->isPossiblePositionForLine(
                    [[$x, $y+1], [$x+1, $y]], // the other diagonal
                    $player,
                    $day,
                    true,
                    $constellations
                )) {
                    $possibleLines[] = dechex($x).dechex($y+1).dechex($x+1).dechex($y);
                }
            }
        }

        return $possibleLines;
    }

    function getFreeCoordinates(LatsPlayer $player) {
        $day = $this->getDay();

        $result = [];

        for ($x = 0; $x <= 9; $x++) {
            for ($y = 0; $y <= 10; $y++) {
                if ($this->isFreeCoordinates(
                    [$x, $y],
                    $player,
                    $day
                )) {
                    $result[] = dechex($x).dechex($y);
                }
            }
        }
        return $result;
    }

    function getFreeCoordinatesForStar(LatsPlayer $player) {
        $day = $this->getDay();

        $result = [];

        for ($x = 0; $x <= 9; $x++) {
            for ($y = 0; $y <= 10; $y++) {
                if ($this->isFreeCoordinatesForStar(
                    [$x, $y],
                    $player,
                    $day
                )) {
                    $result[] = dechex($x).dechex($y);
                }
            }
        }
        return $result;
    }

    function getValidConstellations(array $constellations, $novasStr) {
        $novas = array_map(fn($novaStr) => $this->coordinateStrToCoordinate($novaStr), $novasStr);


        return array_values(array_filter($constellations, fn($constellation) => 
            $constellation->getSize() >= 3 && 
            ($constellation->getSize() <= 8 || 
            ($constellation->getSize() <= 10 && $this->array_some($constellation->lines, fn($line) => $this->array_some($novas, fn($nova) => $this->coordinatesInArray($nova, $line)))) 
            )
        ));
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
                    $iConstellation != $constellation && $this->array_some($iConstellation->lines, fn($iLine) => $this->lineConnected($line, $iLine))
                );

                while ($otherConstellationConnectedToLineIndex !== null) {
                    $constellation->addConstellation($constellations[$otherConstellationConnectedToLineIndex]);

                    array_splice($constellations, $otherConstellationConnectedToLineIndex, 1);

                    $otherConstellationConnectedToLineIndex = $this->array_find_key($constellations, fn($iConstellation) => 
                        $iConstellation != $constellation && $this->array_some($iConstellation->lines, fn($iLine) => $this->lineConnected($line, $iLine))
                    );
                }
            } else {
                $constellation = new Constellation($line);
                $constellations[] = $constellation;
            }
        }

        return array_values(array_filter($constellations, fn($constellation) => $constellation->getSize() >= 3));
    }

    private function calculateConstellationsScore(PlayerScore &$playerScore, array $constellations) {
        for ($size = 3; $size <=8; $size++) {
            if ($this->array_some($constellations, fn($constellation) => $constellation->getSize() == $size)) {
                $playerScore->checkedConstellations[] = $size;
                $playerScore->constellations += $size;
            }
        }
    }

    private function getConstellationsAroundCoordinates(array $constellations, array $coordinates) {
        $foundConstellations = [];
        for ($x = $coordinates[0]-1; $x <= $coordinates[0]+1; $x++) {
            for ($y = $coordinates[1]-1; $y <= $coordinates[1]+1; $y++) {
                if ($x != $coordinates[0] || $y != $coordinates[1]) {
                    $constellation = $this->array_find($constellations, fn($iConstellation) => $this->array_some($iConstellation->lines, fn($line) => 
                        $this->coordinatesInArray([$x, $y], $line)
                    ));
                    if ($constellation && !in_array($constellation->key, $foundConstellations)) {
                        $foundConstellations[] = $constellation->key;
                    }
                }
            }
        }

        return $foundConstellations;
    }

    private function calculatePlanetScore(PlayerScore &$playerScore, array $validConstellations, array $planet) {
        $planetConstellations = $this->getConstellationsAroundCoordinates($validConstellations, $planet);
        $playerScore->planets += count($planetConstellations);
    }

    private function calculatePlanetsScore(PlayerScore &$playerScore, array $validConstellations, array $planets) {
        foreach ($planets as $planet) {
            $this->calculatePlanetScore($playerScore, $validConstellations, $planet);
        }
    }

    private function calculateShootingStarsScore(PlayerScore &$playerScore, array $shootingStars) {
        foreach ($shootingStars as $shootingStar) {
            $playerScore->shootingStars += count($shootingStar->lines);
        }
    }

    private function findShape(array $allLines, array $shapeLines, array $ignoreLines, bool $allowLineReuse = false) {
        $shapesFound = [];
        $lines = array_values(array_filter($allLines, fn($line) => !$this->lineInArray($line, $ignoreLines)));

        for ($x = -2; $x <= 8; $x++) {
            for ($y = -2; $y <= 9; $y++) {
                for ($rotation = 0; $rotation <= 3; $rotation++) {
                    $shiftedLines = $this->shiftLines($shapeLines, $x, $y, $rotation);

                    if ($this->array_every($shiftedLines, fn($shapeLine) => $this->lineInArray($shapeLine, $lines))
                        && ($allowLineReuse || !$this->array_some($shiftedLines, fn($shiftedLine) => $this->array_some($shapesFound, fn($shapeFound) => $this->array_some($shapeFound, fn($line) => $this->sameLine($shiftedLine, $line)))))
                    ) {
                        if (!$this->array_some($shapesFound, fn($shapeFound) => $this->array_every($shiftedLines, fn($shiftedLine) => $this->lineInArray($shiftedLine, $shapeFound)))) { // ignore symetrical shape rotated on self
                            $shapesFound[] = $shiftedLines;
                        }
                    }
                }
            }
        }

        return $shapesFound;
    }

    private function calculateStar1Score(PlayerScore &$playerScore, array $lines) {
        $objective = $this->STAR1[intval($this->getGameStateValue(STAR1))];

        $shapesFound = $this->findShape($lines, $objective->lines, []);

        $playerScore->star1 += count($shapesFound) * $objective->points;
    }

    private function calculateStar2Score(PlayerScore &$playerScore, LatsPlayer $player, array $validConstellations, array $allConstellations) {
        $objective = $this->STAR2[intval($this->getGameStateValue(STAR2))];

        $points = 0;

        switch ($objective->power) {
            case POWER_GALAXY:
                $galaxies = array_merge($player->objects->galaxies, $player->roundObjects->galaxies);
                $playerScore->star2 += (2 * count($galaxies));
                break;
            case POWER_TWINKLING_STAR:
                $twinklingStars = array_merge($player->objects->twinklingStars, $player->roundObjects->twinklingStars);
                foreach ($twinklingStars as $twinklingStarStr) {
                    $twinklingStar = $this->coordinateStrToCoordinate($twinklingStarStr);
                    $twinklingStarConstellations = $this->getConstellationsAroundCoordinates($validConstellations, $twinklingStar);
                    if (count($twinklingStarConstellations) == 2) {
                        $playerScore->star2 += 3;
                    }
                }
                break;
            case POWER_NOVA:
                $novasStr = array_merge($player->objects->novas, $player->roundObjects->novas);
                $novas = array_map(fn($novaStr) => $this->coordinateStrToCoordinate($novaStr), $novasStr);

                for ($size = 9; $size <= 10; $size++) {
                    if ($this->array_some($allConstellations, fn($constellation) => $constellation->getSize() == $size && 
                        $this->array_some($constellation->lines, fn($line) => $this->array_some($novas, fn($nova) => $this->coordinatesInArray($nova, $line)))
                    )) {
                        $playerScore->star2 += $size;
                    }
                }
                break;
            case POWER_LUMINOUS_AURA: 
                $luminousAuras = array_merge($player->objects->luminousAuras, $player->roundObjects->luminousAuras);
                $playerScore->star2 += (2 * count($luminousAuras));
                break;
            case POWER_CRESCENT_MOON:
                $crescentMoons = array_merge($player->objects->crescentMoons, $player->roundObjects->crescentMoons);
                $crescentMoonConstellations = [];
                foreach ($crescentMoons as $crescentMoonStr) {
                    $crescentMoon = $this->coordinateStrToCoordinate($crescentMoonStr);
                    $axesCoordinates = [];
                    for ($x = 0; $x <= 9; $x++) {
                        $axesCoordinates[] = [$x, $crescentMoon[1]];
                    }
                    for ($y = 0; $y <= 10; $y++) {
                        $axesCoordinates[] = [$crescentMoon[0], $y];
                    }

                    foreach ($axesCoordinates as $coordinates) {
                        $constellation = $this->array_find($validConstellations, fn($iConstellation) => $this->array_some($iConstellation->lines, fn($line) => 
                            $this->coordinatesInArray($coordinates, $line)
                        ));
                        if ($constellation && !in_array($constellation->key, $crescentMoonConstellations)) {
                            $crescentMoonConstellations[] = $constellation->key;
                        }
                    }
                }

                $playerScore->star2 += count($crescentMoonConstellations);

                break;
            case POWER_BLACK_HOLE:
                $blackHoles = array_merge($player->objects->blackHoles, $player->roundObjects->blackHoles);
                foreach ($blackHoles as $blackHoleStr) {
                    $blackHole = $this->coordinateStrToCoordinate($blackHoleStr);
                    for ($x = $blackHole[0]-1; $x <= $blackHole[0]+1; $x++) {
                        for ($y = $blackHole[1]-1; $y <= $blackHole[1]+1; $y++) {
                            if ($x != $blackHole[0] || $y != $blackHole[1]) {
                                $coordinates = [$x, $y];
                                if ($this->isFreeCoordinates($coordinates, $player, 0, true)) {
                                    $playerScore->star2 += 1;
                                }
                            }
                        }
                    }
                }
                break;
        }

        $playerScore->star2 += $points;
    }

    private function getPlayerScore(LatsPlayer $player) {
        $playerScore = new PlayerScore();

        $lines = $player->getLines(true);

        $allConstellations = $this->getConstellations($lines);
        $validConstellations = $this->getValidConstellations($allConstellations, array_merge($player->objects->novas, $player->roundObjects->novas));

        $this->calculateConstellationsScore($playerScore, $validConstellations);
        $this->calculatePlanetsScore($playerScore, $validConstellations, $player->getPlanets(true));
        $this->calculateShootingStarsScore($playerScore, $player->getShootingStars(true));
        $this->calculateStar1Score($playerScore, $lines);
        $this->calculateStar2Score($playerScore, $player, $validConstellations, $allConstellations);
        
        $playerScore->calculateTotal();

        return $playerScore;
    }

    private function getPowerCurrentShape(LatsPlayer $player) {
        $objective = $this->STAR2[intval($this->getGameStateValue(STAR2))];

        // for unique usage powers
        if ((count($player->objects->shapesUsedForPower) > 0 || count($player->roundObjects->shapesUsedForPower) > 0) && in_array($objective->power, [
            POWER_BLACK_HOLE,
            POWER_CRESCENT_MOON,
        ])) {
            return [];
        }

        $allLines = $player->getLines(true);

        $ignoreLines = [];
        $shapesToIgnore = array_merge(
            $player->objects->shapesUsedForPower,
            $player->objects->shapesSkippedForPower,
            $player->roundObjects->shapesUsedForPower,
            $player->roundObjects->shapesSkippedForPower,
        );
        foreach($shapesToIgnore as $shapeToIgnore) {
            $ignoreLines = array_merge($ignoreLines, $shapeToIgnore);
        }
        $shapesFound = $this->findShape($allLines, $objective->lines, $ignoreLines);

        return $shapesFound;
    }

    function updateLiveScore(int $playerId) {
        if (intval($this->getGameStateValue(SCORING_OPTION)) != 2) {
            return;
        }
        
        $player = $this->getPlayer($playerId);
        $playerScore = $this->getPlayerScore($player);

        self::notifyAllPlayers('liveScore', '', [
            'playerId' => $playerId,
            'playerScore' => $playerScore,
        ]);
    }
}
