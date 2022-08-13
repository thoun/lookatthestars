<?php

class LatsPlayer {
    public int $id;
    public string $name;
    public string $color;
    public int $sheet;
    public array $lines;
    public object $objects;

    public function __construct($dbPlayer) {
        $this->id = intval($dbPlayer['player_id']);
        $this->name = $dbPlayer['player_name'];
        $this->color = $dbPlayer['player_color'];
        $this->sheet = intval($dbPlayer['player_sheet_type']);
        $this->lines = $dbPlayer['player_lines'] != null ? json_decode($dbPlayer['player_lines'], true) : [];
        $this->objects = json_decode($dbPlayer['player_objects'] ?? '{}');
    } 
}
?>