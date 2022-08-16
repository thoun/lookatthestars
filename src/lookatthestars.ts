declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;

const ANIMATION_MS = 500;
const SCORE_MS = 1/*TODO 000 */;

const ZOOM_LEVELS = [0.5, 0.625, 0.75, 0.875, 1/*, 1.25, 1.5*/];
const ZOOM_LEVELS_MARGIN = [-100, -60, -33, -14, 0/*, 20, 33.34*/];
const LOCAL_STORAGE_ZOOM_KEY = 'LookAtTheStars-zoom';

function formatTextIcons(rawText: string) {
    if (!rawText) {
        return '';
    }
    return rawText
        .replace(/\[CardBack\]/ig, '<div class="icon moon"></div>')
        .replace(/\[Star5\]/ig, '<div class="icon star5"></div>')
        .replace(/\[Star7\]/ig, '<div class="icon star7"></div>')
}

class LookAtTheStars implements LookAtTheStarsGame {
    public zoom: number = 0.75;
    public cards: Cards;
    public day: number = 0;

    private gamedatas: LookAtTheStarsGamedatas;
    private tableCenter: TableCenter;
    private playersTables: PlayerTable[] = [];
    private registeredTablesByPlayerId: PlayerTable[][] = [];
    
    private TOOLTIP_DELAY = document.body.classList.contains('touch-device') ? 1500 : undefined;

    constructor() {
        const zoomStr = localStorage.getItem(LOCAL_STORAGE_ZOOM_KEY);
        if (zoomStr) {
            this.zoom = Number(zoomStr);
        }
    }
    
    /*
        setup:

        This method must set up the game user interface according to current game situation specified
        in parameters.

        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)

        "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
    */

    public setup(gamedatas: LookAtTheStarsGamedatas) {
        const players = Object.values(gamedatas.players);
        // ignore loading of some pictures
        [1,2,3,4,5,6,7,8].filter(i => !players.some(player => Number(player.sheetType) === i)).forEach(i => {
            (this as any).dontPreloadImage(`sheet-${i}.png`);
        });

        log( "Starting game setup" );
        
        this.gamedatas = gamedatas;

        log('gamedatas', gamedatas);

        if (gamedatas.cards.length <= 6) {
            this.day = 2;
        } else if (gamedatas.cards.length <= 12) {
            this.day = 1;
        }

        this.cards = new Cards(this);
        this.tableCenter = new TableCenter(this, gamedatas);
        this.createPlayerTables(gamedatas);
        this.createPlayerJumps(gamedatas);

        this.setupNotifications();
        this.setupPreferences();

        document.getElementById('zoom-out').addEventListener('click', () => this.zoomOut());
        document.getElementById('zoom-in').addEventListener('click', () => this.zoomIn());
        if (this.zoom !== 1) {
            this.setZoom(this.zoom);
        }

        if (Number(gamedatas.gamestate.id) >= 90) { // score or end
            this.onEnteringShowScore();
        }

        log( "Ending game setup" );
    }

    ///////////////////////////////////////////////////
    //// Game & client states

    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    public onEnteringState(stateName: string, args: any) {
        log('Entering state: ' + stateName, args.args);

        switch (stateName) {
            case 'placeShape':
                this.onEnteringPlaceShape(args.args);
                break;
            case 'placeLine':
                this.onEnteringPlaceLine(args.args);
                break;
            case 'placePlanet':
                this.onEnteringStarSelection(args.args, (x, y) => this.placePlanet(x, y));
                break;
            case 'nextShape':
                this.onEnteringNextShape();
                break;
            case 'endScore':
                this.onEnteringShowScore();
                break;
        }
    }
    
    private onEnteringPlaceShape(args: EnteringPlaceShapeArgs | EnteringPlaceShootingStarArgs) {
        this.getCurrentPlayerTable()?.setShapeToPlace(args.currentCard, args.possiblePositions as any);
    }
    
    private onEnteringPlaceLine(args: EnteringPlaceLineArgs) {
        this.getCurrentPlayerTable()?.setLineToPlace(args.possibleLines as any);
    }
    
    onEnteringStarSelection(args: EnteringChooseCoordinatesArgs, placeFunction: (x: number, y: number) => void) {
        this.getCurrentPlayerTable()?.setStarSelection(args.possibleCoordinates, placeFunction);
    }

