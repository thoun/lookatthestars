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
 * gameoptions.inc.php
 *
 * LookAtTheStars game options description
 * 
 * In this file, you can define your game options (= game variants).
 *   
 * Note: If your game has no variant, you don't have to modify this file.
 *
 * Note²: All options defined in this file should have a corresponding "game state labels"
 *        with the same ID (see "initGameStateLabels" in lookatthestars.game.php)
 *
 * !! It is not a good idea to modify this file when a game is running !!
 *
 */

$game_options = [    
    100 => [
        'name' => totranslate('Objectives'),
        'values' => [
            1 => [
                'name' => totranslate('Default'),
                'tmdisplay' => totranslate('Beginner objectives'),
            ],
            2 => [
                'name' => totranslate('Random'),
                'tmdisplay' => totranslate('Random objectives'),
            ],
        ],
        'default' => 1,
    ],
];