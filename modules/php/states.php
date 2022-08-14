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

    function stPlaceShape() {
        $this->gamestate->setAllPlayersMultiactive();
    }

    function stNextShape() {
        $remainingShapes = intval($this->shapes->countCardInLocation('deck'));

        if ($remainingShapes == 0) {
            $this->gamestate->nextState('endScore');
            return;
        }

        if ($remainingShapes % 6 == 0) {
            self::notifyAllPlayers('log', clienttranslate('A pile has been ended, day is rising!'), []);
        }

        $discardedCard = $this->getCurrentShape(true);
        $this->shapes->moveCard($discardedCard->id, 'discard');
        self::notifyAllPlayers('discardShape', '', [
            'card' => $discardedCard,
        ]);

        $newCard = $this->getCurrentShape(true);

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

    private function scoreConstellations(int $playerId, PlayerScore &$playerScore, array $constellations) {
        for ($size = 3; $size <=8; $size++) {
            if ($this->array_some($constellations, fn($constellation) => $constellation->getSize() == $size)) {
                $playerScore->checkedConstellations[] = $size;
                $playerScore->constellations += $size;
            }
        }

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

    private function scorePlanet(PlayerScore &$playerScore, array $constellations, array $planet) {
        $planetConstellations = [];
        for ($x = $planet[0]-1; $x <= $planet[0]+1; $x++) {
            for ($y = $planet[1]-1; $y <= $planet[1]+1; $y++) {
                if ($x != 0 || $y != 0) {
                    $coordinates = [$x, $y];
                    $constellation = $this->array_find($constellations, fn($iConstellation) => $this->array_some($iConstellation->lines, fn($line) => 
                        $this->coordinatesInArray($coordinates, $line)
                    ));
                    if (!in_array($constellation->key, $planetConstellations)) {
                        $planetConstellations[] = $constellation->key;
                    }
                }
            }
        }

        $playerScore->planets += count($planetConstellations);
    }

    private function scorePlanets(int $playerId, PlayerScore &$playerScore, array $constellations, array $planets) {
        foreach ($planets as $planet) {
            $this->scorePlanet($playerScore, $constellations, $planet);
        }

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

    function stEndScore() {
        $players = $this->getPlayers();
        foreach ($players as $player) {
            $playerScore = new PlayerScore();
            $constellations = $this->getConstellations($player->lines);

            $this->scoreConstellations($player->id, $playerScore, $constellations);
            $this->scorePlanets($player->id, $playerScore, $constellations, $this->SHEETS[$player->sheet]->planets);
            // TODO Shooting star
            // TODO star1
            // TODO star2
            
            $playerScore->calculateTotal();

            //$this->computeStats($playerId);
        }

        $this->gamestate->nextState('endGame');
    }
}