    onEnteringNextShape() {
        this.playersTables.forEach(playerTable => playerTable.nextShape());
    }

    onEnteringShowScore() {
        Object.keys(this.gamedatas.players).forEach(playerId => (this as any).scoreCtrl[playerId]?.setValue(0));
    }

    public onLeavingState(stateName: string) {
        log( 'Leaving state: '+stateName );

        switch (stateName) {
            case 'placeShape':
                this.onLeavingPlaceShape();
                break;
            case 'placeLine':
                this.onLeavingPlaceLine();
                break;
            case 'placePlanet':
                this.onLeavingStarSelection();
                break;
        }
    }
    
    private onLeavingPlaceShape() {
        this.getCurrentPlayerTable()?.removeShapeToPlace();
    }

    private onLeavingPlaceLine() {
        this.getCurrentPlayerTable()?.removeLineToPlace();
    }

    private onLeavingStarSelection() {
        this.getCurrentPlayerTable()?.removeStarSelection();
    }

    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    public onUpdateActionButtons(stateName: string, args: any) {
        log( 'onUpdateActionButtons: '+stateName, args );

        if ((this as any).isCurrentPlayerActive()) {
            switch (stateName) {
                case 'placeShape':
                    const placeCardArg = args as EnteringPlaceCardArgs;
                    if (placeCardArg.currentCard.type == 1) {
                        [1, 2, 3].forEach(size => {
                            (this as any).addActionButton(`setShootingStarSize_button${size}`, _('${size}-line(s) shooting star').replace('${size}', size), () => this.getCurrentPlayerTable().setShootingStarSize(size), null, null, 'gray');
                            const buttonDiv = document.getElementById(`setShootingStarSize_button${size}`);
                            buttonDiv.classList.add('setShootingStarSizeButton');
                            buttonDiv.dataset.shootingStarSize = ''+size;
                            buttonDiv.classList.toggle('current-size', size == 3);
                        });
                        (this as any).addActionButton(`placeShootingStar_button`, _("Place shooting star"), () => this.placeShootingStar());
                    } else if (placeCardArg.currentCard.type == 2) {
                        (this as any).addActionButton(`placeShape_button`, _("Place shape"), () => this.placeShape());
                    }
                    (this as any).addActionButton(`skipCard_button`, _("Skip this card"), () => this.skipCard(), null, null, 'red');
                    break;
                case 'placeLine':
                    (this as any).addActionButton(`placeLine_button`, _("Place line"), () => this.placeLine());
                    (this as any).addActionButton(`skipBonus_button`, _("Skip bonus"), () => this.skipBonus(), null, null, 'red');
                    (this as any).addActionButton(`cancelPlaceShape_button`, _("Cancel"), () => this.cancelPlaceShape(), null, null, 'gray');
                    break;
                case 'placePlanet':
                    (this as any).addActionButton(`skipBonus_button`, _("Skip bonus"), () => this.skipBonus(), null, null, 'red');
                    (this as any).addActionButton(`cancelPlaceShape_button`, _("Cancel"), () => this.cancelPlaceShape(), null, null, 'gray');
                    break;
                case 'confirmTurn':
                    (this as any).addActionButton(`confirmTurn_button`, _("Confirm turn"), () => this.confirmTurn());
                    this.startActionTimer(`confirmTurn_button`, 10);
                    const confirmTurnArgs = args as EnteringConfirmTurnArgs;
                    if (confirmTurnArgs.canCancelBonus) {
                        (this as any).addActionButton(`cancelBonus_button`, _("Cancel bonus"), () => this.cancelBonus(), null, null, 'gray');
                    }
                    (this as any).addActionButton(`cancelPlaceShape_button`, _("Cancel turn"), () => this.cancelPlaceShape(), null, null, 'gray');
                    break;
            }
        } else if (stateName == 'playCard') {
            (this as any).addActionButton(`cancelPlaceShape_button`, _("Cancel"), () => this.cancelPlaceShape(), null, null, 'gray');
            this.onLeavingPlaceShape();
            this.onLeavingPlaceLine();
            this.onLeavingStarSelection();
        }
    } 
    

    ///////////////////////////////////////////////////
    //// Utility methods


    ///////////////////////////////////////////////////

    public getPlayerId(): number {
        return Number((this as any).player_id);
    }

    public getPlayerColor(playerId: number): string {
        return this.gamedatas.players[playerId].color;
    }    

