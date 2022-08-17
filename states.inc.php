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
 * states.inc.php
 *
 * LookAtTheStars game states description
 *
 */

/*
   Game state machine is a tool used to facilitate game developpement by doing common stuff that can be set up
   in a very easy way from this configuration file.

   Please check the BGA Studio presentation about game state to understand this, and associated documentation.

   Summary:

   States types:
   _ activeplayer: in this type of state, we expect some action from the active player.
   _ multipleactiveplayer: in this type of state, we expect some action from multiple players (the active players)
   _ game: this is an intermediary state where we don't expect any actions from players. Your game logic must decide what is the next game state.
   _ manager: special type for initial and final state

   Arguments of game states:
   _ name: the name of the GameState, in order you can recognize it on your own code.
   _ description: the description of the current game state is always displayed in the action status bar on
                  the top of the game. Most of the time this is useless for game state with "game" type.
   _ descriptionmyturn: the description of the current game state when it's your turn.
   _ type: defines the type of game states (activeplayer / multipleactiveplayer / game / manager)
   _ action: name of the method to call when this game state become the current game state. Usually, the
             action method is prefixed by "st" (ex: "stMyGameStateName").
   _ possibleactions: array that specify possible player actions on this step. It allows you to use "checkAction"
                      method on both client side (Javacript: this.checkAction) and server side (PHP: self::checkAction).
   _ transitions: the transitions are the possible paths to go from a game state to another. You must name
                  transitions in order to use transition names in "nextState" PHP method, and use IDs to
                  specify the next game state for each transition.
   _ args: name of the method to call to retrieve arguments for this gamestate. Arguments are sent to the
           client side to be used on "onEnteringState" or to set arguments in the gamestate description.
   _ updateGameProgression: when specified, the game progression is updated (=> call to your getGameProgression
                            method).
*/

//    !! It is not a good idea to modify this file when a game is running !!

$basicGameStates = [

    // The initial state. Please do not modify.
    ST_BGA_GAME_SETUP => [
        "name" => "gameSetup",
        "description" => clienttranslate("Game setup"),
        "type" => "manager",
        "action" => "stGameSetup",
        "transitions" => [ "" => ST_MULTIPLAYER_PLAY_CARD ]
    ],
   
    // Final state.
    // Please do not modify.
    ST_END_GAME => [
        "name" => "gameEnd",
        "description" => clienttranslate("End of game"),
        "type" => "manager",
        "action" => "stGameEnd",
        "args" => "argGameEnd",
    ],
];


$playerActionsGameStates = [

    ST_MULTIPLAYER_PLAY_CARD => [
        "name" => "playCard",
        "description" => clienttranslate('Players must place the shape'),
        "descriptionmyturn" => '',
        "type" => "multipleactiveplayer",
        "initialprivate" => ST_PRIVATE_PLACE_SHAPE,
        "action" => "stPlayCard",
        "possibleactions" => [ "cancelPlaceShape" ],
        "transitions" => [
            "next" => ST_NEXT_SHAPE,
        ],
    ],

    ST_PRIVATE_PLACE_SHAPE => [
        "name" => "placeShape",
        "descriptionmyturn" => clienttranslate('${you} must place the shape'),
        "type" => "private",
        "args" => "argPlaceShape",
        "possibleactions" => [ "placeShape", "placeShootingStar", "skipCard", "cancelPlaceShape" ],
        "transitions" => [
          'place'.POWER_PLANET => ST_PRIVATE_PLACE_PLANET,
          'place'.POWER_NEW_LINE => ST_PRIVATE_PLACE_LINE,
          'place'.POWER_NEW_STARS => ST_PRIVATE_PLACE_STAR,
          'confirm' => ST_PRIVATE_CONFIRM_TURN,
        ]
    ],

    ST_PRIVATE_CONFIRM_TURN => [
        "name" => "confirmTurn",
        "descriptionmyturn" => clienttranslate('${you} must confirm your turn'),
        "type" => "private",
        "args" => "argConfirmTurn",
        "possibleactions" => [ "confirmTurn", "cancelBonus", "cancelPlaceShape" ],
        "transitions" => [
            'place'.POWER_PLANET => ST_PRIVATE_PLACE_PLANET,
            'place'.POWER_NEW_LINE => ST_PRIVATE_PLACE_LINE,
            'place'.POWER_NEW_STARS => ST_PRIVATE_PLACE_STAR,
        ]
    ],

    ST_PRIVATE_PLACE_PLANET => [
        "name" => "placePlanet",
        "descriptionmyturn" => clienttranslate('${you} can place a new planet on an unused star'),
        "type" => "private",
        "args" => "argPlacePlanet",
        "possibleactions" => [ "placePlanet", "skipBonus", "cancelPlaceShape" ],
        "transitions" => [
            'confirm' => ST_PRIVATE_CONFIRM_TURN,
        ]
    ],

    ST_PRIVATE_PLACE_STAR => [
        "name" => "placeStar",
        "descriptionmyturn" => clienttranslate('${you} can place a new star (${number}/2)'),
        "type" => "private",
        "args" => "argPlaceStar",
        "possibleactions" => [ "placeStar", "skipBonus", "cancelPlaceShape" ],
        "transitions" => [
            'next' => ST_PRIVATE_PLACE_STAR,
            'confirm' => ST_PRIVATE_CONFIRM_TURN,
        ]
    ],

    ST_PRIVATE_PLACE_LINE => [
        "name" => "placeLine",
        "descriptionmyturn" => clienttranslate('${you} can place a new line between 2 adjacent stars'),
        "type" => "private",
        "args" => "argPlaceLine",
        "possibleactions" => [ "placeLine", "skipBonus", "cancelPlaceShape" ],
        "transitions" => [
            'confirm' => ST_PRIVATE_CONFIRM_TURN,
        ]
    ],
];


$gameGameStates = [

    ST_NEXT_SHAPE => [
        "name" => "nextShape",
        "description" => "",
        "type" => "game",
        "action" => "stNextShape",
        "updateGameProgression" => true,
        "transitions" => [
            "next" => ST_MULTIPLAYER_PLAY_CARD, 
            "endScore" => ST_END_SCORE,
        ],
    ],

    ST_END_SCORE => [
        "name" => "endScore",
        "description" => "",
        "type" => "game",
        "action" => "stEndScore",
        "updateGameProgression" => true,
        "transitions" => [
            "endGame" => ST_END_GAME,
        ],
    ],
];
 
$machinestates = $basicGameStates + $playerActionsGameStates + $gameGameStates;



