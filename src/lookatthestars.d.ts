/**
 * Your game interfaces
 */

interface Shape {
    lines: number[][][];
}

interface Card extends Shape {
    id: number;
    type: number;
}

interface Sheet {
    lines: number[][][];    
    planets: number[][];
    forbiddenStars: number[][];
}

interface LookAtTheStarsPlayer extends Player {
    playerNo: number;
    sheetType: number;
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
    getPlayerId(): number;
    getPlayerColor(playerId: number): string;
}

interface EnteringPlaceDeparturePawnArgs {
    _private?: {
        tickets: number[];
        positions: number[];
    };
}

interface EnteringPlaceRouteArgs {
    playerId: number;
    canConfirm: boolean;
    canCancel: boolean;
    currentPosition: number;
    possibleRoutes: PossibleRoute[];
}

interface NotifNewRoundArgs {
    round: number;
    validatedTickets: number[];
    currentTicket: number | null;
}

interface NotifUpdateScoreSheetArgs {
    playerId: number;
    scoreSheets: ScoreSheets;
}

interface NotifPlacedDeparturePawnArgs {
    playerId: number;
    position: number;
} 

interface NotifPlacedRouteArgs {
    playerId: number;
    marker: PlacedRoute;
    zones: number[];
    position: number;
} 

interface NotifConfirmTurnArgs {
    playerId: number;
    markers: PlacedRoute[];
}

interface NotifFlipObjectiveArgs {
    objective: CommonObjective;
}

interface NotifRevealPersonalObjectiveArgs {
    playerId: number;
    personalObjective: number;
    personalObjectiveLetters: number[];
    personalObjectivePositions: number[];
}
