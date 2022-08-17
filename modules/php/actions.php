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

        $player = $this->getPlayer($playerId);
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

        $objective = $this->STAR2[intval($this->getGameStateValue(STAR2))];
        $allLines = $player->getLines(true);
        $shapesFound = $this->findShape($allLines, $objective->lines, $player->objects->linesUsedForPower);
        if (count($shapesFound) > 0) { // TODO ignore already applied
            $this->gamestate->nextPrivateState($playerId, 'place'.$objective->power);
        } else {
            $this->gamestate->nextPrivateState($playerId, 'confirm');
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

        $this->gamestate->nextPrivateState($playerId, 'confirm');
    }

    public function placeLine(int $xFrom, int $yFrom, int $xTo, int $yTo) {
        self::checkAction('placeLine'); 
        
        $playerId = intval($this->getCurrentPlayerId());

        $possibleLines = $this->getPossiblePositionsForLine($playerId);
        
        $fromStr = dechex($xFrom).dechex($yFrom);
        $toStr = dechex($xTo).dechex($yTo);

        if (!$this->array_some($possibleLines, fn($possibleLine) => $possibleLine == $fromStr.$toStr || $possibleLine == $toStr.$fromStr)) {
            throw new \BgaUserException("Invalid position");
        }

        $objective = $this->STAR2[intval($this->getGameStateValue(STAR2))];
        $player = $this->getPlayer($playerId);
        $allLines = $player->getLines(true);
        $shapesFound = $this->findShape($allLines, $objective->lines, $player->objects->linesUsedForPower);
        if (count($shapesFound) == 0) {
            throw new \BgaUserException("No valid shape for bonus");
        }

        $roundObjects = new Objects();
        $roundObjects->line = $fromStr.$toStr;
        $roundObjects->linesUsedForPower = $shapesFound[0];
        $this->DbQuery("UPDATE player SET `player_round_objects` = '".json_encode($roundObjects)."' WHERE `player_id` = $playerId");

        self::notifyAllPlayers('placedLines', '', [
            'playerId' => $playerId,
            'lines' => [$fromStr.$toStr],
        ]);

        $this->gamestate->nextPrivateState($playerId, 'confirm');
    }
    
    public function placePlanet(int $x, int $y) {
        self::checkAction('placePlanet'); 
        
        $playerId = intval($this->getCurrentPlayerId());
        $player = $this->getPlayer($playerId);
        $possibleCoordinates = $this->getFreeCoordinates($player);

        $coordinatesStr = dechex($x).dechex($y);
        if (!$this->array_some($possibleCoordinates, fn($possibleCoordinate) => $possibleCoordinate == $coordinatesStr)) {
            throw new \BgaUserException("Invalid position");
        }
        
        $objective = $this->STAR2[intval($this->getGameStateValue(STAR2))];
        $allLines = $player->getLines(true);
        $shapesFound = $this->findShape($allLines, $objective->lines, $player->objects->linesUsedForPower);
        if (count($shapesFound) == 0) {
            throw new \BgaUserException("No valid shape for bonus");
        }
        
        $roundObjects = new Objects();
        $roundObjects->planets = [
            $coordinatesStr
        ];
        $roundObjects->linesUsedForPower = $shapesFound[0];
        $this->DbQuery("UPDATE player SET `player_round_objects` = '".json_encode($roundObjects)."' WHERE `player_id` = $playerId");

        self::notifyAllPlayers('placedPlanet', '', [
            'playerId' => $playerId,
            'coordinates' => $coordinatesStr
        ]);

        $this->gamestate->nextPrivateState($playerId, 'confirm');
    }
    
    public function placeStar(int $x, int $y) {
        self::checkAction('placeStar'); 
        
        $playerId = intval($this->getCurrentPlayerId());
        $player = $this->getPlayer($playerId);
        $possibleCoordinates = $this->getFreeCoordinatesForStar($player);

        $coordinatesStr = dechex($x).dechex($y);
        if (!$this->array_some($possibleCoordinates, fn($possibleCoordinate) => $possibleCoordinate == $coordinatesStr)) {
            throw new \BgaUserException("Invalid position");
        }
        
        $objective = $this->STAR2[intval($this->getGameStateValue(STAR2))];
        $allLines = $player->getLines(true);
        $shapesFound = $this->findShape($allLines, $objective->lines, $player->objects->linesUsedForPower);
        if (count($shapesFound) == 0) {
            throw new \BgaUserException("No valid shape for bonus");
        }
        
        $roundObjects = $player->roundObjects;
        $roundObjects->stars[] = $coordinatesStr;
        $roundObjects->linesUsedForPower = $shapesFound[0];
        $this->DbQuery("UPDATE player SET `player_round_objects` = '".json_encode($roundObjects)."' WHERE `player_id` = $playerId");

        self::notifyAllPlayers('placedStar', '', [
            'playerId' => $playerId,
            'coordinates' => $coordinatesStr
        ]);

        $this->gamestate->nextPrivateState($playerId, count($roundObjects->stars) < 2 ? 'next' : 'confirm');
    }

    public function cancelPlaceShape() {
        $playerId = intval($this->getCurrentPlayerId());

        $this->DbQuery("UPDATE player SET `player_round_lines` = NULL WHERE `player_id` = $playerId");

        self::notifyAllPlayers('cancelPlacedLines', '', [
            'playerId' => $playerId,
        ]);

        $this->gamestate->setPlayersMultiactive([$playerId], 'next', false);
        $this->gamestate->initializePrivateState($playerId);
    }

    public function cancelBonus() {
        self::checkAction('cancelBonus'); 

        $playerId = intval($this->getCurrentPlayerId());

        $this->DbQuery("UPDATE player SET `player_round_objects` = NULL WHERE `player_id` = $playerId");

        self::notifyAllPlayers('cancelBonus', '', [
            'playerId' => $playerId,
        ]);

        $objective = $this->STAR2[intval($this->getGameStateValue(STAR2))];
        $this->gamestate->nextPrivateState($playerId, 'place'.$objective->power);
    }

    public function skipCard() {
        self::checkAction('skipCard'); 

        $playerId = intval($this->getCurrentPlayerId());

        // TODO notif?

        $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
    }

    public function skipBonus() {
        self::checkAction('skipBonus'); 

        $playerId = intval($this->getCurrentPlayerId());

        // TODO notif?

        $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
    }

    public function confirmTurn() {
        self::checkAction('confirmTurn'); 

        $playerId = intval($this->getCurrentPlayerId());

        // TODO notif?

        $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
    }
}
