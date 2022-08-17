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
            $player->objects->linesUsedForPower = array_merge($player->objects->linesUsedForPower, $player->roundObjects->linesUsedForPower);
            $this->DbQuery("UPDATE player SET `player_round_objects` = NULL, `player_objects` = '".json_encode($player->objects)."' WHERE `player_id` = $playerId");
        }

        $discardedCard = $this->getCurrentCard(true);
        $this->shapes->moveCard($discardedCard->id, 'discard');
        self::notifyAllPlayers('discardShape', '', [
            'card' => $discardedCard,
        ]);

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

        self::notifyAllPlayers('newShape', clienttranslate('A new shape is revealed'), [
            'card' => $newCard,
        ]);

        $this->gamestate->nextState('next');
    }

    /*function computeStats(int $playerId) {
        $scoreSheets = $this->getScoreSheets($playerId, $this->getPlacedRoutes($playerId), $this->getCommonObjectives(), true);
        $scoreSheet = $scoreSheets->validated;
        
        $this->setStat(count(array_filter($scoreSheet->commonObjectives->subTotals, fn($subTotal) => $subTotal == 10)), 'commonObjectivesFirst', $playerId);
        $this->setStat(count(array_filter($scoreSheet->commonObjectives->subTotals, fn($subTotal) => $subTotal == 6)), 'commonObjectivesSecond', $playerId);
        $this->setStat($scoreSheet->personalObjective->total > 0 ? 1 : 0, 'personalObjectives', $playerId);
        $this->setStat($scoreSheet->oldLadies->total, 'finalScoreOldLadies', $playerId);
        $this->setStat($scoreSheet->students->total, 'finalScoreStudents', $playerId);
        $this->setStat($scoreSheet->tourists->total, 'finalScoreTourists', $playerId);
        $this->setStat($scoreSheet->businessmen->total, 'finalScoreBusinessmen', $playerId);
        if ($scoreSheet->oldLadies->checked > 0) {
            $this->setStat((float)$scoreSheet->oldLadies->total / (float)$scoreSheet->oldLadies->checked, 'averagePointsByCheckedOldLadies', $playerId);
        }
        $checkedStudents = $scoreSheet->students->checkedStudents + $scoreSheet->students->checkedInternships;
        if ($checkedStudents > 0) {
            $this->setStat((float)$scoreSheet->students->total / (float)$checkedStudents, 'averagePointsByCheckedStudents', $playerId);
        }
        $checkedTourists = 0;
        foreach ($scoreSheet->tourists->checkedTourists as $checkedTourist) {
            $checkedTourists += $checkedTourist;
        }
        if ($checkedTourists > 0) {
            $this->setStat((float)$scoreSheet->tourists->total / (float)$checkedTourists, 'averagePointsByCheckedTourists', $playerId);
        }
        $checkedBusinessmen = 0;
        foreach ($scoreSheet->businessmen->checkedBusinessmen as $checkedBusinessman) {
            $checkedBusinessmen += $checkedBusinessman;
        }
        if ($checkedBusinessmen > 0) {
            $this->setStat((float)$scoreSheet->businessmen->total / (float)$checkedBusinessmen, 'averagePointsByCheckedBusinessmen', $playerId);
        }
    }*/

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
            'scoring' => clienttranslate('[star5]'),
            'i18n' => ['scoring'],
            'score' => $playerScore->star1,
        ]);
    }

    private function scoreStar2(int $playerId, PlayerScore &$playerScore) {
        $this->incPlayerScore($playerId, $playerScore->star2);
        $this->notifyAllPlayers('scoreStar2', clienttranslate('${player_name} scores ${points} points for ${scoring}'), [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
            'points' => $playerScore->star2,
            'scoring' => clienttranslate('[star7]'),
            'i18n' => ['scoring'],
            'score' => $playerScore->star2,
        ]);
    }

    function stEndScore() {
        $players = $this->getPlayers();
        foreach ($players as $player) {
            $playerScore = $this->getPlayerScore($player);

            $this->scoreConstellations($player->id, $playerScore);
            $this->scorePlanets($player->id, $playerScore);
            $this->scoreShootingStars($player->id, $playerScore);
            $this->scoreStar1($player->id, $playerScore);
            $this->scoreStar2($player->id, $playerScore);
            
            $playerScore->calculateTotal();

            //$this->computeStats($playerId);
        }

        $this->gamestate->nextState('endGame');
    }
}
