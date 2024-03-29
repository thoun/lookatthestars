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
  * lookatthestars.game.php
  *
  * This is the main file for your game logic.
  *
  * In this PHP file, you are going to defines the rules of the game.
  *
  */


require_once( APP_GAMEMODULE_PATH.'module/table/table.game.php' );

require_once('modules/php/constants.inc.php');
require_once('modules/php/utils.php');
require_once('modules/php/actions.php');
require_once('modules/php/states.php');
require_once('modules/php/args.php');
require_once('modules/php/debug-util.php');

class LookAtTheStars extends Table {
    use UtilTrait;
    use ActionTrait;
    use StateTrait;
    use ArgsTrait;
    use DebugUtilTrait;

	function __construct() {
        // Your global variables labels:
        //  Here, you can assign labels to global variables you are using for this game.
        //  You can use any number of global variables with IDs between 10 and 99.
        //  If your game has options (variants), you also have to associate here a label to
        //  the corresponding ID in gameoptions.inc.php.
        // Note: afterwards, you can get/set the global variables with getGameStateValue/setGameStateInitialValue/setGameStateValue
        parent::__construct();
        
        self::initGameStateLabels([
            STAR1 => STAR1,
            STAR2 => STAR2,

            POINT_BONUS_CARD_OPTION => 100,
            POWER_BONUS_CARD_OPTION => 101,
            SCORING_OPTION => 102,
        ]); 

        $this->shapes = self::getNew("module.common.deck");
        $this->shapes->init("shape");       
	}
	
    protected function getGameName() {
		// Used for translations and stuff. Please do not modify.
        return "lookatthestars";
    }	

    /*
        setupNewGame:
        
        This method is called only once, when a new game is launched.
        In this method, you must setup the game according to the game rules, so that
        the game is ready to be played.
    */
    protected function setupNewGame($players, $options = []) {
        // Set the colors of the players with HTML color code
        // The default below is red/green/blue/orange/brown
        // The number of colors defined here must correspond to the maximum number of players allowed for the gams
        $gameinfos = self::getGameinfos();
        $default_colors = $gameinfos['player_colors'];

        $sheetTypes = [0, 1, 2, 3, 4, 5, 6, 7];
 
        // Create players
        // Note: if you added some extra field on "player" table in the database (dbmodel.sql), you can initialize it there.
        $sql = "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar, player_sheet_type) VALUES ";
        $values = [];
        foreach ($players as $player_id => $player) {
            $color = array_shift($default_colors);

            $sheetTypeIndex = bga_rand(0, count($sheetTypes) - 1);
            $sheetType = array_splice($sheetTypes, $sheetTypeIndex, 1)[0];
            $sheetTypes = array_values($sheetTypes);

            $values[] = "('".$player_id."','$color','".$player['player_canal']."','".addslashes( $player['player_name'] )."','".addslashes( $player['player_avatar'] )."', $sheetType)";
        }
        $sql .= implode(',', $values);
        self::DbQuery($sql);
        self::reattributeColorsBasedOnPreferences($players, $gameinfos['player_colors']);
        self::reloadPlayersBasicInfos();
        
        /************ Start the game initialization *****/

        // Init global values with their initial values
        //self::setGameStateInitialValue( 'my_first_global_variable', 0 );
        
        // Init game statistics
        // (note: statistics used in this file must be defined in your stats.inc.php file)
        $this->initStat('table', 'shootingStars', 0); 
        $this->initStat('table', 'placedLines', 0); 
        $this->initStat('player', 'placedLines', 0);  
        $this->initStat('table', 'usedBonus', 0); 
        $this->initStat('player', 'usedBonus', 0); 

        $this->initStat('player', 'playedCards', 0); 
        $this->initStat('player', 'skippedCards', 0);  
        foreach([1, 2, 3] as $number) { $this->initStat('player', 'shootingStar'.$number, 0); }
        $this->initStat('player', 'constellationsCount', 0);  
        $this->initStat('player', 'validConstellationsCount', 0);  
        $this->initStat('player', 'constellationsPoints', 0);  
        $this->initStat('player', 'planetsPoints', 0);  
        $this->initStat('player', 'shootingStarsPoints', 0);  
        $this->initStat('player', 'star1count', 0);  
        $this->initStat('player', 'star1points', 0);  
        $this->initStat('player', 'star2points', 0);

        $this->setupObjectives();
        $this->setupCards();

        $objective = $this->STAR2[intval($this->getGameStateValue(STAR2))];
        $this->initStat('player', 'placed'.$objective->power, 0);

        // Activate first player (which is in general a good idea :) )
        $this->activeNextPlayer();

        // TODO TEMP to test
        $this->debugSetup();

        /************ End of the game initialization *****/
    }

