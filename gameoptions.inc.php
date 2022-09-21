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

$begginerRecommendedOption = [
    'name' => totranslate('Default'),
    'description' => totranslate('Recommended Bonus card for beginners'),
];

$randomOption = [
    'name' => totranslate('Random'),
    'description' => totranslate('Random Bonus cards'),
];

$randomOptionExperienced = [
    'name' => totranslate('Random (experienced)'),
    'description' => totranslate('Random Bonus cards (include experienced Bonus cards)'),
];

$pointBonusCardValues = [
    1 => $begginerRecommendedOption + [ 'tmdisplay' => totranslate('Beginner Point Bonus card') ],
    2 => $randomOption + [ 'tmdisplay' => totranslate('Random Point Bonus card') ],
];

for ($i = 0; $i <= 9; $i++) {
    $pointBonusCardValues[$i + 3] = [
        'name' => totranslate('Point Bonus card') . ' ' . ($i + 1),
        'description' => totranslate('Point Bonus card') . ' ' . ($i + 1),
        'tmdisplay' => totranslate('Point Bonus card') . ' ' . ($i + 1),
    ];
}

$powerBonusCardValues = [
    1 => $begginerRecommendedOption + [ 'tmdisplay' => totranslate('Beginner Power Bonus card') ],
    2 => $randomOption + [ 'tmdisplay' => totranslate('Random Power Bonus card') ],
    3 => $randomOptionExperienced + [ 'tmdisplay' => totranslate('Random Power Bonus card (include experienced Bonus cards)') ],
];

$POWERS = [
    totranslate('Planet'),
    totranslate('Line'),
    totranslate('New stars'),
    totranslate('Galaxy'),
    totranslate('Twinkling star'),
    totranslate('Nova (experienced)'),
    totranslate('Luminous aura (experienced)'),
    totranslate('Crescent moon (experienced)'),
    totranslate('Black hole (experienced)'),
];

foreach ($POWERS as $i => $POWER) {
    $powerBonusCardValues[$i + 4] = [
        'name' => $POWER,
        'description' => $POWER,
        'tmdisplay' => $POWER,
    ];
}

$game_options = [    
    100 => [
        'name' => totranslate('Point Bonus card'),
        'values' => $pointBonusCardValues,
        'default' => 1,
    ], 

    101 => [
        'name' => totranslate('Power Bonus card'),
        'values' => $powerBonusCardValues,
        'default' => 1,
    ], 

    102 => [
        'name' => totranslate('Scoring'),
        'values' => [
            1 => [
                'name' => totranslate('Hidden'),
            ],
            2 => [
                'name' => totranslate('Visible'),
                'tmdisplay' => totranslate('Visible scoring'),
            ],
        ],
        'default' => 1,
    ],
];

$game_preferences = [
    200 => [
        'name' => totranslate('Countdown timer for confirmation'),
        'needReload' => false,
        'values' => [
            1 => ['name' => totranslate('Enabled')],
            2 => ['name' => totranslate('Disabled')],
        ],
        'default' => 1,
    ],

    201 => [
        'name' => totranslate('Show constellations size'),
        'needReload' => false,
        'values' => [
            1 => ['name' => totranslate('Enabled')],
            2 => ['name' => totranslate('Disabled')],
        ],
        'default' => 1,
    ],

    299 => [
        'name' => '',
        'needReload' => false,
        'values' => [
            1 => ['name' => totranslate('Enabled')],
            2 => ['name' => totranslate('Disabled')],
        ],
        'default' => 1
    ],
];