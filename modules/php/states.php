<?php

require_once(__DIR__.'/objects/player-score.php');

trait StateTrait {

//////////////////////////////////////////////////////////////////////////////
//////////// Game state actions
////////////

    /*
        Here, you can create methods defined as "game state actions" (see "action" property in states.inc.php).
        The action method of state X is called everytime the current game state is set to X.
    */

    function stPlayCard() {
        $this->gamestate->setAllPlayersMultiactive();
        $this->gamestate->initializePrivateStateForAllActivePlayers(); 
    }

    function stNextShape() {
        $objective = $this->STAR2[intval($this->getGameStateValue(STAR2))];

        $players = $this->getPlayers();
        foreach ($players as $player) {
            $playerId = $player->id;

            // apply turn lines
            $allLines = array_merge($player->lines, $player->roundLines);
            if ($player->roundObjects->line !== null) {
                $allLines[] = $player->roundObjects->line;
            }
            $this->DbQuery("UPDATE player SET `player_round_lines` = NULL, `player_lines` = '".json_encode($allLines)."' WHERE `player_id` = $playerId");

            // apply turn objects
            $player->objects->shootingStars = array_merge($player->objects->shootingStars, $player->roundObjects->shootingStars);
            $player->objects->planets = array_merge($player->objects->planets, $player->roundObjects->planets);
            $player->objects->stars = array_merge($player->objects->stars, $player->roundObjects->stars);
            $player->objects->galaxies = array_merge($player->objects->galaxies, $player->roundObjects->galaxies);
            $player->objects->twinklingStars = array_merge($player->objects->twinklingStars, $player->roundObjects->twinklingStars);
            $player->objects->novas = array_merge($player->objects->novas, $player->roundObjects->novas);
            $player->objects->luminousAuras = array_merge($player->objects->luminousAuras, $player->roundObjects->luminousAuras);
            $player->objects->crescentMoons = array_merge($player->objects->crescentMoons, $player->roundObjects->crescentMoons);
            $player->objects->blackHoles = array_merge($player->objects->blackHoles, $player->roundObjects->blackHoles);
            $player->objects->linesUsedForPower = array_merge($player->objects->linesUsedForPower, $player->roundObjects->linesUsedForPower);
            $this->DbQuery("UPDATE player SET `player_round_objects` = NULL, `player_objects` = '".json_encode($player->objects)."' WHERE `player_id` = $playerId");

            $this->incStat(1, count($player->roundLines) > 0 ? 'playedCards' : 'skippedCards');
            $this->incStat(count($player->roundLines), 'placedLines');
            $this->incStat(count($player->roundLines), 'placedLines', $playerId);
            if ($player->roundObjects->line !== null || count($player->roundObjects->linesUsedForPower) > 0) {
                $this->incStat(1, 'usedBonus');
                $this->incStat(1, 'usedBonus', $playerId);
                $this->incStat(1, 'placed'.$objective->power, $playerId);
            }

            if (count($player->roundObjects->shootingStars) > 0) {
                $this->incStat(1, 'shootingStar'.count($player->roundObjects->shootingStars[0]->lines), $playerId);
            }
        }

        $discardedCard = $this->getCurrentCard(true);
        $this->shapes->moveCard($discardedCard->id, 'discard');
        self::notifyAllPlayers('discardShape', '', [
            'card' => $discardedCard,
        ]);

        if ($discardedCard->type == 1) {
            $this->incStat(1, 'shootingStars');
        }

        $remainingShapes = intval($this->shapes->countCardInLocation('piles'));

        if ($remainingShapes == 0) {
            $this->gamestate->nextState('endScore');
            return;
        }

        if ($remainingShapes % 6 == 0) {
            self::notifyAllPlayers('day', clienttranslate('A pile has been ended, day is rising!'), [
                'day' => $this->getDay(),
            ]);
        }

        $newCard = $this->getCurrentCard(true);

        self::notifyAllPlayers('newShape', clienttranslate('A new shape is revealed (${number} / 18)'), [
            'card' => $newCard,
            'number' => 19 - $remainingShapes
        ]);

        $this->gamestate->nextState('next');
    }

