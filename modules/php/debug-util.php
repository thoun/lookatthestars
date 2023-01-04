<?php

trait DebugUtilTrait {

//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////

    function debugSetup() {
        if ($this->getBgaEnvironment() != 'studio') { 
            return;
        } 

        /*$this->setGameStateValue(STAR2, 1);
        $objects = new Objects();
        $objects->planets = ['35', '74'];
        $this->DbQuery("UPDATE player SET `player_sheet_type` = 1, `player_objects` = '".json_encode($objects)."' WHERE `player_id` = 2343492");
        $this->DbQuery("UPDATE player SET `player_sheet_type` = 0 WHERE `player_id` = 2343493");

        $this->insertLinesStr(2343492, [
            '0112', '0212', '1213', '1323', '2334', // 5
            '3242', '4243', '3343', '4344', '4453', '4445', '4546', // 7
            '5263', '6373', '6354', // 3
            '8081', '8283', '8372', '8393', '9392', '9384', '8475', // 8
            '5565', '6566', // 3 en cours
            '4858', // 2 en cours
            '4a59', // 2

        ]);

        $this->DbQuery("UPDATE shape SET `card_location` = 'piles', `card_location_arg` = 1000 WHERE `card_type_arg` = 13");
        $this->DbQuery("UPDATE shape SET `card_location` = 'piles',  `card_location_arg` = 100 WHERE `card_type` = 1");*/

        // for bonus : line
        //$this->insertLinesStr(2343492, ['0011', '1122', '2233',   /* '2031', '3142', '4253'*/]);
        // for bonus : planet
        //$this->insertLinesStr(2343492, ['0001', '0102', '0203',     /*'2021', '2122', '2223'*/]);
        // for bonus : stars
        //$this->insertLinesStr(2343492, ['0001', '0010', '0111',       '2021', '2030', '2131']);
        // for bonus : black hole
        //$this->insertLinesStr(2343492, ['0112', '0212', '0312']);
        // for bonus : moon
        //$this->insertLinesStr(2343492, ['0110', '1020', '2031']);
        // for bonus : twinkling star
        //$this->insertLinesStr(2343492, ['0011', '1102', '1122']);
        // for bonus : galaxy
        $this->insertLinesStr(2343492, ['2233', '3324',     '5566', '6657']);
        // for bonus : nova
        //$this->insertLinesStr(2343492, ['0110', '0112', '1221']);
        // for bonus : luminous aura
        //$this->insertLinesStr(2343492, ['1112', '1213', '1222',     '6162', '6263', '6272']);

        // for star1 default shape
        //$this->insertLinesStr(2343492, ['0111', '1011', '1112', '1121',       '0515', '1415', '1516', '1525']);

        /*$this->insertLinesStr(2343492, ['3545', '3546', '4637', '4656', '5657', // 5
            '5849', '4849', '493A', // 4
         '0213', '1304', '1314', '1415', '1323', '2333', // 6
        ]); // 4*/

        /*$objects = new Objects();
        $objects->galaxies = ['17', '69'];
        $this->DbQuery("UPDATE player SET `player_round_objects` = NULL, `player_objects` = '".json_encode($objects)."' WHERE `player_id` = 2343492");*/

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

    public function debugSetOnlyShootingStars() {
        $this->DbQuery("UPDATE shape SET `card_location` = 'discard' WHERE `card_type` <> 1");
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
