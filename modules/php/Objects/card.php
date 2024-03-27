<?php

class CardType {
    public array $lines = [];
  
    public function __construct(array $lines) {
        $this->lines = $lines;
    } 

    protected static function clone(/*CardType*/ $card) {
        $clone = new stdClass();
        $clone->lines = $card->lines;
        return $clone;
    }

    public static function linesAsString($cardOrCards) {
        if (gettype($cardOrCards) == 'array') {
            return array_map(fn($card) => self::linesAsString($card), $cardOrCards);
            return array_map(fn($card) => self::linesAsString($card), $cardOrCards);
        }
        $newCard = self::clone($cardOrCards);
        $newCard->lines = array_map(fn($line) => dechex($line[0][0]).dechex($line[0][1]).dechex($line[1][0]).dechex($line[1][1]), $newCard->lines);
        return $newCard;
    }

    public static function linesAsArray($cardOrCards) {
        if (gettype($cardOrCards) == 'array') {
            return array_map(fn($card) => self::linesAsArray($card), $cardOrCards);
            return array_map(fn($card) => self::linesAsArray($card), $cardOrCards);
        }
        $newCard = self::clone($cardOrCards);
        $newCard->lines = array_map(fn($line) => [[hexdec($line[0]), hexdec($line[1])], [hexdec($line[2]), hexdec($line[3])]], $newCard->lines);
        return $newCard;
    }
}
class ShootingStarType extends CardType {
    public /*array|string*/ $head/* = []*/;
  
    public function __construct(array $lines, /*array|string*/ $head) {
        parent::__construct($lines);
        $this->head = $head;
    } 

    protected static function clone(/*ShootingStarType*/ $card) {
        $clone = parent::clone($card);
        $clone->head = $card->head;
        return $clone;
    }

    public static function linesAndHeadAsString($cardOrCards) {
        if (gettype($cardOrCards) == 'array') {
            return array_map(fn($card) => self::linesAndHeadAsString($card), $cardOrCards);
            return array_map(fn($card) => self::linesAndHeadAsString($card), $cardOrCards);
        }
        $newCard = self::clone($cardOrCards);
        $newCard = self::linesAsString($newCard);
        $newCard->head = dechex($cardOrCards->head[0]).dechex($cardOrCards->head[1]);
        return $newCard;
    }

    public static function linesAndHeadAsArrays($cardOrCards) {
        if (gettype($cardOrCards) == 'array') {
            return array_map(fn($card) => self::linesAndHeadAsArrays($card), $cardOrCards);
            return array_map(fn($card) => self::linesAndHeadAsArrays($card), $cardOrCards);
        }
        $newCard = self::clone($cardOrCards);
        $newCard = self::linesAsArray($newCard);
        $newCard->head = [hexdec($cardOrCards->head[0]), hexdec($cardOrCards->head[1])];
        return $newCard;
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
    public int $typeArg = 0;

    public function __construct($dbCard, $SHAPES) {
        $this->id = intval($dbCard['id']);
        $this->type = intval($dbCard['type']);
        if ($this->type == 1) {
        } else if ($this->type == 2) {
            $this->typeArg = intval($dbCard['type_arg']);
            $card = $SHAPES[$this->typeArg];
            $this->lines = $card->lines;
        }
    } 

    public static function onlyId(/*Card */$card) {
        return new Card([
            'id' => $card->id,
            'type' => null
        ], null);
    }

    public static function onlyIds(array $cards) {
        return array_map(fn($card) => self::onlyId($card), $cards);
    }

    protected static function clone(/*Card */$card) {
        $clone = parent::clone($card);
        $clone->id = $card->id;
        $clone->type = $card->type;
        $clone->typeArg = $card->typeArg;
        return $clone;
    }

    public static function linesAsString($cardOrCards) {
        if (gettype($cardOrCards) == 'array') {
            return array_map(fn($card) => self::linesAsString($card), $cardOrCards);
            return array_map(fn($card) => self::linesAsString($card), $cardOrCards);
        }
        $newCard = self::clone($cardOrCards);
        $newCard->lines = array_map(fn($line) => dechex($line[0][0]).dechex($line[0][1]).dechex($line[1][0]).dechex($line[1][1]), $newCard->lines);
        return $newCard;
    }
}
?>