    private getPlayer(playerId: number): LookAtTheStarsPlayer {
        return Object.values(this.gamedatas.players).find(player => Number(player.id) == playerId);
    }

    private getPlayerTable(playerId: number): PlayerTable {
        return this.playersTables.find(playerTable => playerTable.playerId === playerId);
    }

    private getCurrentPlayerTable(): PlayerTable | null {
        return this.playersTables.find(playerTable => playerTable.playerId === this.getPlayerId());
    }
    
    public setTooltip(id: string, html: string) {
        (this as any).addTooltipHtml(id, html, this.TOOLTIP_DELAY);
    }

    private setZoom(zoom: number = 1) {
        this.zoom = zoom;
        localStorage.setItem(LOCAL_STORAGE_ZOOM_KEY, ''+this.zoom);
        const newIndex = ZOOM_LEVELS.indexOf(this.zoom);
        dojo.toggleClass('zoom-in', 'disabled', newIndex === ZOOM_LEVELS.length - 1);
        dojo.toggleClass('zoom-out', 'disabled', newIndex === 0);

        const div = document.getElementById('full-table');
        if (zoom === 1) {
            div.style.transform = '';
            div.style.margin = '';
        } else {
            div.style.transform = `scale(${zoom})`;
            div.style.margin = `0 ${ZOOM_LEVELS_MARGIN[newIndex]}% ${(1-zoom)*-100}% 0`;
        }

        document.getElementById('zoom-wrapper').style.height = `${div.getBoundingClientRect().height}px`;
    }

