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

use Bga\GameFramework\GameStateBuilder;
use Bga\GameFramework\StateType;

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
    ST_BGA_GAME_SETUP => GameStateBuilder::gameSetup(ST_MULTIPLAYER_PLAY_CARD)->build(),
];

$transitionsToPower = [
    'place'.POWER_PLANET => ST_PRIVATE_PLACE_PLANET,
    'place'.POWER_NEW_LINE => ST_PRIVATE_PLACE_LINE,
    'place'.POWER_NEW_STARS => ST_PRIVATE_PLACE_STAR,
    'place'.POWER_BLACK_HOLE => ST_PRIVATE_PLACE_BLACK_HOLE,
    'place'.POWER_CRESCENT_MOON => ST_PRIVATE_PLACE_CRESCENT_MOON,
    'place'.POWER_LUMINOUS_AURA => ST_PRIVATE_PLACE_LUMINOUS_AURA,
    'place'.POWER_GALAXY => ST_PRIVATE_PLACE_GALAXY,
    'place'.POWER_NOVA => ST_PRIVATE_PLACE_NOVA,
    'place'.POWER_TWINKLING_STAR => ST_PRIVATE_PLACE_TWINKLING_STAR,
];

$playerActionsGameStates = [

    ST_MULTIPLAYER_PLAY_CARD => GameStateBuilder::create()
        ->name("playCard")
        ->description(clienttranslate('Players must place the shape'))
        ->descriptionmyturn('')
        ->type(StateType::MULTIPLE_ACTIVE_PLAYER)
        ->initialprivate(ST_PRIVATE_PLACE_SHAPE)
        ->action("stPlayCard")
        ->possibleactions([ "actCancelPlaceShape" ])
        ->transitions([
            "next" => ST_NEXT_SHAPE,
        ])
        ->build(),

    ST_PRIVATE_PLACE_SHAPE => GameStateBuilder::create()
        ->name("placeShape")
        ->descriptionmyturn(clienttranslate('${you} must place the shape'))
        ->type(StateType::PRIVATE)
        ->args("argPlaceShape")
        ->possibleactions([ "actPlaceShape", "actPlaceShootingStar", "actSkipCard", "actCancelPlaceShape" ])
        ->transitions($transitionsToPower + [
          'confirm' => ST_PRIVATE_CONFIRM_TURN,
        ])
        ->build(),

    ST_PRIVATE_CONFIRM_TURN => GameStateBuilder::create()
        ->name("confirmTurn")
        ->descriptionmyturn(clienttranslate('${you} must confirm your turn'))
        ->type(StateType::PRIVATE)
        ->args("argConfirmTurn")
        ->possibleactions([ "actConfirmTurn", "actCancelBonus", "actCancelPlaceShape" ])
        ->transitions($transitionsToPower)
        ->build(),

    ST_PRIVATE_PLACE_PLANET => GameStateBuilder::create()
        ->name("placePlanet")
        ->descriptionmyturn(clienttranslate('${you} can place a new planet on an unused star'))
        ->type(StateType::PRIVATE)
        ->args("argPlacePlanet")
        ->possibleactions([ "actPlacePlanet", "actSkipBonus", "actCancelPlaceShape" ])
        ->transitions([
            'next' => ST_PRIVATE_PLACE_PLANET,
            'confirm' => ST_PRIVATE_CONFIRM_TURN,
        ])
        ->build(),

    ST_PRIVATE_PLACE_STAR => GameStateBuilder::create()
        ->name("placeStar")
        ->descriptionmyturn(clienttranslate('${you} can place a new star (${number}/2)'))
        ->type(StateType::PRIVATE)
        ->args("argPlaceStar")
        ->possibleactions([ "actPlaceStar", "actSkipBonus", "actCancelPlaceShape" ])
        ->transitions([
            'next' => ST_PRIVATE_PLACE_STAR,
            'confirm' => ST_PRIVATE_CONFIRM_TURN,
        ])
        ->build(),

    ST_PRIVATE_PLACE_BLACK_HOLE => GameStateBuilder::create()
        ->name("placeBlackHole")
        ->descriptionmyturn(clienttranslate('${you} can place a black hole'))
        ->type(StateType::PRIVATE)
        ->args("argPlacePlanet")
        ->possibleactions([ "actPlaceBlackHole", "actSkipBonus", "actCancelPlaceShape" ])
        ->transitions([
            'next' => ST_PRIVATE_PLACE_BLACK_HOLE,
            'confirm' => ST_PRIVATE_CONFIRM_TURN,
        ])
        ->build(),

    ST_PRIVATE_PLACE_CRESCENT_MOON => GameStateBuilder::create()
        ->name("placeCrescentMoon")
        ->descriptionmyturn(clienttranslate('${you} can place a crescent moon'))
        ->type(StateType::PRIVATE)
        ->args("argPlacePlanet")
        ->possibleactions([ "actPlaceCrescentMoon", "actSkipBonus", "actCancelPlaceShape" ])
        ->transitions([
            'next' => ST_PRIVATE_PLACE_CRESCENT_MOON,
            'confirm' => ST_PRIVATE_CONFIRM_TURN,
        ])
        ->build(),

    ST_PRIVATE_PLACE_LUMINOUS_AURA => GameStateBuilder::create()
        ->name("placeLuminousAura")
        ->descriptionmyturn(clienttranslate('${you} can place a luminous aura'))
        ->type(StateType::PRIVATE)
        ->args("argPlaceLuminousAura")
        ->possibleactions([ "actPlaceLuminousAura", "actSkipBonus", "actCancelPlaceShape" ])
        ->transitions([
            'next' => ST_PRIVATE_PLACE_LUMINOUS_AURA,
            'confirm' => ST_PRIVATE_CONFIRM_TURN,
        ])
        ->build(),

    ST_PRIVATE_PLACE_GALAXY => GameStateBuilder::create()
        ->name("placeGalaxy")
        ->descriptionmyturn(clienttranslate('${you} can place a galaxy'))
        ->type(StateType::PRIVATE)
        ->args("argPlaceGalaxy")
        ->possibleactions([ "actPlaceGalaxy", "actSkipBonus", "actCancelPlaceShape" ])
        ->transitions([
            'next' => ST_PRIVATE_PLACE_GALAXY,
            'confirm' => ST_PRIVATE_CONFIRM_TURN,
        ])
        ->build(),

    ST_PRIVATE_PLACE_NOVA => GameStateBuilder::create()
        ->name("placeNova")
        ->descriptionmyturn(clienttranslate('${you} can place a nova'))
        ->type(StateType::PRIVATE)
        ->args("argPlaceNova")
        ->possibleactions([ "actPlaceNova", "actSkipBonus", "actCancelPlaceShape" ])
        ->transitions([
            'next' => ST_PRIVATE_PLACE_NOVA,
            'confirm' => ST_PRIVATE_CONFIRM_TURN,
        ])
        ->build(),

    ST_PRIVATE_PLACE_TWINKLING_STAR => GameStateBuilder::create()
        ->name("placeTwinklingStar")
        ->descriptionmyturn(clienttranslate('${you} can place a twinkling star'))
        ->type(StateType::PRIVATE)
        ->args("argPlacePlanet")
        ->possibleactions([ "actPlaceTwinklingStar", "actSkipBonus", "actCancelPlaceShape" ])
        ->transitions([
            'next' => ST_PRIVATE_PLACE_TWINKLING_STAR,
            'confirm' => ST_PRIVATE_CONFIRM_TURN,
        ])
        ->build(),

    ST_PRIVATE_PLACE_LINE => GameStateBuilder::create()
        ->name("placeLine")
        ->descriptionmyturn(clienttranslate('${you} can place a new line between 2 adjacent stars'))
        ->type(StateType::PRIVATE)
        ->args("argPlaceLine")
        ->possibleactions([ "actPlaceLine", "actSkipBonus", "actCancelPlaceShape" ])
        ->transitions([
            'next' => ST_PRIVATE_PLACE_LINE,
            'confirm' => ST_PRIVATE_CONFIRM_TURN,
        ])
        ->build(),
];


$gameGameStates = [

    ST_NEXT_SHAPE => GameStateBuilder::create()
        ->name("nextShape")
        ->description("")
        ->type(StateType::GAME)
        ->action("stNextShape")
        ->updateGameProgression(true)
        ->transitions([
            "next" => ST_MULTIPLAYER_PLAY_CARD, 
            "endScore" => ST_END_SCORE,
        ])
        ->build(),

    ST_END_SCORE => GameStateBuilder::endScore()->build(),
];
 
$machinestates = $basicGameStates + $playerActionsGameStates + $gameGameStates;



