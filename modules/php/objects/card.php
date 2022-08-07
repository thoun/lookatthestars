<?php

class CardType {
    public array $lines;
  
    public function __construct(array $lines) {
        $this->lines = $lines;
    } 
}
class Star1Type extends CardType {
    public int $points;
  
    public function __construct(int $points, array $lines) {
        $this->points = $points;
        $this->lines = $lines;
    } 
}
class Star2Type extends CardType {
    public int $power;
  
    public function __construct(int $power, array $lines) {
        $this->power = $power;
        $this->lines = $lines;
    } 
}

class Card extends CardType {
    public int $id;
    public int $type;
    public int $typeArg;

    public function __construct($dbCard, $SHAPES, bool $linesAsString) {
        $this->id = intval($dbCard['id']);
        $this->type = intval($dbCard['type']);
        if ($this->type == 1) {
        } else if ($this->type == 2) {
            $this->typeArg = intval($dbCard['type_arg']);
            $card = $SHAPES[$this->typeArg];
            $this->lines = $card->lines;

            if ($linesAsString) {
                $this->lines = array_map(fn($line) => dechex($line[0][0]).dechex($line[0][1]).dechex($line[1][0]).dechex($line[1][1]), $this->lines);
            }
        }
    } 

    public static function onlyId(Card $card) {
        return new Card([
            'id' => $card->id,
            'type' => null
        ], null, false);
    }

    public static function onlyIds(array $cards) {
        return array_map(fn($card) => self::onlyId($card), $cards);
    }
}
?>