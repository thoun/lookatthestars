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
 * material.inc.php
 *
 * LookAtTheStars game material description
 *
 * Here, you can describe the material of your game with PHP variables.
 *   
 * This file is loaded in your game logic class constructor, ie these variables
 * are available everywhere in your game logic code.
 *
 */


require_once('modules/php/objects/card.php');
require_once('modules/php/objects/sheet.php');

// [[x from, y from], [x to, y to]] lines coordinates, [0, 0] is left bottom
$this->SHAPES = [
  new CardType([[[1, 1], [1, 2]], [[1, 1], [2, 1]]]),
  new CardType([[[1, 2], [2, 2]], [[2, 1], [2, 2]]]),
  new CardType([[[1, 1], [2, 1]], [[2, 1], [3, 1]]]),
  new CardType([[[1, 1], [2, 2]], [[2, 2], [3, 3]]]),
  new CardType([[[1, 2], [2, 1]], [[2, 1], [3, 1]]]),
  new CardType([[[1, 1], [2, 1]], [[2, 1], [3, 2]]]),
  new CardType([[[1, 1], [2, 1]], [[2, 1], [1, 2]]]),
  new CardType([[[1, 1], [2, 1]], [[1, 1], [2, 2]]]),
  new CardType([[[0, 2], [1, 1]], [[2, 1], [3, 2]]]),
  new CardType([[[0, 1], [1, 2]], [[1, 2], [2, 1]]]),
  new CardType([[[1, 1], [1, 2]], [[2, 1], [2, 2]]]),
  new CardType([[[1, 1], [1, 2]], [[3, 1], [3, 2]]]),
  new CardType([[[0, 1], [0, 2]], [[3, 1], [3, 2]]]),
  new CardType([[[1, 1], [2, 0]], [[1, 3], [2, 2]]]),
  new CardType([[[1, 0], [2, 1]], [[1, 2], [2, 3]]]),
  new CardType([[[1, 1], [1, 2]], [[2, 1], [3, 1]]]),
  new CardType([[[1, 1], [1, 2]], [[2, 2], [3, 2]]]),
  new CardType([[[1, 1], [1, 2]], [[2, 1], [3, 2]]]),
  new CardType([[[1, 1], [1, 2]], [[2, 2], [3, 1]]]),
  new CardType([[[0, 1], [1, 1]], [[2, 2], [3, 2]]]),
  new CardType([[[0, 2], [1, 2]], [[2, 1], [3, 1]]]),
  new CardType([[[1, 1], [1, 2]], [[2, 2], [2, 3]]]),
  new CardType([[[1, 1], [1, 2]], [[2, 0], [2, 1]]]),
  new CardType([[[0, 1], [1, 1]], [[2, 1], [3, 1]]]),
  new CardType([[[0, 0], [1, 1]], [[2, 2], [3, 3]]]),
  new CardType([[[0, 2], [1, 1]], [[2, 1], [3, 1]]]),
  new CardType([[[0, 0], [1, 1]], [[2, 1], [3, 1]]]),
];

$this->SHEETS = [
  new Sheet(
    [[[7, 2], [8, 1]], [[4, 9], [5, 9]]],
    [[2, 2], [7, 5], [3, 8]],
    [[3, 0], [4, 0], [5, 0], [5, 1], [6, 0], [6, 1], [0, 5], [1, 5], [2, 5], [3, 5], [0, 6], [1, 6], [6, 8], [7, 8], [6, 9], [7, 9], [6, 10]]
  ),
  new Sheet(
    [[[8, 1], [8, 2]], [[4, 9], [5, 10]]],
    [[2, 2], [8, 5], [3, 8]],
    [[3, 0], [4, 0], [4, 1], [5, 0], [6, 0], [6, 1], [0, 5], [1, 5], [2, 5], [0, 6], [1, 6], [2, 6], [7, 7], [8, 7], [6, 8], [7, 8], [8, 8]]
  ),
  new Sheet(
    [[[1, 1], [2, 2]], [[6, 9], [7, 9]]],
    [[6, 2], [1, 5], [5, 8]],
    [[3, 0], [3, 1], [4, 0], [4, 1], [5, 0], [6, 0], [6, 5], [7, 5], [8, 5], [9, 5], [8, 6], [9, 9], [2, 8], [3, 8], [2, 9], [3, 9], [3, 10]]
  ),
  new Sheet(
    [[[8, 2], [9, 1]], [[4, 9], [5, 9]]],
    [[1, 2], [7, 5], [3, 8]],
    [[4, 0], [4, 1], [5, 0], [5, 1], [6, 0], [6, 1], [0, 5], [1, 5], [2, 5], [3, 5], [0, 6], [1, 6], [6, 8], [7, 8], [8, 8], [6, 9], [7, 9]]
  ),
  new Sheet(
    [[[0, 1], [0, 2]], [[4, 10], [5, 9]]],
    [[8, 2], [2, 5], [6, 8]],
    [[3, 0], [3, 1], [4, 0], [5, 0], [5, 1], [6, 0], [7, 5], [8, 5], [9, 5], [7, 6], [8, 6], [9, 6], [1, 7], [2, 7], [1, 8], [2, 8], [3,8]]
  ),
  new Sheet(
    [[[7, 1], [8, 2]], [[4, 9], [4, 10]]],
    [[2, 2], [7, 5], [3, 8]],
    [[4, 0], [4, 1], [5, 0], [5, 1], [6, 0], [6, 1], [0, 5], [1, 5], [2, 5], [0, 6], [1, 6], [2, 6], [6, 8], [7, 8], [9, 8], [6, 9], [7, 9]]
  ),
  new Sheet(
    [[[1, 1], [1, 2]], [[4, 9], [5, 10]]],
    [[7, 2], [2, 5], [6, 8]],
    [[3, 0], [3, 1], [4, 0], [4, 1], [5, 0], [5, 1], [7, 5], [8, 5], [9, 5], [7, 6], [8, 6], [9, 6], [1, 8], [2, 8], [3, 8], [2, 9], [3, 9]]
  ),
  new Sheet(
    [[[8, 1], [9, 2]], [[5, 9], [5, 10]]],
    [[1, 2], [7, 5], [3, 8]],
    [[3, 0], [3, 1], [4, 0], [5, 0], [6, 0], [6, 1], [0, 5], [1, 5], [0, 6], [1, 6], [2, 6], [3, 6], [7, 7], [8, 7], [7, 8], [8, 8], [7, 9]]
  ),
];