    public zoomIn() {
        if (this.zoom === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]) {
            return;
        }
        const newIndex = ZOOM_LEVELS.indexOf(this.zoom) + 1;
        this.setZoom(ZOOM_LEVELS[newIndex]);
    }

    public zoomOut() {
        if (this.zoom === ZOOM_LEVELS[0]) {
            return;
        }
        const newIndex = ZOOM_LEVELS.indexOf(this.zoom) - 1;
        this.setZoom(ZOOM_LEVELS[newIndex]);
    }

    private setupPreferences() {
        // Extract the ID and value from the UI control
        const onchange = (e) => {
          var match = e.target.id.match(/^preference_control_(\d+)$/);
          if (!match) {
            return;
          }
          var prefId = +match[1];
          var prefValue = +e.target.value;
          (this as any).prefs[prefId].value = prefValue;
          this.onPreferenceChange(prefId, prefValue);
        }
        
        // Call onPreferenceChange() when any value changes
        dojo.query(".preference_control").connect("onchange", onchange);
        
        // Call onPreferenceChange() now
        dojo.forEach(
          dojo.query("#ingame_menu_content .preference_control"),
          el => onchange({ target: el })
        );

        try {
            (document.getElementById('preference_control_203').closest(".preference_choice") as HTMLDivElement).style.display = 'none';
        } catch (e) {}
    }
      
    private onPreferenceChange(prefId: number, prefValue: number) {
        switch (prefId) {
            case 204:
                document.getElementsByTagName('html')[0].dataset.noBuilding = (prefValue == 2).toString();
                break;
            case 205:
                document.getElementsByTagName('html')[0].dataset.noGrid = (prefValue == 2).toString();
                break;
        }
    }

    private getOrderedPlayers(gamedatas: LookAtTheStarsGamedatas) {
        const players = Object.values(gamedatas.players).sort((a, b) => a.playerNo - b.playerNo);
        const playerIndex = players.findIndex(player => Number(player.id) === Number((this as any).player_id));
        const orderedPlayers = playerIndex > 0 ? [...players.slice(playerIndex), ...players.slice(0, playerIndex)] : players;
        return orderedPlayers;
    }

    private createPlayerTables(gamedatas: LookAtTheStarsGamedatas) {
        const orderedPlayers = this.getOrderedPlayers(gamedatas);

        orderedPlayers.forEach(player => 
            this.createPlayerTable(gamedatas, Number(player.id))
        );
    }

    private createPlayerTable(gamedatas: LookAtTheStarsGamedatas, playerId: number) {
        const table = new PlayerTable(this, gamedatas.players[playerId]);
        this.playersTables.push(table);
        this.registeredTablesByPlayerId[playerId] = [table];
    }

    private createPlayerJumps(gamedatas: LookAtTheStarsGamedatas) {
        dojo.place(`
        <div id="jump-toggle" class="jump-link toggle">
            ⇔
        </div>
        <div id="jump-0" class="jump-link">
            <div class="eye"></div> ${formatTextIcons('[CardBack][Star5][Star7]')}
        </div>`, `jump-controls`);

        document.getElementById(`jump-toggle`).addEventListener('click', () => this.jumpToggle());
        document.getElementById(`jump-0`).addEventListener('click', () => this.jumpToPlayer(0));
        
        const orderedPlayers = this.getOrderedPlayers(gamedatas);

        orderedPlayers.forEach(player => {
            dojo.place(`<div id="jump-${player.id}" class="jump-link" style="color: #${player.color}; border-color: #${player.color};"><div class="eye" style="background: #${player.color};"></div> ${player.name}</div>`, `jump-controls`);
            document.getElementById(`jump-${player.id}`).addEventListener('click', () => this.jumpToPlayer(Number(player.id)));	
        });

        const jumpDiv = document.getElementById(`jump-controls`);
        jumpDiv.style.marginTop = `-${Math.round(jumpDiv.getBoundingClientRect().height / 2)}px`;
    }
    
    private jumpToggle(): void {
        document.getElementById(`jump-controls`).classList.toggle('folded');
    }
    
    private jumpToPlayer(playerId: number): void {
        const elementId = playerId === 0 ? `cards` : `player-table-${playerId}`;
        document.getElementById(elementId).scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
    
    private setPoints(playerId: number, points: number) {
        (this as any).scoreCtrl[playerId]?.toValue(points);
        this.getPlayerTable(playerId).setFinalScore(points);
    }

    public placeShape() {
        if(!(this as any).checkAction('placeShape')) {
            return;
        }

        const informations = this.getCurrentPlayerTable().getShapeInformations();
        this.takeAction('placeShape', informations);
    }

    public placeShootingStar() {
        if(!(this as any).checkAction('placeShootingStar')) {
            return;
        }

        const informations = this.getCurrentPlayerTable().getShootingStarInformations();
        this.takeAction('placeShootingStar', informations);
    }

    public placeLine() {
        if(!(this as any).checkAction('placeLine')) {
            return;
        }

        const informations = this.getCurrentPlayerTable().getLineInformations();
        this.takeAction('placeLine', informations);
    }

    public placePlanet(x: number, y: number) {
        if(!(this as any).checkAction('placePlanet')) {
            return;
        }

        this.takeAction('placePlanet', { x, y });
    }

    public cancelPlaceShape() {
        /*if(!(this as any).checkAction('cancelPlaceShape')) {
            return;
        }*/

        this.takeAction('cancelPlaceShape');
    }

    public cancelBonus() {
        if(!(this as any).checkAction('cancelBonus')) {
            return;
        }

        this.takeAction('cancelBonus');
    }

    public skipCard() {
        if(!(this as any).checkAction('skipCard')) {
            return;
        }

        this.takeAction('skipCard');
    }

    public skipBonus() {
        if(!(this as any).checkAction('skipBonus')) {
            return;
        }

        this.takeAction('skipBonus');
    }

    public confirmTurn() {
        if(!(this as any).checkAction('confirmTurn')) {
            return;
        }

        this.takeAction('confirmTurn');
    }

    public takeAction(action: string, data?: any) {
        data = data || {};
        data.lock = true;
        (this as any).ajaxcall(`/lookatthestars/lookatthestars/${action}.html`, data, this, () => {});
    }

    private startActionTimer(buttonId: string, time: number) {
        if (Number((this as any).prefs[200]?.value) === 2) {
            return;
        }

        const button = document.getElementById(buttonId);
 
        let actionTimerId = null;
        const _actionTimerLabel = button.innerHTML;
        let _actionTimerSeconds = time;
        const actionTimerFunction = () => {
          const button = document.getElementById(buttonId);
          if (button == null || button.classList.contains('disabled')) {
            window.clearInterval(actionTimerId);
          } else if (_actionTimerSeconds-- > 1) {
            button.innerHTML = _actionTimerLabel + ' (' + _actionTimerSeconds + ')';
          } else {
            window.clearInterval(actionTimerId);
            button.click();
          }
        };
        actionTimerFunction();
        actionTimerId = window.setInterval(() => actionTimerFunction(), 1000);
    }

    ///////////////////////////////////////////////////
    //// Reaction to cometD notifications

    /*
        setupNotifications:

        In this method, you associate each of your game notifications with your local method to handle it.

        Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                your pylos.game.php file.

    */
    setupNotifications() {
        //log( 'notifications subscriptions setup' );

        const notifs = [
            ['discardShape', ANIMATION_MS],
            ['newShape', ANIMATION_MS],
            ['placedLines', 1],
            ['placedShootingStar', 1],
            ['placedPlanet', 1],
            ['cancelPlacedLines', 1],
            ['cancelBonus', 1],
            ['day', 1],
            ['score', 1],
            ['scoreConstellations', SCORE_MS],
            ['scorePlanets', SCORE_MS],
            ['scoreShootingStars', SCORE_MS],
            ['scoreStar1', SCORE_MS],
            ['scoreStar2', SCORE_MS],
        ];
    
        notifs.forEach((notif) => {
            dojo.subscribe(notif[0], this, `notif_${notif[0]}`);
            (this as any).notifqueue.setSynchronous(notif[0], notif[1]);
        });
    }

    notif_discardShape(notif: Notif<NotifCardArgs>) {
        (this as any).slideToObjectAndDestroy(`card-${notif.args.card.id}`, 'topbar');
    }

    notif_newShape(notif: Notif<NotifCardArgs>) {
        this.cards.createMoveOrUpdateCard(notif.args.card);
    }

    notif_placedLines(notif: Notif<NotifPlacedLinesArgs>) {
        this.getPlayerTable(notif.args.playerId).placeLines(notif.args.lines, ['round']);
    }
    notif_placedShootingStar(notif: Notif<NotifPlacedShootingStarArgs>) {
        this.getPlayerTable(notif.args.playerId).placeLines(notif.args.lines, ['round']);
        this.getPlayerTable(notif.args.playerId).placeShootingStarHead(notif.args.head, ['round']);
    }
    notif_placedPlanet(notif: Notif<NotifPlacedCoordinatesArgs>) {
        this.getPlayerTable(notif.args.playerId).placeObject(notif.args.coordinates, 'planet', ['round', 'round-bonus']);
    }

    notif_cancelPlacedLines(notif: Notif<NotifPlacedLinesArgs>) {
        this.getPlayerTable(notif.args.playerId).cancelPlacedLines();
    }

    notif_cancelBonus(notif: Notif<NotifPlacedLinesArgs>) {
        this.getPlayerTable(notif.args.playerId).cancelBonus();
    }

    notif_day(notif: Notif<NotifDayArgs>) {
        this.day = notif.args.day;
        this.playersTables.forEach(playerTable => playerTable.setDay(this.day));
    }

    notif_score(notif: Notif<NotifScoreArgs>) {
        this.setPoints(notif.args.playerId, notif.args.score);
    }

    notif_scoreConstellations(notif: Notif<NotifScoreConstellationsArgs>) {
        this.getPlayerTable(notif.args.playerId).setConstellationsScore(notif.args.checkedConstellations, notif.args.score);
    }

    notif_scorePlanets(notif: Notif<NotifScoreArgs>) {
        this.getPlayerTable(notif.args.playerId).setPlanetScore(notif.args.score);
    }

    notif_scoreShootingStars(notif: Notif<NotifScoreArgs>) {
        this.getPlayerTable(notif.args.playerId).setShootingStarsScore(notif.args.score);
    }

    notif_scoreStar1(notif: Notif<NotifScoreArgs>) {
        this.getPlayerTable(notif.args.playerId).setStar1Score(notif.args.score);
    }

    notif_scoreStar2(notif: Notif<NotifScoreArgs>) {
        this.getPlayerTable(notif.args.playerId).setStar2Score(notif.args.score);
    }    

    /* This enable to inject translatable styled things to logs or action bar */
    /* @Override */
    public format_string_recursive(log: string, args: any) {
        try {
            if (log && args && !args.processed) {
                ['points', 'scoring'].forEach(field => {
                    if (args[field] !== null && args[field] !== undefined && args[field][0] != '<') {
                        args[field] = `<strong>${_(args[field])}</strong>`;
                    }
                });

                for (const property in args) {
                    if (args[property]?.indexOf?.(']') > 0) {
                        args[property] = formatTextIcons(_(args[property]));
                    }
                }

                log = formatTextIcons(_(log));
            }
        } catch (e) {
            console.error(log,args,"Exception thrown", e.stack);
        }
        return (this as any).inherited(arguments);
    }
}