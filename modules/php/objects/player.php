<?php

class LatsPlayer {
    public int $id;
    public string $name;
    public string $color;
    public int $score;
    public int $sheet;
    public array $lines;
    public array $roundLines;
    public object $objects;
    public object $roundObjects;

    public function __construct($dbPlayer) {
        $this->id = intval($dbPlayer['player_id']);
        $this->name = $dbPlayer['player_name'];
        $this->color = $dbPlayer['player_color'];
        $this->score = intval($dbPlayer['player_score']);
        $this->sheet = intval($dbPlayer['player_sheet_type']);
        $this->lines = $dbPlayer['player_lines'] != null ? json_decode($dbPlayer['player_lines'], true) : [];
        $this->roundLines = $dbPlayer['player_round_lines'] != null ? json_decode($dbPlayer['player_round_lines'], true) : [];
        $this->objects = $dbPlayer['player_objects'] != null ? json_decode($dbPlayer['player_objects']) : new Objects();
        $this->roundObjects = $dbPlayer['player_round_objects'] != null ? json_decode($dbPlayer['player_round_objects']) : new Objects();
    } 
}
?>