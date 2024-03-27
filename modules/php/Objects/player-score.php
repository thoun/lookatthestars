<?php

class PlayerScore {
    public array $checkedConstellations = [];
    public int $constellations = 0;
    public int $planets = 0;
    public int $shootingStars = 0;
    public int $star1 = 0;
    public int $star2 = 0;
    public int $total = 0;

    public function calculateTotal() {
        $this->total = $this->constellations + $this->planets + $this->shootingStars + $this->star1 + $this->star2;
    }
}

?>