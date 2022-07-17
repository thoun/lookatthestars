<?php
define('ROUND_NUMBER', 12);

/*
 * State constants
 */
define('ST_BGA_GAME_SETUP', 1);

define('ST_MULTIPLAYER_PLACE_DEPARTURE_PAWN', 10);

define('ST_START_GAME', 20);

define('ST_PLAYER_PLACE_ROUTE', 30);

define('ST_NEXT_PLAYER', 70);

define('ST_END_ROUND', 80);

define('ST_END_SCORE', 90);

define('ST_END_GAME', 99);
define('END_SCORE', 100);

/*
 * Variables
 */
define('FIRST_PLAYER', 'FIRST_PLAYER');
define('ELIMINATE_PLAYER', 'ELIMINATE_PLAYER');

/*
 * Game option
 */
define('SCORING_OPTION', 'SCORING_OPTION');

/*
 * Map elements
 */
define('GREEN_LIGHT', 0);
// 1 to 12 : starting point

define('OLD_LADY', 20);

define('STUDENT', 30);
define('INTERNSHIP', 31);
define('SCHOOL', 32);
define('SCHOOL_SPECIAL', 35);

define('TOURIST', 40);
define('MONUMENT_LIGHT', 41);
define('MONUMENT_DARK', 42);
define('MONUMENT_LIGHT_SPECIAL', 45);
define('MONUMENT_DARK_SPECIAL', 46);

define('BUSINESSMAN', 50);
define('OFFICE', 51);
define('OFFICE_SPECIAL', 55);

// for tooltips : 90 common objectives, 91 personal objective, 92 turn zone, 93 traffic jam, 94 total score, 95 round number

// 97 to 122 : objectives (using ord('a'))
?>