    /*
        getAllDatas: 
        
        Gather all informations about current game situation (visible by the current player).
        
        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)
    */
    protected function getAllDatas() {
        $result = [];
        //$isEndScore = true;
        $isEndScore = intval($this->gamestate->state_id()) >= ST_END_SCORE;
    
        // Get information about players
        // Note: you can retrieve some extra field you added for "player" table in "dbmodel.sql" if you need it.
        $sql = "SELECT player_id id, player_score score, player_no playerNo, player_sheet_type sheetType, player_lines `lines`, player_round_lines `roundLines`, player_objects objects, player_round_objects `roundObjects` FROM player ";
        $result['players'] = self::getCollectionFromDb($sql);
  
        $cards = Card::linesAsString($this->getCardsFromDb($this->shapes->getCardsInLocation('piles', null, 'location_arg')));
        $maskedCards = [];
        for ($i=0; $i<count($cards); $i++) {
            $maskedCards[] = ($i == count($cards) - 1) ? $cards[$i] : Card::onlyId($cards[$i]);
        }

        $result['liveScoring'] = intval($this->getGameStateValue(SCORING_OPTION)) == 2;

        foreach ($result['players'] as $playerId => &$playerDb) {
            $playerDb['playerNo'] = intval($playerDb['playerNo']);
            $playerDb['sheetType'] = intval($playerDb['sheetType']);
            $playerDb['lines'] = $playerDb['lines'] ? json_decode($playerDb['lines'], true) : [];
            $playerDb['roundLines'] = $playerDb['roundLines'] ? json_decode($playerDb['roundLines'], true) : [];
            $playerDb['objects'] = json_decode($playerDb['objects']) ?? new Objects();
            $playerDb['roundObjects'] = $playerDb['roundObjects'] ? json_decode($playerDb['roundObjects']) : new Objects();

            $player = $this->getPlayer($playerId);
            $playerDb['playerScore'] = $isEndScore || $result['liveScoring'] ? $this->getPlayerScore($player) : null;
            $playerDb['currentConstellations'] = $this->getConstellations($player->getLines(true));
        }

        $result['cards'] = $maskedCards;
        $result['star1'] = intval($this->getGameStateValue(STAR1));
        $result['star2'] = intval($this->getGameStateValue(STAR2));
        $result['SHOOTING_STAR_SIZES'] = ShootingStarType::linesAndHeadAsString($this->SHOOTING_STAR_SIZES);
  
        return $result;
    }

    /*
        getGameProgression:
        
        Compute and return the current game progression.
        The number returned must be an integer beween 0 (=the game just started) and
        100 (= the game is finished or almost finished).
    
        This method is called each time we are in a game state with the "updateGameProgression" property set to true 
        (see states.inc.php)
    */
    function getGameProgression() {
        $remainingShapes = intval($this->shapes->countCardInLocation('piles'));

        return 100 - ($remainingShapes * 100 / 18);
    }

//////////////////////////////////////////////////////////////////////////////
//////////// Zombie
////////////

    /*
        zombieTurn:
        
        This method is called each time it is the turn of a player who has quit the game (= "zombie" player).
        You can do whatever you want in order to make sure the turn of this player ends appropriately
        (ex: pass).
        
        Important: your zombie code will be called when the player leaves the game. This action is triggered
        from the main site and propagated to the gameserver from a server, not from a browser.
        As a consequence, there is no current player associated to this action. In your zombieTurn function,
        you must _never_ use getCurrentPlayerId() or getCurrentPlayerName(), otherwise it will fail with a "Not logged" error message. 
    */

    function zombieTurn($state, $active_player) {
    	$statename = $state['name'];
    	
        if ($state['type'] === "activeplayer") {
            switch ($statename) {
                default:
                    $this->gamestate->nextState( "zombiePass" );
                	break;
            }

            return;
        }

        if ($state['type'] === "multipleactiveplayer") {
            // Make sure player is in a non blocking status for role turn
            $this->gamestate->setPlayerNonMultiactive( $active_player, '' );
            
            return;
        }

        throw new feException( "Zombie mode not supported at this game state: ".$statename );
    }
    
///////////////////////////////////////////////////////////////////////////////////:
////////// DB upgrade
//////////

    /*
        upgradeTableDb:
        
        You don't have to care about this until your game has been published on BGA.
        Once your game is on BGA, this method is called everytime the system detects a game running with your old
        Database scheme.
        In this case, if you change your Database scheme, you just have to apply the needed changes in order to
        update the game database and allow the game to continue to run with your new version.
    
    */
    
    function upgradeTableDb($from_version) {
        // $from_version is the current version of this game database, in numerical form.
        // For example, if the game was running with a release of your game named "140430-1345",
        // $from_version is equal to 1404301345
        
        // Example:
//        if( $from_version <= 1404301345 )
//        {
//            // ! important ! Use DBPREFIX_<table_name> for all tables
//
//            $sql = "ALTER TABLE DBPREFIX_xxxxxxx ....";
//            self::applyDbUpgradeToAllDB( $sql );
//        }
//        if( $from_version <= 1405061421 )
//        {
//            // ! important ! Use DBPREFIX_<table_name> for all tables
//
//            $sql = "CREATE TABLE DBPREFIX_xxxxxxx ....";
//            self::applyDbUpgradeToAllDB( $sql );
//        }
//        // Please add your future database scheme changes here
//
//


    }    
}
