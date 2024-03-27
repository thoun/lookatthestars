<?php

class Sheet {
    public array $lines;
    public array $planets;
    public array $alwaysForbiddenStars;
    public array $forbiddenStars;

    public function __construct(array $lines, array $planets, array $alwaysForbiddenStars, array $forbiddenStars) {
        $this->lines = $lines;
        $this->planets = $planets;
        $this->alwaysForbiddenStars = $alwaysForbiddenStars;
        $this->forbiddenStars = $forbiddenStars;
    } 
}
?>