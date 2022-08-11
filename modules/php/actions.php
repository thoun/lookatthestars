<?php

trait ActionTrait {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Player actions
    //////////// 
    
    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in nicodemus.action.php)
    */

    public function placeShape(int $x, int $y, int $rotation) {
        self::checkAction('placeShape'); 
        
        $playerId = self::getCurrentPlayerId();

        $card = $this->getCurrentShape(false);

        $rotatedLines = json_decode(json_encode($card->lines), true);
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

        /*$mapElements = $this->MAP_POSITIONS[$this->getMap()][$position];
        $ticketNumber = $this->array_find($mapElements, fn($element) => $element >= 1 && $element <= 12);

        if ($ticketNumber === null || !$this->array_some($tickets, fn($ticket) => $ticket->type == $ticketNumber)) {
            throw new BgaUserException("Invalid departure");
        }

        $this->DbQuery("UPDATE player SET `player_departure_position` = $position WHERE `player_id` = $playerId");
        
        self::notifyAllPlayers('log', clienttranslate('${player_name} has chose the position for its departure pawn'), [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
        ]);*/

        $newLines = [];
        foreach ($rotatedLines as $line) {
            $newLines[] = dechex($x + $line[0][0]).dechex($y + $line[0][1]).dechex($x + $line[1][0]).dechex($y + $line[1][1]);
        }

        $json_obj = $this->getUniqueValueFromDB("SELECT `player_lines` FROM `player` where `player_id` = $playerId");
        $playerLines = $json_obj ? json_decode($json_obj, true) : [];

        $allLines = array_merge($playerLines, $newLines);
        $this->DbQuery("UPDATE player SET `player_lines` = '".json_encode($allLines)."' WHERE `player_id` = $playerId");

        $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
    }

    public function cancelPlaceShape() {
        $playerId = intval($this->getCurrentPlayerId());

        // TODO

        $this->gamestate->setPlayersMultiactive([$playerId], 'next', false);
    }

    public function skipShape() {
        $playerId = intval($this->getCurrentPlayerId());

        // TODO

        $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
    }
}
