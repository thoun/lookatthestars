<?php



class LatsPlayer {
    public int $id;
    public string $name;
    public string $color;
    public int $score;
    public Sheet $sheet;
    public array $lines;
    public array $roundLines;
    public object $objects;
    public object $roundObjects;

    public function __construct( array $dbPlayer, array $SHEETS) {
        $this->id = intval($dbPlayer['player_id']);
        $this->name = $dbPlayer['player_name'];
        $this->color = $dbPlayer['player_color'];
        $this->score = intval($dbPlayer['player_score']);
        $this->sheet = $SHEETS[intval($dbPlayer['player_sheet_type'])];
        $this->lines = $dbPlayer['player_lines'] != null ? json_decode($dbPlayer['player_lines'], true) : [];
        $this->roundLines = $dbPlayer['player_round_lines'] != null ? json_decode($dbPlayer['player_round_lines'], true) : [];
        $this->objects = $dbPlayer['player_objects'] != null ? json_decode($dbPlayer['player_objects']) : new Objects();
        $this->roundObjects = $dbPlayer['player_round_objects'] != null ? json_decode($dbPlayer['player_round_objects']) : new Objects();
    }

    public function getForbiddenCoordinates(bool $ignoreBlackHole = false) {
        $forbiddenCoordinates = array_merge(
            ALWAYS_FORBIDDEN_POINTS,
            $this->getSheetForbiddenCoordinates(),
            $this->getPlanets(),
        );

        if (!$ignoreBlackHole) {
            foreach ($this->objects->blackHoles as $blackHole) {
                $coordinates = $this->coordinateStrToCoordinate($blackHole);
                for ($x = $coordinates[0]-1; $x <= $coordinates[0]+1; $x++) {
                    for ($y = $coordinates[1]-1; $y <= $coordinates[1]+1; $y++) {
                        $forbiddenCoordinates[] = [$x, $y];
                    }
                }
            }
        }

        return $forbiddenCoordinates;
    }

    public function getSheetForbiddenCoordinates(bool $includeRound = false) {
        $sheetForbiddenCoordinates = array_values(array_filter($this->sheet->forbiddenStars, fn($coordinates) =>
            !$this->coordinatesInArray($coordinates, $this->objects->stars)
        ));

        if ($includeRound) {
            return array_values(array_filter($sheetForbiddenCoordinates, fn($coordinates) =>
                !$this->coordinatesInArray($coordinates, $this->roundObjects->stars)
            ));
        } else {
            return $sheetForbiddenCoordinates;
        }
    }

    public function getLines(bool $includeRound = false) {
        $lines = array_merge(
            $this->linesStrToLines($this->lines),
            $this->sheet->lines
        );

        if ($includeRound) {
            return array_merge(
                $lines,
                $this->linesStrToLines($this->roundLines)
            );
        } else {
            return $lines;
        }
    }

    public function getShootingStars(bool $includeRound = false) {        
        $shootingStars = ShootingStarType::linesAndHeadAsArrays($this->objects->shootingStars);
        if ($includeRound) {
            return array_merge(
                $shootingStars,
                ShootingStarType::linesAndHeadAsArrays($this->roundObjects->shootingStars)
            );
        } else {
            return $shootingStars;
        }
    }

    public function getPlanets(bool $includeRound = false) {
        $planets = array_merge(
            $this->coordinatesStrToCoordinates($this->objects->planets),
            $this->sheet->planets
        );

        if ($includeRound) {
            return array_merge(
                $planets,
                $this->coordinatesStrToCoordinates($this->roundObjects->planets)
            );
        } else {
            return $planets;
        }
    }

    

    private function lineStrToLine(string $lineStr) {
        return [[hexdec($lineStr[0]), hexdec($lineStr[1])], [hexdec($lineStr[2]), hexdec($lineStr[3])]];
    }

    private function linesStrToLines(array $linesStr) {
        return array_map(fn($lineStr) => $this->lineStrToLine($lineStr), $linesStr);
    }

    private function coordinateStrToCoordinate(string $coordinatesStr) {
        return [hexdec($coordinatesStr[0]), hexdec($coordinatesStr[1])];
    }

    private function coordinatesStrToCoordinates(array $coordinatesStr) {
        return array_map(fn($coordinateStr) => $this->coordinateStrToCoordinate($coordinateStr), $coordinatesStr);
    }

    function array_some(array $array, callable $fn) {
        foreach ($array as $value) {
            if($fn($value)) {
                return true;
            }
        }
        return false;
    }

    function coordinatesInArray(array $coordinates, array $arrayOfCoordinates) {
        return $this->array_some($arrayOfCoordinates, fn($iCoord) => $coordinates[0] == $iCoord[0] && $coordinates[1] == $iCoord[1]);
    }
}
?>