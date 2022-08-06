<?php

class Sheet {
    public array $lines;
    public array $planets;
    public array $forbiddenStars;

    public function __construct(array $lines, array $planets, array $forbiddenStars) {
        $this->lines = $lines;
        $this->planets = $planets;
        $this->forbiddenStars = $forbiddenStars;
    } 
}
?>