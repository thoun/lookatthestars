/**
 * Your game interfaces
 */

interface Shape {
    lines: string[];
}

interface Card extends Shape {
    id: number;
    type: number;
    typeArg: number;
}

interface Sheet {
    lines: number[][][];    
    planets: number[][];
    forbiddenStars: number[][];
}

interface PlayerScore {
    checkedConstellations: number[];
    constellations: number;
    planets: number;
    shootingStars: number;
    star1: number;
    star2: number;
    total: number;
}

interface Objects {
    // TODO
}

interface LookAtTheStarsPlayer extends Player {
    playerNo: number;
    sheetType: number;
    playerScore?: PlayerScore;
    lines: string[];
    objects: Objects;
}

interface LookAtTheStarsGamedatas {
    current_player_id: string;
    decision: {decision_type: string};
    game_result_neutralized: string;
    gamestate: Gamestate;
    gamestates: { [gamestateId: number]: Gamestate };
    neutralized_player_id: string;
    notifications: {last_packet_id: string, move_nbr: string}
    playerorder: (string | number)[];
    players: { [playerId: number]: LookAtTheStarsPlayer };
    tablespeed: string;

    // Add here variables you set up in getAllDatas
    cards: Card[];
    star1: number;
    star2: number;
    SHAPES: Shape[];
    SHEETS: Sheet[];
}

interface LookAtTheStarsGame extends Game {
    cards: Cards;

    getPlayerId(): number;
    getPlayerColor(playerId: number): string;
    setTooltip(id: string, html: string): void;
}

interface EnteringPlaceShapeArgs {
    currentShape: Card;
    possiblePositions: number[][][];
}

interface NotifCardArgs {
    card: Card;
}

interface NotifScoreArgs {
    playerId: number;
    score: number;
}

interface NotifScoreConstellationsArgs extends NotifScoreArgs {
    playerId: number;
    checkedConstellations: number[];
    incScore: number;
}
