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
        $positionKey = json_encode([$x, $y]);
        if (!in_array($rotation, $possiblePositions[$positionKey])) {
            throw new \BgaUserException("Invalid position");
        }

        $shiftedLines = $this->shiftLines($card->lines, $x, $y, $rotation);

        $newLines = [];
        foreach ($shiftedLines as $line) {
            $newLines[] = dechex($line[0][0]).dechex($line[0][1]).dechex($line[1][0]).dechex($line[1][1]);
        }
        $this->DbQuery("UPDATE player SET `player_round_lines` = '".json_encode($newLines)."' WHERE `player_id` = $playerId");
        $player->roundLines = $newLines;

        self::notifyAllPlayers('placedLines', '', [
            'playerId' => $playerId,
            'lines' => $newLines,
            'currentConstellations' => $this->getConstellations($player->getLines(true)),
        ]);
        $this->updateLiveScore($playerId);

        $shapesFound = $this->getPowerCurrentShape($player);
        if (count($shapesFound) > 0) {
            $objective = $this->STAR2[intval($this->getGameStateValue(STAR2))];
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
        $positionKey = json_encode([$x, $y]);
        if (!in_array($rotation, $possiblePositions[$positionKey])) {
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
        $this->updateLiveScore($playerId);

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

        $player = $this->getPlayer($playerId);
        $shapesFound = $this->getPowerCurrentShape($player);
        if (count($shapesFound) == 0) {
            throw new \BgaUserException("No valid shape for bonus");
        }

        $roundObjects = $player->roundObjects;
        $roundObjects->lines[] = $fromStr.$toStr;
        $roundObjects->shapesUsedForPower[] = $shapesFound[0];
        $this->DbQuery("UPDATE player SET `player_round_objects` = '".json_encode($roundObjects)."' WHERE `player_id` = $playerId");

        $player->roundObjects = $roundObjects;
        self::notifyAllPlayers('placedLines', '', [
            'playerId' => $playerId,
            'lines' => [$fromStr.$toStr],
            'currentConstellations' => $this->getConstellations($player->getLines(true)),
            'bonus' => true,
        ]);
        $this->updateLiveScore($playerId);

        $shapesFound = $this->getPowerCurrentShape($player);;
        if (count($shapesFound) == 0) {
            $this->gamestate->nextPrivateState($playerId, 'confirm');
        } else {
            $this->gamestate->nextPrivateState($playerId, 'next');
        }
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
        
        $shapesFound = $this->getPowerCurrentShape($player);
        if (count($shapesFound) == 0) {
            throw new \BgaUserException("No valid shape for bonus");
        }
        
        $roundObjects = $player->roundObjects;
        $roundObjects->planets[] = $coordinatesStr;
        $roundObjects->shapesUsedForPower[] = $shapesFound[0];
        $this->DbQuery("UPDATE player SET `player_round_objects` = '".json_encode($roundObjects)."' WHERE `player_id` = $playerId");

        self::notifyAllPlayers('placedPlanet', '', [
            'playerId' => $playerId,
            'coordinates' => $coordinatesStr
        ]);
        $this->updateLiveScore($playerId);

        $shapesFound = $this->getPowerCurrentShape($player);
        if (count($shapesFound) == 0) {
            $this->gamestate->nextPrivateState($playerId, 'confirm');
        } else {
            $this->gamestate->nextPrivateState($playerId, 'next');
        }
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
        
        $shapesFound = $this->getPowerCurrentShape($player);
        if (count($shapesFound) == 0) {
            throw new \BgaUserException("No valid shape for bonus");
        }
        
        $roundObjects = $player->roundObjects;
        $roundObjects->stars[] = $coordinatesStr;
        if (count($roundObjects->stars) % 2 != 1) {
            $roundObjects->shapesUsedForPower[] = $shapesFound[0];
        }
        $this->DbQuery("UPDATE player SET `player_round_objects` = '".json_encode($roundObjects)."' WHERE `player_id` = $playerId");

        self::notifyAllPlayers('placedStar', '', [
            'playerId' => $playerId,
            'coordinates' => $coordinatesStr
        ]);
        $this->updateLiveScore($playerId);

        if (count($roundObjects->stars) % 2 == 1) {
            $this->gamestate->nextPrivateState($playerId, 'next');
        } else {
            $shapesFound = $this->getPowerCurrentShape($player);
            if (count($shapesFound) == 0) {
                $this->gamestate->nextPrivateState($playerId, 'confirm');
            } else {
                $this->gamestate->nextPrivateState($playerId, 'next');
            }
        }
    }
    
    public function placeBlackHole(int $x, int $y) {
        self::checkAction('placeBlackHole'); 
        
        $playerId = intval($this->getCurrentPlayerId());
        $player = $this->getPlayer($playerId);
        $possibleCoordinates = $this->getFreeCoordinates($player);

        $coordinatesStr = dechex($x).dechex($y);
        if (!$this->array_some($possibleCoordinates, fn($possibleCoordinate) => $possibleCoordinate == $coordinatesStr)) {
            throw new \BgaUserException("Invalid position");
        }
        
        $shapesFound = $this->getPowerCurrentShape($player);
        if (count($shapesFound) == 0) {
            throw new \BgaUserException("No valid shape for bonus");
        }
        
        $roundObjects = $player->roundObjects;
        $roundObjects->blackHoles[] = $coordinatesStr;
        $roundObjects->shapesUsedForPower[] = $shapesFound[0];
        $this->DbQuery("UPDATE player SET `player_round_objects` = '".json_encode($roundObjects)."' WHERE `player_id` = $playerId");

        self::notifyAllPlayers('placedBlackHole', '', [
            'playerId' => $playerId,
            'coordinates' => $coordinatesStr
        ]);
        $this->updateLiveScore($playerId);

        $shapesFound = $this->getPowerCurrentShape($player);
        if (count($shapesFound) == 0) {
            $this->gamestate->nextPrivateState($playerId, 'confirm');
        } else {
            $this->gamestate->nextPrivateState($playerId, 'next');
        }
    }
    
    public function placeCrescentMoon(int $x, int $y) {
        self::checkAction('placeCrescentMoon'); 
        
        $playerId = intval($this->getCurrentPlayerId());
        $player = $this->getPlayer($playerId);
        $possibleCoordinates = $this->getFreeCoordinates($player);

        $coordinatesStr = dechex($x).dechex($y);
        if (!$this->array_some($possibleCoordinates, fn($possibleCoordinate) => $possibleCoordinate == $coordinatesStr)) {
            throw new \BgaUserException("Invalid position");
        }
        
        $shapesFound = $this->getPowerCurrentShape($player);
        if (count($shapesFound) == 0) {
            throw new \BgaUserException("No valid shape for bonus");
        }
        
        $roundObjects = $roundObjects = $player->roundObjects;
        $roundObjects->crescentMoons[] = $coordinatesStr;
        $roundObjects->shapesUsedForPower[] = $shapesFound[0];
        $this->DbQuery("UPDATE player SET `player_round_objects` = '".json_encode($roundObjects)."' WHERE `player_id` = $playerId");

        self::notifyAllPlayers('placedCrescentMoon', '', [
            'playerId' => $playerId,
            'coordinates' => $coordinatesStr
        ]);
        $this->updateLiveScore($playerId);

        $shapesFound = $this->getPowerCurrentShape($player);
        if (count($shapesFound) == 0) {
            $this->gamestate->nextPrivateState($playerId, 'confirm');
        } else {
            $this->gamestate->nextPrivateState($playerId, 'next');
        }
    }
    
    public function placeTwinklingStar(int $x, int $y) {
        self::checkAction('placeTwinklingStar'); 
        
        $playerId = intval($this->getCurrentPlayerId());
        $player = $this->getPlayer($playerId);
        $possibleCoordinates = $this->getFreeCoordinates($player);

        $coordinatesStr = dechex($x).dechex($y);
        if (!$this->array_some($possibleCoordinates, fn($possibleCoordinate) => $possibleCoordinate == $coordinatesStr)) {
            throw new \BgaUserException("Invalid position");
        }
        
        $shapesFound = $this->getPowerCurrentShape($player);
        if (count($shapesFound) == 0) {
            throw new \BgaUserException("No valid shape for bonus");
        }
        
        $roundObjects = $player->roundObjects;
        $roundObjects->twinklingStars[] = $coordinatesStr;
        $roundObjects->shapesUsedForPower[] = $shapesFound[0];
        $this->DbQuery("UPDATE player SET `player_round_objects` = '".json_encode($roundObjects)."' WHERE `player_id` = $playerId");

        self::notifyAllPlayers('placedTwinklingStar', '', [
            'playerId' => $playerId,
            'coordinates' => $coordinatesStr
        ]);
        $this->updateLiveScore($playerId);

        $shapesFound = $this->getPowerCurrentShape($player);
        if (count($shapesFound) == 0) {
            $this->gamestate->nextPrivateState($playerId, 'confirm');
        } else {
            $this->gamestate->nextPrivateState($playerId, 'next');
        }
    }
    
    public function placeGalaxy(int $x, int $y) {
        self::checkAction('placeGalaxy'); 
        
        $playerId = intval($this->getCurrentPlayerId());
        $player = $this->getPlayer($playerId);
        $possibleCoordinates = $this->argPlaceGalaxy($playerId)['possibleCoordinates'];

        $coordinatesStr = dechex($x).dechex($y);
        if (!$this->array_some($possibleCoordinates, fn($possibleCoordinate) => $possibleCoordinate == $coordinatesStr)) {
            throw new \BgaUserException("Invalid position");
        }
        
        $shapesFound = $this->getPowerCurrentShape($player);
        if (count($shapesFound) == 0) {
            throw new \BgaUserException("No valid shape for bonus");
        }
        
        $roundObjects = $roundObjects = $player->roundObjects;;
        $roundObjects->galaxies[] = $coordinatesStr;
        $roundObjects->shapesUsedForPower[] = $shapesFound[0];
        $this->DbQuery("UPDATE player SET `player_round_objects` = '".json_encode($roundObjects)."' WHERE `player_id` = $playerId");

        self::notifyAllPlayers('placedGalaxy', '', [
            'playerId' => $playerId,
            'coordinates' => $coordinatesStr
        ]);
        $this->updateLiveScore($playerId);

        $shapesFound = $this->getPowerCurrentShape($player);
        if (count($shapesFound) == 0) {
            $this->gamestate->nextPrivateState($playerId, 'confirm');
        } else {
            $this->gamestate->nextPrivateState($playerId, 'next');
        }
    }
    
    public function placeNova(int $x, int $y) {
        self::checkAction('placeNova'); 
        
        $playerId = intval($this->getCurrentPlayerId());
        $player = $this->getPlayer($playerId);
        $possibleCoordinates = $this->argPlaceNova($playerId)['possibleCoordinates'];

        $coordinatesStr = dechex($x).dechex($y);
        if (!$this->array_some($possibleCoordinates, fn($possibleCoordinate) => $possibleCoordinate == $coordinatesStr)) {
            throw new \BgaUserException("Invalid position");
        }
        
        $shapesFound = $this->getPowerCurrentShape($player);
        if (count($shapesFound) == 0) {
            throw new \BgaUserException("No valid shape for bonus");
        }
        
        $roundObjects = $player->roundObjects;
        $roundObjects->novas[] = $coordinatesStr;
        $roundObjects->shapesUsedForPower[] = $shapesFound[0];
        $this->DbQuery("UPDATE player SET `player_round_objects` = '".json_encode($roundObjects)."' WHERE `player_id` = $playerId");

        self::notifyAllPlayers('placedNova', '', [
            'playerId' => $playerId,
            'coordinates' => $coordinatesStr
        ]);
        $this->updateLiveScore($playerId);

        $shapesFound = $this->getPowerCurrentShape($player);
        if (count($shapesFound) == 0) {
            $this->gamestate->nextPrivateState($playerId, 'confirm');
        } else {
            $this->gamestate->nextPrivateState($playerId, 'next');
        }
    }
    
    public function placeLuminousAura(int $x, int $y) {
        self::checkAction('placeLuminousAura'); 
        
        $playerId = intval($this->getCurrentPlayerId());
        $player = $this->getPlayer($playerId);
        $possibleCoordinates = $this->argPlaceLuminousAura($playerId)['possibleCoordinates'];

        $coordinatesStr = dechex($x).dechex($y);
        if (!$this->array_some($possibleCoordinates, fn($possibleCoordinate) => $possibleCoordinate == $coordinatesStr)) {
            throw new \BgaUserException("Invalid position");
        }
        
        $shapesFound = $this->getPowerCurrentShape($player);
        if (count($shapesFound) == 0) {
            throw new \BgaUserException("No valid shape for bonus");
        }
        
        $roundObjects = $player->roundObjects;
        $roundObjects->luminousAuras[] = $coordinatesStr;
        $roundObjects->shapesUsedForPower[] = $shapesFound[0];
        $this->DbQuery("UPDATE player SET `player_round_objects` = '".json_encode($roundObjects)."' WHERE `player_id` = $playerId");

        self::notifyAllPlayers('placedLuminousAura', '', [
            'playerId' => $playerId,
            'coordinates' => $coordinatesStr
        ]);
        $this->updateLiveScore($playerId);

        $shapesFound = $this->getPowerCurrentShape($player);
        if (count($shapesFound) == 0) {
            $this->gamestate->nextPrivateState($playerId, 'confirm');
        } else {
            $this->gamestate->nextPrivateState($playerId, 'next');
        }
    }

    public function cancelPlaceShape() {
        $playerId = intval($this->getCurrentPlayerId());

        $this->DbQuery("UPDATE player SET `player_round_lines` = NULL, `player_round_objects` = NULL WHERE `player_id` = $playerId");

        $player = $this->getPlayer($playerId);
        self::notifyAllPlayers('cancelPlacedLines', '', [
            'playerId' => $playerId,
            'currentConstellations' => $this->getConstellations($player->getLines(true)),
        ]);
        $this->updateLiveScore($playerId);

        $this->gamestate->setPlayersMultiactive([$playerId], 'next', false);
        $this->gamestate->initializePrivateState($playerId);
    }

    public function cancelBonus() {
        self::checkAction('cancelBonus'); 

        $playerId = intval($this->getCurrentPlayerId());

        $this->DbQuery("UPDATE player SET `player_round_objects` = NULL WHERE `player_id` = $playerId");

        $player = $this->getPlayer($playerId);
        self::notifyAllPlayers('cancelBonus', '', [
            'playerId' => $playerId,
            'currentConstellations' => $this->getConstellations($player->getLines(true)),
        ]);
        $this->updateLiveScore($playerId);

        $objective = $this->STAR2[intval($this->getGameStateValue(STAR2))];
        $this->gamestate->nextPrivateState($playerId, 'place'.$objective->power);
    }

    public function skipCard() {
        self::checkAction('skipCard'); 

        $playerId = intval($this->getCurrentPlayerId());

        $this->gamestate->nextPrivateState($playerId, 'confirm');
    }

    public function skipBonus() {
        self::checkAction('skipBonus'); 

        $playerId = intval($this->getCurrentPlayerId());

        $player = $this->getPlayer($playerId);
        $player->roundObjects->shapesSkippedForPower = array_merge($player->roundObjects->shapesSkippedForPower, $this->getPowerCurrentShape($player));
        $this->DbQuery("UPDATE player SET `player_round_objects` = '".json_encode($player->roundObjects)."' WHERE `player_id` = $playerId");

        $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
    }

    public function confirmTurn() {
        self::checkAction('confirmTurn'); 

        $playerId = intval($this->getCurrentPlayerId());

        $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
        self::giveExtraTime($playerId);
    }
}
