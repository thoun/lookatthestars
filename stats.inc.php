<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * LookAtTheStars implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * stats.inc.php
 *
 * LookAtTheStars game statistics description
 *
 */

/*
    In this file, you are describing game statistics, that will be displayed at the end of the
    game.
    
    !! After modifying this file, you must use "Reload  statistics configuration" in BGA Studio backoffice
    ("Control Panel" / "Manage Game" / "Your Game")
    
    There are 2 types of statistics:
    _ table statistics, that are not associated to a specific player (ie: 1 value for each game).
    _ player statistics, that are associated to each players (ie: 1 value for each player in the game).

    Statistics types can be "int" for integer, "float" for floating point values, and "bool" for boolean
    
    Once you defined your statistics there, you can start using "initStat", "setStat" and "incStat" method
    in your game logic, using statistics names defined below.
    
    !! It is not a good idea to modify this file when a game is running !!

    If your game is already public on BGA, please read the following before any change:
    http://en.doc.boardgamearena.com/Post-release_phase#Changes_that_breaks_the_games_in_progress
    
    Notes:
    * Statistic index is the reference used in setStat/incStat/initStat PHP method
    * Statistic index must contains alphanumerical characters and no space. Example: 'turn_played'
    * Statistics IDs must be >=10
    * Two table statistics can't share the same ID, two player statistics can't share the same ID
    * A table statistic can have the same ID than a player statistics
    * Statistics ID is the reference used by BGA website. If you change the ID, you lost all historical statistic data. Do NOT re-use an ID of a deleted statistic
    * Statistic name is the English description of the statistic as shown to players
    
*/

require_once('modules/php/constants.inc.php');

$commonStats = [
    "placedLines" => [
        "id" => 20,
        "name" => totranslate("Placed lines"),
        "type" => "int" 
    ],
    "usedBonus" => [
        "id" => 24,
        "name" => totranslate("Used bonus"),
        "type" => "int" 
    ],
];

$stats_type = [

    // Statistics global to table
    "table" => $commonStats + [
        "shootingStars" => [
            "id" => 10,
            "name" => totranslate("Shootings stars in cards"),
            "type" => "int"
        ], 
    ],
    
    // Statistics existing for each player
    "player" => $commonStats + [
        "playedCards" => [
            "id" => 30,
            "name" => totranslate("Played cards"),
            "type" => "int" 
        ],
        "skippedCards" => [
            "id" => 31,
            "name" => totranslate("Skipped cards"),
            "type" => "int"
        ],
        "shootingStar1" => [
            "id" => 32,
            "name" => totranslate("Shooting star placed (1 line)"),
            "type" => "int"
        ],
        "shootingStar2" => [
            "id" => 33,
            "name" => totranslate("Shooting star placed (2 lines)"),
            "type" => "int"
        ],
        "shootingStar3" => [
            "id" => 34,
            "name" => totranslate("Shooting star placed (3 lines)"),
            "type" => "int"
        ],
        "constellationsCount" => [
            "id" => 35,
            "name" => totranslate("Constellations count (3 lines or more)"),
            "type" => "int"
        ],
        "validConstellationsCount" => [
            "id" => 36,
            "name" => totranslate("Valid constellations count (validated on score board)"),
            "type" => "int"
        ],
        "constellationsPoints" => [
            "id" => 37,
            "name" => totranslate("Constellations points"),
            "type" => "int"
        ],
        "planetsPoints" => [
            "id" => 38,
            "name" => totranslate("Planets points"),
            "type" => "int"
        ],
        "shootingStarsPoints" => [
            "id" => 39,
            "name" => totranslate("Shooting stars points"),
            "type" => "int"
        ],
        "star1count" => [
            "id" => 40,
            "name" => totranslate("5-star objective scored"),
            "type" => "int"
        ],
        "star1points" => [
            "id" => 41,
            "name" => totranslate("5-star objective points"),
            "type" => "int"
        ],
        "star2points" => [
            "id" => 43,
            "name" => totranslate("7-star objective points"),
            "type" => "int"
        ],
        "placed".POWER_PLANET => [
            "id" => 44,
            "name" => totranslate("Placed planets"),
            "type" => "int"
        ],
        "placed".POWER_NEW_LINE => [
            "id" => 45,
            "name" => totranslate("Placed bonus lines"),
            "type" => "int"
        ],
        "placed".POWER_NEW_STARS => [
            "id" => 46,
            "name" => totranslate("Placed pair of stars"),
            "type" => "int"
        ],
        "placed".POWER_GALAXY => [
            "id" => 47,
            "name" => totranslate("Placed galaxies"),
            "type" => "int"
        ],
        "placed".POWER_TWINKLING_STAR => [
            "id" => 48,
            "name" => totranslate("Placed twinkling stars"),
            "type" => "int"
        ],
        "placed".POWER_NOVA => [
            "id" => 49,
            "name" => totranslate("Placed novas"),
            "type" => "int"
        ],
        "placed".POWER_LUMINOUS_AURA => [
            "id" => 50,
            "name" => totranslate("Placed luminous auras"),
            "type" => "int"
        ],
        "placed".POWER_CRESCENT_MOON => [
            "id" => 51,
            "name" => totranslate("Placed crescent moons"),
            "type" => "int"
        ],
        "placed".POWER_BLACK_HOLE => [
            "id" => 52,
            "name" => totranslate("Placed black holes"),
            "type" => "int"
        ],
    ]
];