    private function scoreConstellations(int $playerId, PlayerScore &$playerScore) {
        $this->incPlayerScore($playerId, $playerScore->constellations);
        $this->notifyAllPlayers('scoreConstellations', clienttranslate('${player_name} scores ${points} points for ${scoring}'), [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
            'points' => $playerScore->constellations,
            'checkedConstellations' => $playerScore->checkedConstellations,
            'scoring' => clienttranslate('Constellations'),
            'i18n' => ['scoring'],
            'score' => $playerScore->constellations,
        ]);
    }

    private function scorePlanets(int $playerId, PlayerScore &$playerScore) {
        $this->incPlayerScore($playerId, $playerScore->planets);
        $this->notifyAllPlayers('scorePlanets', clienttranslate('${player_name} scores ${points} points for ${scoring}'), [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
            'points' => $playerScore->planets,
            'scoring' => clienttranslate('Planets'),
            'i18n' => ['scoring'],
            'score' => $playerScore->planets,
        ]);
    }

    private function scoreShootingStars(int $playerId, PlayerScore &$playerScore) {
        $this->incPlayerScore($playerId, $playerScore->shootingStars);
        $this->notifyAllPlayers('scoreShootingStars', clienttranslate('${player_name} scores ${points} points for ${scoring}'), [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
            'points' => $playerScore->shootingStars,
            'scoring' => clienttranslate('Shooting stars'),
            'i18n' => ['scoring'],
            'score' => $playerScore->shootingStars,
        ]);
    }

    private function scoreStar1(int $playerId, PlayerScore &$playerScore) {
        $this->incPlayerScore($playerId, $playerScore->star1);
        $this->notifyAllPlayers('scoreStar1', clienttranslate('${player_name} scores ${points} points for ${scoring}'), [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
            'points' => $playerScore->star1,
            'scoring' => '[star5]',
            'score' => $playerScore->star1,
        ]);
    }

    private function scoreStar2(int $playerId, PlayerScore &$playerScore) {
        $this->incPlayerScore($playerId, $playerScore->star2);
        $this->notifyAllPlayers('scoreStar2', clienttranslate('${player_name} scores ${points} points for ${scoring}'), [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
            'points' => $playerScore->star2,
            'scoring' => '[star7]',
            'score' => $playerScore->star2,
        ]);
    }

    function computeStats(LatsPlayer $player, PlayerScore $playerScore, int $objectivePoints) {
        $playerId = $player->id;

        $constellations = $this->getConstellations($player->getLines(true));

        $this->incStat(count($constellations), 'constellationsCount', $playerId);
        $this->incStat(count($playerScore->checkedConstellations), 'validConstellationsCount', $playerId);
        $this->incStat($playerScore->constellations, 'constellationsPoints', $playerId);  
        $this->incStat($playerScore->planets, 'planetsPoints', $playerId);  
        $this->incStat($playerScore->shootingStars, 'shootingStarsPoints', $playerId);  
        $this->incStat(round($playerScore->star1 / $objectivePoints), 'star1count', $playerId); 
        $this->incStat($playerScore->star1, 'star1points', $playerId);  
        $this->incStat($playerScore->star2, 'star2points', $playerId);
    }

    function stEndScore() {
        $players = $this->getPlayers();
        $objective = $this->STAR1[intval($this->getGameStateValue(STAR1))];

        foreach ($players as $player) {
            $playerScore = $this->getPlayerScore($player);

            $this->scoreConstellations($player->id, $playerScore);
            $this->scorePlanets($player->id, $playerScore);
            $this->scoreShootingStars($player->id, $playerScore);
            $this->scoreStar1($player->id, $playerScore);
            $this->scoreStar2($player->id, $playerScore);
            
            $playerScore->calculateTotal();

            $this->computeStats($player, $playerScore, $objective->points);
        }

        $this->gamestate->nextState('endGame');
    }
}
