<?php

trait ActionTrait {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Player actions
    //////////// 
    
    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in lookatthestars.action.php)
    */

    public function placeShape(int $x, int $y, int $rotation) {
        self::checkAction('placeShape'); 
        
        $playerId = intval($this->getCurrentPlayerId());

        $card = $this->getCurrentCard(false);
        if ($card->type != 2) {
            throw new \BgaUserException("Current card is not a standard shape");
        }

        $possiblePositions = $this->getPossiblePositions(
            $playerId, 
            $card->lines, 
            true,
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

        $objective = $this->STAR2[intval($this->getGameStateValue(STAR2))];

        $player = $this->getPlayer($playerId);
        $allLines = $this->linesStrToLines(array_merge(
            $player->lines,
            $player->roundLines
        ));
        $shapesFound = $this->findShape($allLines, $objective->lines);
        if (count($shapesFound) > 0) { // TODO ignore already applied
            $this->gamestate->nextPrivateState($playerId, 'place'.$objective->power);
        } else {
            $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
        }
    }

    public function placeShootingStar(int $x, int $y, int $rotation, int $size) {
        self::checkAction('placeShootingStar'); 
        
        $playerId = intval($this->getCurrentPlayerId());

        $card = $this->getCurrentCard(false);
        if ($card->type != 1) {
            throw new \BgaUserException("Current card is not a shooting star");
        }

        $shootingStar = $this->SHOOTING_STAR_SIZES[$size];

        $possiblePositions = $this->getPossiblePositions(
            $playerId, 
            $shootingStar->lines, 
            true,
            false
        );
        if (!in_array($rotation, $possiblePositions[dechex($x + 1).dechex($y + 1)])) {
            throw new \BgaUserException("Invalid position");
        }

        

        $shiftedLines = $this->shiftLines($shootingStar->lines, $x, $y, $rotation);
        $shiftedHead = $this->shiftCoordinates($shootingStar->head, $x, $y, $rotation);

        $newLines = [];
        foreach ($shiftedLines as $line) {
            $newLines[] = dechex($line[0][0]).dechex($line[0][1]).dechex($line[1][0]).dechex($line[1][1]);
        }
        $headStr = dechex($shiftedHead[0]).dechex($shiftedHead[1]);
        
        $roundObjects = new Objects();
        $roundObjects->shootingStars = [
            new ShootingStarType($newLines, $headStr)
        ];
        $this->DbQuery("UPDATE player SET `player_round_objects` = '".json_encode($roundObjects)."' WHERE `player_id` = $playerId");

        self::notifyAllPlayers('placedShootingStar', '', [
            'playerId' => $playerId,
            'lines' => $newLines,
            'head' => $headStr
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

    public function skipCard() {
        $playerId = intval($this->getCurrentPlayerId());

        // TODO notif?

        $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
    }

    public function skipBonus() {
        $playerId = intval($this->getCurrentPlayerId());

        // TODO notif?

        $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
    }
}
