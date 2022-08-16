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

    function argConfirmTurn(int $playerId) {
        $bonusPlayed = $this->getUniqueValueFromDB("SELECT player_round_objects FROM player WHERE player_id = $playerId") != null;

        return [
            'canCancelBonus' => $bonusPlayed,
        ];
    }
    
}
