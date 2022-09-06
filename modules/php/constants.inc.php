<?php

/*
 * State constants
 */
define('ST_BGA_GAME_SETUP', 1);

define('ST_MULTIPLAYER_PLAY_CARD', 20);

define('ST_PRIVATE_PLACE_SHAPE', 30);

define('ST_PRIVATE_PLACE_PLANET', 40);
define('ST_PRIVATE_PLACE_LINE', 41);
define('ST_PRIVATE_PLACE_STAR', 42);
define('ST_PRIVATE_PLACE_BLACK_HOLE', 43);
define('ST_PRIVATE_PLACE_CRESCENT_MOON', 44);
define('ST_PRIVATE_PLACE_LUMINOUS_AURA', 45);
define('ST_PRIVATE_PLACE_GALAXY', 46);
define('ST_PRIVATE_PLACE_NOVA', 47);
define('ST_PRIVATE_PLACE_TWINKLING_STAR', 48);

define('ST_PRIVATE_CONFIRM_TURN', 60);

define('ST_NEXT_SHAPE', 70);

define('ST_END_SCORE', 90);

define('ST_END_GAME', 99);
define('END_SCORE', 100);


/*
 * Constants
 */
define('STAR1', 10);
define('STAR2', 11);

/*
 * Game options
 */
define('OBJECTIVES', 'OBJECTIVES');

/*
 * Powers
 */

define('POWER_LUMINOUS_AURA', 1);
define('POWER_PLANET', 2);
define('POWER_NEW_STARS', 3);
define('POWER_NEW_LINE', 4);
define('POWER_GALAXY', 5);
define('POWER_BLACK_HOLE', 6);
define('POWER_NOVA', 7);
define('POWER_TWINKLING_STAR', 8);
define('POWER_CRESCENT_MOON', 9);

/*
 * Other
 */
define('DEFAULT_STAR1', 2);
define('DEFAULT_STAR2', 0 /* TODO TEMP 3 */);
define('ALWAYS_FORBIDDEN_POINTS', [
    [0, 10], [1, 10], [2, 10], [7, 10], [8, 10], [9, 10],
    [0, 9],  [1, 9],                    [8, 9],  [9, 9],
    [0, 8],                                      [9, 8],
    [0, 7],                                      [9, 7],
]);

?>
