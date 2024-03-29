/**
 * Your game interfaces
 */

interface Shape {
    lines: string[];
}
interface ShootingStar extends Shape {
    head: string;
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
    shootingStars: ShootingStar[];

    planets: string[];
    stars: string[];
    galaxies: string[];
    twinklingStars: string[];
    novas: string[];
    luminousAuras: string[];
    crescentMoons: string[];
    blackHoles: string[];
}

interface Constellation {
    key: string; // string coordinates of the lowest star (y coordinate). If multiple stars at same lowest, the closest to the left (x coordinate).
    lines: string[];
}

interface LookAtTheStarsPlayer extends Player {
    playerNo: number;
    sheetType: number;
    playerScore?: PlayerScore;
    lines: string[];
    roundLines?: string[];
    objects: Objects;
    roundObjects?: Objects;
    currentConstellations: Constellation[];
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
    liveScoring: boolean;
    cards: Card[];
    star1: number;
    star2: number;
    SHOOTING_STAR_SIZES: { [size: number]: ShootingStar };
}

interface LookAtTheStarsGame extends Game {
    day: number;
    cards: Cards;

    getPlayerId(): number;
    getPlayerColor(playerId: number): string;
    setTooltip(id: string, html: string): void;
    placeShape(): void;
    placeShootingStar(): void;
    placeLine(): void;
    confirmTurn(): void;
    cancelPlaceShape(): void;
    getSheetTooltipInfos(sheetType: number): { title: string, description: string };
    getPrivateGameStateName(): string;
}

interface EnteringPlaceCardArgs {
    shootingStar: boolean;
    currentCard: Card;
}

interface EnteringPlaceShapeArgs extends EnteringPlaceCardArgs {
    possiblePositions: number[][];
}

interface EnteringPlaceShootingStarArgs extends EnteringPlaceCardArgs {
    possiblePositions: { [size: number]: number[][] };
}

interface EnteringPlaceLineArgs {
    possibleLines: string[];
}

interface EnteringChooseCoordinatesArgs {
    possibleCoordinates: string[];
}

interface EnteringConfirmTurnArgs {
    canCancelBonus: boolean;
}

interface NotifCardArgs {
    card: Card;
}

interface NotifPlacedLinesArgs {
    playerId: number;
    lines: string[];
    currentConstellations: Constellation[];
    bonus?: boolean;
}
interface NotifPlacedShootingStarArgs extends NotifPlacedLinesArgs {
    head: string;
}
interface NotifPlacedCoordinatesArgs {
    playerId: number;
    coordinates: string;
}

interface NotifDayArgs {
    day: number;
}

interface NotifScoreArgs {
    playerId: number;
    score: number;
}

interface NotifLiveScoreArgs {
    playerId: number;
    playerScore: PlayerScore;
}

interface NotifScoreConstellationsArgs extends NotifScoreArgs {
    playerId: number;
    checkedConstellations: number[];
    incScore: number;
}
