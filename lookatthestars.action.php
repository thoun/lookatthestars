<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * LookAtTheStars implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on https://boardgamearena.com.
 * See http://en.doc.boardgamearena.com/Studio for more information.
 * -----
 * 
 * lookatthestars.action.php
 *
 * LookAtTheStars main action entry point
 *
 *
 * In this file, you are describing all the methods that can be called from your
 * user interface logic (javascript).
 *       
 * If you define a method "myAction" here, then you can call it from your javascript code with:
 * this.ajaxcall( "/lookatthestars/lookatthestars/myAction.html", ...)
 *
 */
  
  
  class action_lookatthestars extends APP_GameAction { 
    // Constructor: please do not modify
   	public function __default() {
  	    if (self::isArg( 'notifwindow')) {
          $this->view = "common_notifwindow";
          $this->viewArgs['table'] = self::getArg("table", AT_posint, true);
  	    } else {
          $this->view = "lookatthestars_lookatthestars";
          self::trace( "Complete reinitialization of board game" );
      }
  	} 

    public function placeShape() {
        self::setAjaxMode();     

        $x = self::getArg("x", AT_posint, true);
        $y = self::getArg("y", AT_posint, true);
        $rotation = self::getArg("rotation", AT_posint, true);

        // Then, call the appropriate method in your game logic, like "playCard" or "myAction"
        $this->game->placeShape($x, $y, $rotation);

        self::ajaxResponse();
    }

    public function cancelPlaceShape() {
      self::setAjaxMode();

      $this->game->cancelPlaceShape();

      self::ajaxResponse();
    }

  }
  

