<?php

trait DebugUtilTrait {

//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////

    function debugSetup() {
        if ($this->getBgaEnvironment() != 'studio') { 
            return;
        } 

        // for bonus : line
        $this->insertLinesStr(2343492, ['0011', '1122', '2233']);
        // for bonus : planet
        //$this->insertLinesStr(2343492, ['0001', '0102', '0203']);

        //$this->insertRandomLines(2343492, 16);
        //$this->insertRandomLines(2343493, 20);
    }

    function getRandomLine() {
        $start = [bga_rand(0, 9), bga_rand(0, 10)];

        $deltaX = bga_rand($start[0] == 0 ? 0 : -1, $start[0] == 9 ? 0 : 1);
        $deltaY = bga_rand($start[1] == 0 ? 0 : -1, $start[1] == 10 ? 0 : 1);

        while (
            ($deltaX == 0 && $deltaY == 0)
        ) {
            $deltaX = bga_rand($start[0] == 0 ? 0 : -1, $start[0] == 9 ? 0 : 1);
            $deltaY = bga_rand($start[1] == 0 ? 0 : -1, $start[1] == 10 ? 0 : 1);
        }

        return [$start, [
            $start[0] + $deltaX,
            $start[1] + $deltaY,
        ]];
    }

    function insertRandomLines(int $playerId, int $number) {
        $lines = [];

        for ($i=0; $i<$number; $i++) {
            $newLine = $this->getRandomLine();

            while ($this->array_some($lines, fn($line) => $this->sameLine($line, $newLine))) {
                $newLine = $this->getRandomLine();
            }

            $lines[] = $newLine;
        }

        $linesStr = array_map(fn($line) => dechex($line[0][0]).dechex($line[0][1]).dechex($line[1][0]).dechex($line[1][1]), $lines);
        $this->DbQuery("UPDATE player SET `player_lines` = '".json_encode($linesStr)."' WHERE `player_id` = $playerId");
    }

    function insertLinesStr(int $playerId, array $linesStr) {
        $this->DbQuery("UPDATE player SET `player_lines` = '".json_encode($linesStr)."' WHERE `player_id` = $playerId");
    }

    public function debugReplacePlayersIds() {
        if ($this->getBgaEnvironment() != 'studio') { 
            return;
        } 

		// These are the id's from the BGAtable I need to debug.
		$ids = [
            92432695,
            87587865,
            88804802
		];

		// Id of the first player in BGA Studio
		$sid = 2343492;
		
		foreach ($ids as $id) {
			// basic tables
			$this->DbQuery("UPDATE player SET player_id=$sid WHERE player_id = $id" );
			$this->DbQuery("UPDATE global SET global_value=$sid WHERE global_value = $id" );
			$this->DbQuery("UPDATE stats SET stats_player_id=$sid WHERE stats_player_id = $id" );

			// 'other' game specific tables. example:
			// tables specific to your schema that use player_ids
			//$this->DbQuery("UPDATE placed_routes SET player_id=$sid WHERE player_id = $id" );
			
			++$sid;
		}
	}

    function debug($debugData) {
        if ($this->getBgaEnvironment() != 'studio') { 
            return;
        }die('debug data : '.json_encode($debugData));
    }
}
