<?php

class CardType {
    public array $lines;
  
    public function __construct(array $lines) {
        $this->lines = $lines;
    } 
}

class Card extends CardType {
    public int $id;

    public function __construct($dbCard, $CARDS) {
        $this->id = intval($dbCard['id']);
        $type = intval($dbCard['type']);
        if ($type == 1) {
            $this->shootingStar = true;
        } else if ($type == 2) {
            $typeArg = intval($dbCard['type_arg']);
            $card = $CARDS[$typeArg];
            $this->lines = $card->lines;
        }
    } 

    public static function onlyId(Card $card) {
        return new Card([
            'id' => $card->id,
            'type' => null
        ], null);
    }

    public static function onlyIds(array $cards) {
        return array_map(fn($card) => self::onlyId($card), $cards);
    }
}
?>