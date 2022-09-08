<?php

class Constellation {
    public string $key; // string coordinates of the lowest star (y coordinate). If multiple stars at same lowest, the closest to the left (x coordinate).
    public array $lines;

    public function __construct(array $firstLine) {
        $this->lines = [$firstLine];
        $this->setKey();
    }

    private function setKey() {
        $lowestY = 99;
        $xCoordinatesForLowestY = [];

        foreach ($this->lines as $line) {
            if ($line[0][1] < $lowestY) {
                $lowestY = $line[0][1];
            }
            if ($line[1][1] < $lowestY) {
                $lowestY = $line[1][1];
            }
        }

        foreach ($this->lines as $line) {
            if ($line[0][1] == $lowestY) {
                $xCoordinatesForLowestY[] = $line[0][0];
            }
            if ($line[1][1] == $lowestY) {
                $xCoordinatesForLowestY[] = $line[1][0];
            }
        }
        $lowestX = min($xCoordinatesForLowestY);

        $this->key = dechex($lowestX).dechex($lowestY);
    }

    public function addLine(array $line) {
        $this->lines[] = $line;
        $this->setKey();
    }

    public function addConstellation(Constellation $constellation) {
        $this->lines = array_merge($this->lines, $constellation->lines);
        $this->setKey();
    }

    public function getSize() {
        return count($this->lines);
    }
}
?>