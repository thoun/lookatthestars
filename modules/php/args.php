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
   
    function argPlaceDeparturePawn() {
        $privateArgs = [];
        $playersIds = $this->getPlayersIds();

        $mapPositions = $this->MAP_POSITIONS[$this->getMap()];

        foreach($playersIds as $playerId) {
            $ticketsCards = $this->getCardsFromDb($this->tickets->getCardsInLocation('hand', $playerId));
            $ticketsNumbers = array_map(fn($ticket) => $ticket->type, $ticketsCards);
            $positions = array_map(fn($ticketNumber) => $this->array_find_key($mapPositions, fn($mapPosition) => $this->array_some($mapPosition, fn($element) => $element == $ticketNumber)), $ticketsNumbers);
            $privateArgs[$playerId] = [
                'tickets' => $ticketsNumbers,
                'positions' => $positions,
            ];
        }
    
        return [
            '_private' => $privateArgs,
        ];
    }
   
    function argPlaceRoute() {
        $playerId = intval(self::getActivePlayerId());

        $allPlacedRoutes = $this->getPlacedRoutes();
        $playerPlacedRoutes = array_filter($allPlacedRoutes, fn($placedRoute) => $placedRoute->playerId === $playerId);
        $currentPosition = $this->getCurrentPosition($playerId, $playerPlacedRoutes);
        $turnShape = $this->getPlayerTurnShape($playerId);
        $possibleRoutes = $this->getPossibleRoutes($playerId, $this->getMap(), $turnShape, $currentPosition, $allPlacedRoutes);
        $canConfirm = count($possibleRoutes) === 0;
        $canCancel = count($playerPlacedRoutes) > 0 && !end($playerPlacedRoutes)->validated;

        $stepNumber = count(array_filter($playerPlacedRoutes, fn($placedRoute) => !$placedRoute->validated)) + 1;
        $shapeLength = count($turnShape);
        $stepNumber = $canConfirm ? 0 : min($stepNumber, $shapeLength + 1);
    
        return [
            'currentPosition' => $currentPosition,
            'possibleRoutes' => $possibleRoutes,
            'canConfirm' => $canConfirm,
            'canCancel' => $canCancel,
            'shape' => $turnShape,
            'step' => $stepNumber,
        ];
    }
    
}
