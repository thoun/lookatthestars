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
        //$this->insertLinesStr(2343492, ['0011', '1122', '2233',    '2031', '3142', '4253']);
        // for bonus : planet
        //$this->insertLinesStr(2343492, ['0001', '0102', '0203',     '2021', '2122', '2223']);
        // for bonus : stars
        //$this->insertLinesStr(2343492, ['0001', '0010', '0111',       '2021', '2030', '2131']);
        // for bonus : black hole
        //$this->insertLinesStr(2343492, ['0110', '0111', '0112']);
        // for bonus : moon
        //$this->insertLinesStr(2343492, ['0110', '1020', '2031']);
        // for bonus : twinkling star
        //$this->insertLinesStr(2343492, ['0011', '1102', '1122']);
        // for bonus : galaxy
        //$this->insertLinesStr(2343492, ['2233', '3324']);
        // for bonus : nova
        //$this->insertLinesStr(2343492, ['0110', '0112', '1221']);
        // for bonus : luminous aura
        //$this->insertLinesStr(2343492, ['1112', '1213', '1222',     '6162', '6263', '6272']);

        // for star1 default shape
        //$this->insertLinesStr(2343492, ['0111', '1011', '1112', '1121',       '0515', '1415', '1516', '1525']);

        /*$this->insertLinesStr(2343492, ['1112', '1122', '1121', '2232', '2233', '3343', // 7
            '7081', '7071', '8081', '9081', '7182', '8293', '9392', '9383', // 8
         '5262', '5253', '5263', '6263', '6374', '7475', // 6
         '5464', '6465', '6455', '5546']); // 4*/

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

    public function debugSetLastRound() {
        $currentCard = $this->getCurrentCard(true);
        $this->DbQuery("UPDATE shape SET `card_location` = 'discard' WHERE `card_id` <> $currentCard->id");
    }

    public function debugReplacePlayersIds() {
        if ($this->getBgaEnvironment() != 'studio') { 
            return;
        } 

		// These are the id's from the BGAtable I need to debug.
        // SELECT JSON_ARRAYAGG(`player_id`) FROM `player`
		$ids = [84582251, 86175279];

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
