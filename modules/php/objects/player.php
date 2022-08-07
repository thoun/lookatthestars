<?php

class Player {
    public int $id;
    public string $name;
    public string $color;
    public int $sheet;
    public int $lines;
    public int $objects;

    public function __construct($dbPlayer) {
        $this->id = intval($dbPlayer['player_id']);
        $this->name = $dbPlayer['player_name'];
        $this->color = $dbPlayer['player_color'];
        $this->sheet = intval($dbPlayer['player_sheet_type']);
        $this->lines = $dbPlayer['player_lines'] ?? [];
        $this->objects = $dbPlayer['player_objects']?? json_decode('{}');
    } 
}
?>