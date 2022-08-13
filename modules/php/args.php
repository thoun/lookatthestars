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
   
    function argPlaceShape() {
        $currentShape = $this->getCurrentShape(false);
        $currentShapeStr = $this->getCurrentShape(true);

        $playersIds = $this->getPlayersIds();
        $possiblePositions = [];
        foreach($playersIds as $playerId) {
            $possiblePositions[$playerId] = $this->getPossiblePositions(
                $playerId, 
                $currentShape->lines, 
                true
            );
        }


        return [
            'currentShape' => $currentShapeStr,
            'possiblePositions' => $possiblePositions,
        ];
    }
    
}
