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

    function getCardFromDb(/*array|null*/ $dbCard) {
        if ($dbCard == null) {
            return null;
        }
        return new CARD($dbCard, $this->CARDS);
    }

    function getCardsFromDb(array $dbCards) {
        return array_map(fn($dbCard) => $this->getCardFromDb($dbCard), array_values($dbCards));
    }

    function setupCards() {
        $shapes = [
            [ 'type' => 1, 'type_arg' => null, 'nbr' => 3 ] // shooting stars
        ];
        // shapes
        foreach ($this->CARDS as $typeArg => $card) {
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


        $star1 = $default ? 3 : bga_rand(1, 10);
        $star2 = $default ? 4 : bga_rand(1, 9);
        
        $this->setGameStateInitialValue(STAR1, $star1);
        $this->setGameStateInitialValue(STAR2, $star2);
    }

    function getCurrentShape() {
        $shape = $this->getCardFromDb($this->shapes->getCardOnTop('piles'));
        return $shape;
    }
}
