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

        $shiftedLines = $this->shiftLines($card->lines, $x, $y, $rotation);

        $newLines = [];
        foreach ($shiftedLines as $line) {
            $newLines[] = dechex($line[0][0]).dechex($line[0][1]).dechex($line[1][0]).dechex($line[1][1]);
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
