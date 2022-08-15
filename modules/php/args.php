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

    function argPlaceShapeForStandardShape(Card $currentCard, array $playersIds) {
        $possiblePositions = [];
        foreach($playersIds as $playerId) {
            $possiblePositions[$playerId] = $this->getPossiblePositions(
                $playerId, 
                $currentCard->lines, 
                true,
                true
            );
        }

        return [
            'shootingStar' => false,
            'currentCard' => Card::linesAsString($currentCard),
            'possiblePositions' => $possiblePositions,
        ];
    }

    function argPlaceShapeForShootingStar(array $playersIds) {
        $currentCardStr = $this->getCurrentCard(true);

        $possiblePositions = [];
        foreach($playersIds as $playerId) {
            $playerPossiblePositions = array_map(fn($shootingStar) => $this->getPossiblePositions(
                $playerId, 
                $shootingStar->lines, 
                true,
                false
            ), $this->SHOOTING_STAR_SIZES);

            $possiblePositions[$playerId] = $playerPossiblePositions;
        }

        return [
            'shootingStar' => true,
            'currentCard' => $currentCardStr,
            'possiblePositions' => $possiblePositions,
        ];
    }
   
    function argPlaceShape() {
        $currentCard = $this->getCurrentCard(false);
        $playersIds = $this->getPlayersIds();

        if ($currentCard->type == 1) {
            return $this->argPlaceShapeForShootingStar($playersIds);
        } else if ($currentCard->type == 2) {
            return $this->argPlaceShapeForStandardShape($currentCard, $playersIds);
        }
    }

    function argPlaceLine(int $playerId) {
        return [
            // TODO
        ];
    }
    
}
