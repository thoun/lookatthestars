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

    private function lineStrToLine(string $lineStr) {
        return [[hexdec($lineStr[0]), hexdec($lineStr[1])], [hexdec($lineStr[2]), hexdec($lineStr[3])]];
    }

    private function linesStrToLines(array $linesStr) {
        return array_map(fn($lineStr) => $this->lineStrToLine($lineStr), $linesStr);
    }

    public function getForbiddenCoordinates() {
        $forbiddenCoordinates = array_merge(
            ALWAYS_FORBIDDEN_POINTS,
            $this->sheet->forbiddenStars,
            $this->getPlanets(),
        );

        return $forbiddenCoordinates;
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
        // TODO
        return $this->sheet->planets;
    }
}
?>