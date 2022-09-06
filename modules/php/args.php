<?php

trait ArgsTrait {
    
//////////////////////////////////////////////////////////////////////////////
//////////// Game state arguments
////////////

    /*
        Here, you can create methods defined as "game state arguments" (see "args" property in states.inc.php).
        These methods function is to return some additional information that is specific to the current
        game state.
    */

    function argPlaceShapeForStandardShape(int $playerId, Card $currentCard) {
        $possiblePositions = $this->getPossiblePositions(
            $playerId, 
            $currentCard->lines, 
            true
        );

        return [
            'shootingStar' => false,
            'currentCard' => Card::linesAsString($currentCard),
            'possiblePositions' => $possiblePositions,
        ];
    }

    function argPlaceShapeForShootingStar(int $playerId) {
        $currentCardStr = $this->getCurrentCard(true);

        $possiblePositions = array_map(fn($shootingStar) => $this->getPossiblePositions(
            $playerId, 
            $shootingStar->lines, 
            false
        ), $this->SHOOTING_STAR_SIZES);

        return [
            'shootingStar' => true,
            'currentCard' => $currentCardStr,
            'possiblePositions' => $possiblePositions,
        ];
    }
   
    function argPlaceShape(int $playerId) {
        $currentCard = $this->getCurrentCard(false);

        if ($currentCard->type == 1) {
            return $this->argPlaceShapeForShootingStar($playerId);
        } else if ($currentCard->type == 2) {
            return $this->argPlaceShapeForStandardShape($playerId, $currentCard);
        }
    }

    function argPlaceLine(int $playerId) {
        $possibleLines = $this->getPossiblePositionsForLine($playerId);

        return [
            'possibleLines' => $possibleLines,
        ];
    }

    function argPlacePlanet(int $playerId) {
        $possibleCoordinates = $this->getFreeCoordinates($this->getPlayer($playerId));

        return [
            'possibleCoordinates' => $possibleCoordinates,
        ];
    }

    function argPlaceStar(int $playerId) {
        $player = $this->getPlayer($playerId);
        $possibleCoordinates = $this->getFreeCoordinatesForStar($player);

        return [
            'possibleCoordinates' => $possibleCoordinates,
            'number' => count($player->roundObjects->stars) + 1,
        ];
    }

    function argConfirmTurn(int $playerId) {
        $bonusPlayed = $this->getUniqueValueFromDB("SELECT player_round_objects FROM player WHERE player_id = $playerId") != null;

        return [
            'canCancelBonus' => $bonusPlayed,
        ];
    }

    function argPlaceGalaxy(int $playerId) {
        $player = $this->getPlayer($playerId);
        $currentConstellations = $this->getConstellations($player->getLines(true));
        $shapesFound = $this->getPowerCurrentShape($player);
        $shapeFound = $shapesFound[0];
        $constellations = array_values(array_filter($currentConstellations, fn($constellation) => $this->array_some($shapeFound, fn($shapeLine) => $this->lineInArray($shapeLine, $constellation->lines))));
        $constellationsCoordinates = [];
        foreach($constellations as $constellation) {
            foreach($constellation->lines as $line) {
                foreach($line as $lineCoordinate) {
                    if (!$this->coordinatesInArray($lineCoordinate, $constellationsCoordinates))
                    $constellationsCoordinates[] = $lineCoordinate;
                }
            }
        }

        $day = $this->getDay();

        $possibleCoordinates = [];

        foreach($constellationsCoordinates as $coordinate) {
            for ($x = $coordinate[0]-1; $x <= $coordinate[0]+1; $x++) {
                for ($y = $coordinate[1]-1; $y <= $coordinate[1]+1; $y++) {
                    if ($this->isFreeCoordinates(
                        [$x, $y],
                        $player,
                        $day
                    )) {
                        // with star to the left
                        if ($this->isFreeCoordinates(
                            [$x - 1, $y],
                            $player,
                            $day
                        )) {
                            $coordinateStr = dechex($x - 1).dechex($y);
                            if (!in_array($coordinateStr, $possibleCoordinates)) {
                                $possibleCoordinates[] = $coordinateStr;
                            }
                        }
                        // with star to the right
                        if ($this->isFreeCoordinates(
                            [$x + 1, $y],
                            $player,
                            $day
                        )) {
                            $coordinateStr = dechex($x).dechex($y);
                            if (!in_array($coordinateStr, $possibleCoordinates)) {
                                $possibleCoordinates[] = $coordinateStr;
                            }
                        }
                    }
                }
            }
        }


        return [
            'possibleCoordinates' => $possibleCoordinates,
        ];

    }

    function argPlaceNova(int $playerId) {
        $player = $this->getPlayer($playerId);
        $currentConstellations = $this->getConstellations($player->getLines(true));

        $possibleCoordinates = [];

        foreach($currentConstellations as $constellation) {
            foreach($constellation->lines as $line) {
                foreach($line as $lineCoordinate) {
                    $coordinateStr = dechex($lineCoordinate[0]).dechex($lineCoordinate[1]);
                    if (!in_array($coordinateStr, $possibleCoordinates)) {
                        $possibleCoordinates[] = $coordinateStr;
                    }
                }
            }
        }

        return [
            'possibleCoordinates' => $possibleCoordinates,
        ];

    }
    
}
