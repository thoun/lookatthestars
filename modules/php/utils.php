<?php

require_once(__DIR__.'/objects/shape.php');

trait UtilTrait {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Utility functions
    ////////////

    function array_find(array $array, callable $fn) {
        foreach ($array as $value) {
            if($fn($value)) {
                return $value;
            }
        }
        return null;
    }

    function array_find_key(array $array, callable $fn) {
        foreach ($array as $key => $value) {
            if($fn($value)) {
                return $key;
            }
        }
        return null;
    }

    function array_some(array $array, callable $fn) {
        foreach ($array as $value) {
            if($fn($value)) {
                return true;
            }
        }
        return false;
    }
    
    function array_every(array $array, callable $fn) {
        foreach ($array as $value) {
            if(!$fn($value)) {
                return false;
            }
        }
        return true;
    }

    function array_identical(array $a1, array $a2) {
        if (count($a1) != count($a2)) {
            return false;
        }
        for ($i=0;$i<count($a1);$i++) {
            if ($a1[$i] != $a2[$i]) {
                return false;
            }
        }
        return true;
    }

    function getPlayersIds() {
        return array_keys($this->loadPlayersBasicInfos());
    }

    function getPlayerName(int $playerId) {
        return self::getUniqueValueFromDB("SELECT player_name FROM player WHERE player_id = $playerId");
    }

    function getPlayer(int $id) {
        $sql = "SELECT * FROM player WHERE player_id = $id";
        $dbResults = $this->getCollectionFromDb($sql);
        return array_map(fn($dbResult) => new Player($dbResult), array_values($dbResults))[0];
    }

    function getPlayers() {
        $sql = "SELECT * FROM player ORDER BY player_no";
        $dbResults = $this->getCollectionFromDb($sql);
        return array_map(fn($dbResult) => new Player($dbResult), array_values($dbResults));
    }

    function getCardFromDb(/*array|null*/ $dbCard, bool $linesAsString) {
        if ($dbCard == null) {
            return null;
        }
        return new CARD($dbCard, $this->SHAPES, $linesAsString);
    }

    function getCardsFromDb(array $dbCards, bool $linesAsString) {
        return array_map(fn($dbCard) => $this->getCardFromDb($dbCard, $linesAsString), array_values($dbCards));
    }

    function setupCards() {
        $shapes = [
            [ 'type' => 1, 'type_arg' => null, 'nbr' => 3 ] // shooting stars
        ];
        // shapes
        foreach ($this->SHAPES as $typeArg => $shape) {
            $shapes[] = [ 'type' => 2, 'type_arg' => $typeArg, 'nbr' => 1 ];
        }
        $this->shapes->createCards($shapes, 'deck');
        $this->shapes->shuffle('deck');
        for ($i=1; $i<=18; $i++) {
            $this->shapes->pickCardForLocation('deck', 'piles', $i);
        }
    }

    function setupObjectives() {
        $default = $this->getGameStateValue(OBJECTIVES) == '1';

        $star1 = $default ? 2 : bga_rand(0, 9);
        $star2 = $default ? 3 : bga_rand(0, 8);
        
        $this->setGameStateInitialValue(STAR1, $star1);
        $this->setGameStateInitialValue(STAR2, $star2);
    }

    function getCurrentShape(bool $linesAsString) {
        $shape = $this->getCardFromDb($this->shapes->getCardOnTop('piles'), $linesAsString);
        return $shape;
    }
}
