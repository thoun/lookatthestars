
-- ------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- LookAtTheStars implementation : © <Your name here> <Your email address here>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-- -----

-- dbmodel.sql

-- This is the file where you are describing the database schema of your game
-- Basically, you just have to export from PhpMyAdmin your table structure and copy/paste
-- this export here.
-- Note that the database itself and the standard tables ("global", "stats", "gamelog" and "player") are
-- already created and must not be created here

-- Note: The database schema is created from this file when the game starts. If you modify this file,
--       you have to restart a game to see your changes in database.

CREATE TABLE IF NOT EXISTS `shape` (
   `card_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
   `card_type` smallint(1) NOT NULL,
   `card_type_arg` smallint(2) NOT NULL,
   `card_location` varchar(16) NOT NULL,
   `card_location_arg` int(11) NULL,
   PRIMARY KEY (`card_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

ALTER TABLE `player` ADD `player_sheet_type` INT UNSIGNED NOT NULL DEFAULT '0';
ALTER TABLE `player` ADD `player_lines` JSON;
ALTER TABLE `player` ADD `player_objects` JSON;
ALTER TABLE `player` ADD `player_round_lines` JSON;
ALTER TABLE `player` ADD `player_round_objects` JSON;
