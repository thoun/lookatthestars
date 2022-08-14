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
        
        $playerId = intval($this->getCurrentPlayerId());

        $card = $this->getCurrentShape(false);

        $possiblePositions = $this->getPossiblePositions(
            $playerId, 
            $card->lines, 
            true
        );
        if (!in_array($rotation, $possiblePositions[dechex($x + 1).dechex($y + 1)])) {
            throw new \BgaUserException("Invalid position");
        }

        $shiftedLines = $this->shiftLines($card->lines, $x, $y, $rotation);

        $newLines = [];
        foreach ($shiftedLines as $line) {
            $newLines[] = dechex($line[0][0]).dechex($line[0][1]).dechex($line[1][0]).dechex($line[1][1]);
        }
        $this->DbQuery("UPDATE player SET `player_round_lines` = '".json_encode($newLines)."' WHERE `player_id` = $playerId");

        self::notifyAllPlayers('placedLines', '', [
            'playerId' => $playerId,
            'lines' => $newLines,
        ]);

        $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
    }

    public function cancelPlaceShape() {
        $playerId = intval($this->getCurrentPlayerId());

        $this->DbQuery("UPDATE player SET `player_round_lines` = NULL WHERE `player_id` = $playerId");

        self::notifyAllPlayers('cancelPlacedLines', '', [
            'playerId' => $playerId,
        ]);

        $this->gamestate->setPlayersMultiactive([$playerId], 'next', false);
    }

    public function skipShape() {
        $playerId = intval($this->getCurrentPlayerId());

        // TODO notif?

        $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
    }
}
