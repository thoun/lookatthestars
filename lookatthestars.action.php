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

        $x = self::getArg("x", AT_int, true);
        $y = self::getArg("y", AT_int, true);
        $rotation = self::getArg("rotation", AT_posint, true);

        $this->game->placeShape($x, $y, $rotation);

        self::ajaxResponse();
    }

    public function placeShootingStar() {
        self::setAjaxMode();     

        $x = self::getArg("x", AT_int, true);
        $y = self::getArg("y", AT_int, true);
        $rotation = self::getArg("rotation", AT_posint, true);
        $size = self::getArg("size", AT_posint, true);

        $this->game->placeShootingStar($x, $y, $rotation, $size);

        self::ajaxResponse();
    }

    public function placeLine() {
        self::setAjaxMode();     

        $xFrom = self::getArg("xFrom", AT_int, true);
        $yFrom = self::getArg("yFrom", AT_int, true);
        $xTo = self::getArg("xTo", AT_int, true);
        $yTo = self::getArg("yTo", AT_int, true);

        $this->game->placeLine($xFrom, $yFrom, $xTo, $yTo);

        self::ajaxResponse();
    }

    public function placePlanet() {
        self::setAjaxMode();     

        $x = self::getArg("x", AT_int, true);
        $y = self::getArg("y", AT_int, true);

        $this->game->placePlanet($x, $y);

        self::ajaxResponse();
    }

    public function placeStar() {
        self::setAjaxMode();     

        $x = self::getArg("x", AT_int, true);
        $y = self::getArg("y", AT_int, true);

        $this->game->placeStar($x, $y);

        self::ajaxResponse();
    }

    public function placeBlackHole() {
        self::setAjaxMode();     

        $x = self::getArg("x", AT_int, true);
        $y = self::getArg("y", AT_int, true);

        $this->game->placeBlackHole($x, $y);

        self::ajaxResponse();
    }

    public function placeCrescentMoon() {
        self::setAjaxMode();     

        $x = self::getArg("x", AT_int, true);
        $y = self::getArg("y", AT_int, true);

        $this->game->placeCrescentMoon($x, $y);

        self::ajaxResponse();
    }

    public function placeGalaxy() {
        self::setAjaxMode();     

        $x = self::getArg("x", AT_int, true);
        $y = self::getArg("y", AT_int, true);

        $this->game->placeGalaxy($x, $y);

        self::ajaxResponse();
    }

    public function placeTwinklingStar() {
        self::setAjaxMode();     

        $x = self::getArg("x", AT_int, true);
        $y = self::getArg("y", AT_int, true);

        $this->game->placeTwinklingStar($x, $y);

        self::ajaxResponse();
    }

    public function placeNova() {
        self::setAjaxMode();     

        $x = self::getArg("x", AT_int, true);
        $y = self::getArg("y", AT_int, true);

        $this->game->placeNova($x, $y);

        self::ajaxResponse();
    }

    public function placeLuminousAura() {
        self::setAjaxMode();     

        $x = self::getArg("x", AT_int, true);
        $y = self::getArg("y", AT_int, true);

        $this->game->placeLuminousAura($x, $y);

        self::ajaxResponse();
    }

    public function cancelPlaceShape() {
      self::setAjaxMode();

      $this->game->cancelPlaceShape();

      self::ajaxResponse();
    }

    public function cancelBonus() {
      self::setAjaxMode();

      $this->game->cancelBonus();

      self::ajaxResponse();
    }

    public function skipCard() {
      self::setAjaxMode();

      $this->game->skipCard();

      self::ajaxResponse();
    }

    public function skipBonus() {
      self::setAjaxMode();

      $this->game->skipBonus();

      self::ajaxResponse();
    }

    public function confirmTurn() {
      self::setAjaxMode();

      $this->game->confirmTurn();

      self::ajaxResponse();
    }

  }
  

