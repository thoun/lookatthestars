<?php

require_once(__DIR__.'/objects/shape.php');
require_once(__DIR__.'/objects/player.php');

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

    function getCurrentShape(bool $linesAsString) {
        $shape = $this->getCardFromDb($this->shapes->getCardOnTop('piles'), $linesAsString);
        return $linesAsString ? Card::linesAsString($shape) : $shape;
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

    function isPossiblePosition(array $shiftedLines, Sheet $playerSheet, array $placedLines) {
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

        return true;
    }

    function getPossiblePositions(int $playerId, array $shapeLines, bool $keysAsString) {
        $player = $this->getPlayer($playerId);
        //$this->debug([$playerId, $player]);
        $playerSheet = $this->SHEETS[$player->sheet];
        $placedLines = array_merge(
            array_map(fn($lineStr) => [[hexdec($lineStr[0]), hexdec($lineStr[1])], [hexdec($lineStr[2]), hexdec($lineStr[3])]], $player->lines),
            $playerSheet->lines
        );
        $result = [];

        for ($x = 0; $x <= 6; $x++) {
            for ($y = 0; $y <= 7; $y++) {
                $key = $keysAsString ? dechex($x).dechex($y) : [$x, $y];
                $possibleRotationsForPosition = [];
                for ($rotation = 0; $rotation <= 3; $rotation++) {
                    $shiftedLines = $this->shiftLines($shapeLines, $x, $y, $rotation);
                    if ($this->isPossiblePosition(
                        $shiftedLines,
                        $playerSheet,
                        $placedLines
                    )) {
                        $possibleRotationsForPosition[] = $rotation;
                    }
                }
                $result[$key] = $possibleRotationsForPosition;
            }
        }
        return $result;
    }
}
