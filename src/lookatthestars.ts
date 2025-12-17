const ANIMATION_MS = 500;
const SCORE_MS = 1500;

const ZOOM_LEVELS = [0.5, 0.625, 0.75, 0.875, 1];
const ZOOM_LEVELS_MARGIN = [-100, -60, -33, -14, 0];
const LOCAL_STORAGE_ZOOM_KEY = 'LookAtTheStars-zoom';
const LOCAL_STORAGE_JUMP_KEY = 'LookAtTheStars-jump-to-folded';

function formatTextIcons(rawText: string) {
    if (!rawText) {
        return '';
    }
    return rawText
        .replace(/\[CardBack\]/ig, '<div class="icon moon"></div>')
        .replace(/\[Star5\]/ig, '<div class="icon star5"></div>')
        .replace(/\[Star7\]/ig, '<div class="icon star7"></div>')
}

// @ts-ignore
GameGui = (function () { // this hack required so we fake extend GameGui
  function GameGui() {}
  return GameGui;
})();

class LookAtTheStars extends GameGui<LookAtTheStarsGamedatas> implements LookAtTheStarsGame {
    public zoom: number = 0.75;
    public cards: Cards;
    public day: number = 0;

    public gamedatas: LookAtTheStarsGamedatas;
    private tableCenter: TableCenter;
    private playersTables: PlayerTable[] = [];
    private registeredTablesByPlayerId: PlayerTable[][] = [];
    
    private TOOLTIP_DELAY = document.body.classList.contains('touch-device') ? 1500 : undefined;

    public gameui: GameGui<LookAtTheStarsGamedatas>;
    public statusBar: StatusBar;
    public images: Images;
    public sounds: Sounds;
    public userPreferences: UserPreferences;
    public players: Players;
    public actions: Actions;
    public notifications: Notifications;
    public gameArea: GameArea;
    public playerPanels: PlayerPanels;
    public dialogs: Dialogs;

    constructor() {
        super();
        Object.assign(this, this.bga);

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
            this.images.dontPreloadImage(`sheet-${i}.png`);
        });

        log( "Starting game setup" );
        
        this.gamedatas = gamedatas;

        log('gamedatas', gamedatas);

        this.gameArea.getElement().insertAdjacentHTML('beforeend', `
            <div id="zoom-wrapper">
                <div id="full-table">
                    <div id="cards">
                        <div id="objectives"></div>
                        <div id="shapes"></div>
                    </div>
                    <div id="tables">
                    </div>
                </div>
                <div id="zoom-controls">
                    <button id="zoom-out"></button>
                    <button id="zoom-in"></button>
                </div>
                <div id="jump-controls">
                </div>
            </div>
        `);

        if (gamedatas.cards.length <= 6) {
            this.day = 2;
        } else if (gamedatas.cards.length <= 12) {
            this.day = 1;
        }

        document.getElementById('jump-controls').classList.toggle('folded', localStorage.getItem(LOCAL_STORAGE_JUMP_KEY) == 'true');

        this.cards = new Cards(this);
        this.tableCenter = new TableCenter(this, gamedatas);
        this.createPlayerTables(gamedatas);
        this.createPlayerJumps(gamedatas);

        //document.addEventListener('keyup', e => this.getCurrentPlayerTable()?.onKeyPress(e));
        document.getElementsByTagName('body')[0].addEventListener('keydown', e => this.getCurrentPlayerTable()?.onKeyPress(e));

        this.setupNotifications();
        this.addHelp();

        document.getElementById('zoom-out').addEventListener('click', () => this.zoomOut());
        document.getElementById('zoom-in').addEventListener('click', () => this.zoomIn());
        if (this.zoom !== 1) {
            this.setZoom(this.zoom);
        }

        if (Number(gamedatas.gamestate.id) >= 90) { // score or end
            this.onEnteringShowScore();
        }

        this.onScreenWidthChange = () => {
            this.updateTableHeight();
        };

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
            case 'placeStar':
                this.onEnteringStarSelection(args.args, (x, y) => this.placeStar(x, y));
                break;
            case 'placeBlackHole':
                this.onEnteringStarSelection(args.args, (x, y) => this.placeBlackHole(x, y));
                break;
            case 'placeCrescentMoon':
                this.onEnteringStarSelection(args.args, (x, y) => this.placeCrescentMoon(x, y));
                break;
            case 'placeGalaxy':
                this.onEnteringStarSelection(args.args, (x, y) => this.placeGalaxy(x, y), 'galaxy');
                break;
            case 'placeTwinklingStar':
                this.onEnteringStarSelection(args.args, (x, y) => this.placeTwinklingStar(x, y));
                break;
            case 'placeNova':
                this.onEnteringStarSelection(args.args, (x, y) => this.placeNova(x, y));
                break;
            case 'placeLuminousAura':
                this.onEnteringStarSelection(args.args, (x, y) => this.placeLuminousAura(x, y));
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
        document.getElementById(`card-${args.currentCard.id}`).classList.add('highlight-current-shape');
    }

    private onEnteringBonus() {
        document.getElementById('star2').classList.add('highlight-objective');
    }
    
    private onEnteringPlaceLine(args: EnteringPlaceLineArgs) {
        this.getCurrentPlayerTable()?.setLineToPlace(args.possibleLines as any);
        this.onEnteringBonus();
    }
    
    private onEnteringStarSelection(args: EnteringChooseCoordinatesArgs, placeFunction: (x: number, y: number) => void, specialType: 'galaxy' | null = null) {
        this.getCurrentPlayerTable()?.setStarSelection(args.possibleCoordinates, placeFunction, specialType);
        this.onEnteringBonus();
    }

    private onEnteringNextShape() {
        this.playersTables.forEach(playerTable => playerTable.nextShape());
    }

    onEnteringShowScore() {
        Object.keys(this.gamedatas.players).forEach(playerId => this.scoreCtrl[playerId]?.setValue(0));
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
            case 'placeStar':
            case 'placeBlackHole':
            case 'placeCrescentMoon':
            case 'placeGalaxy':
            case 'placeTwinklingStar':
            case 'placeNova':
            case 'placeLuminousAura':
                this.onLeavingStarSelection();
                break;
        }
    }
    
    private onLeavingPlaceShape() {
        this.getCurrentPlayerTable()?.removeShapeToPlace();
        document.querySelector(`.highlight-current-shape`)?.classList.remove('highlight-current-shape');
    }

    private onLeavingBonus() {
        document.getElementById('star2').classList.remove('highlight-objective');
    }

    private onLeavingPlaceLine() {
        this.getCurrentPlayerTable()?.removeLineToPlace();
        this.onLeavingBonus();
    }

    private onLeavingStarSelection() {
        this.getCurrentPlayerTable()?.removeStarSelection();
        this.onLeavingBonus();
    }

    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    public onUpdateActionButtons(stateName: string, args: any) {
        log( 'onUpdateActionButtons: '+stateName, args );

        if (this.players.isCurrentPlayerActive()) {
            switch (stateName) {
                case 'placeShape':
                    const placeCardArg = args as EnteringPlaceCardArgs;
                    if (placeCardArg.currentCard.type == 1) {
                        [1, 2, 3].forEach(size => {
                            this.statusBar.addActionButton(_('${size}-line(s) shooting star').replace('${size}', ''+size), () => this.getCurrentPlayerTable().setShootingStarSize(size), { id: `setShootingStarSize_button${size}`, color: 'secondary' });
                            const buttonDiv = document.getElementById(`setShootingStarSize_button${size}`);
                            buttonDiv.classList.add('setShootingStarSizeButton');
                            buttonDiv.dataset.shootingStarSize = ''+size;
                            buttonDiv.classList.toggle('current-size', size == 3);
                        });
                        this.statusBar.addActionButton(_("Place shooting star"), () => this.placeShootingStar(), { id: `placeShootingStar_button` });
                    } else if (placeCardArg.currentCard.type == 2) {
                        this.statusBar.addActionButton(_("Place shape"), () => this.placeShape(), { id: `placeShape_button` });
                    }
                    this.statusBar.addActionButton(_("Skip this card"), () => this.skipCard(), { color: 'alert' });
                    break;
                case 'placeLine':
                    this.statusBar.addActionButton(_("Place line"), () => this.placeLine(), { id: `placeLine_button` });
                    this.statusBar.addActionButton(_("Skip bonus"), () => this.skipBonus(), { color: 'alert' });
                    this.statusBar.addActionButton(_("Cancel"), () => this.cancelPlaceShape(), { color: 'secondary' });
                    break;
                case 'placePlanet':
                case 'placeStar':
                case 'placeBlackHole':
                case 'placeCrescentMoon':
                case 'placeGalaxy':
                case 'placeTwinklingStar':
                case 'placeNova':
                case 'placeLuminousAura':
                    this.statusBar.addActionButton(_("Skip bonus"), () => this.skipBonus(), { color: 'alert' });
                    this.statusBar.addActionButton(_("Cancel"), () => this.cancelPlaceShape(), { color: 'secondary' });
                    break;
                case 'confirmTurn':
                    this.statusBar.addActionButton(_("Confirm turn"), () => this.confirmTurn(), { autoclick: this.userPreferences.get(100) === 1 });
                    const confirmTurnArgs = args as EnteringConfirmTurnArgs;
                    if (confirmTurnArgs.canCancelBonus) {
                        this.statusBar.addActionButton(_("Cancel bonus"), () => this.cancelBonus(), { color: 'secondary' });
                    }
                    this.statusBar.addActionButton(_("Cancel turn"), () => this.cancelPlaceShape(), { color: 'secondary' });
                    break;
            }
        } else if (stateName == 'playCard') {
            this.statusBar.addActionButton(_("Cancel"), () => this.cancelPlaceShape(), { color: 'secondary' });
            this.onLeavingPlaceShape();
            this.onLeavingPlaceLine();
            this.onLeavingStarSelection();
        }
    } 
    

    ///////////////////////////////////////////////////
    //// Utility methods


    ///////////////////////////////////////////////////

    public getPlayerId(): number {
        return Number(this.player_id);
    }

    public getPlayerColor(playerId: number): string {
        return this.gamedatas.players[playerId].color;
    }

    private getPlayerTable(playerId: number): PlayerTable {
        return this.playersTables.find(playerTable => playerTable.playerId === playerId);
    }

    private getCurrentPlayerTable(): PlayerTable | null {
        return this.playersTables.find(playerTable => playerTable.playerId === this.getPlayerId());
    }

    public getPrivateGameStateName(): string {
        return this.gamedatas.gamestate.private_state?.name;
    }
    
    public setTooltip(id: string, html: string) {
        this.addTooltipHtml(id, html, this.TOOLTIP_DELAY);
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

        this.updateTableHeight();
    }

    public updateTableHeight() {
        document.getElementById('zoom-wrapper').style.height = `${document.getElementById('full-table').getBoundingClientRect().height}px`;
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
      
    onGameUserPreferenceChanged = (prefId: number, prefValue: number) => {
        switch (prefId) {
            case 201:
                document.getElementsByTagName('html')[0].dataset.noCounter = (prefValue == 2).toString();
                break;
            case 202:
                document.getElementsByTagName('html')[0].dataset.defaultBackground = (prefValue == 2).toString();
                break;
            case 299: 
                this.toggleKeysNotice(prefValue == 1);
                break;
        }
    }

    private toggleKeysNotice(visible: boolean) {
        const elem = document.getElementById('keys-notice');
        if (visible) {
            if (!elem) {
                const table = this.getCurrentPlayerTable();
                if (table) {
                    dojo.place(`
                    <div id="keys-notice">
                        ${_("If you have a keyboard, you can use Arrows to move the shape, Space to turn it, and Enter to validate.")}
                        <div style="text-align: center; margin-top: 10px;"><a id="hide-keys-notice">${_("Got it!")}</a></div>
                    </div>
                    `, `player-table-${table.playerId}`);

                    document.getElementById('hide-keys-notice').addEventListener('click', () => this.userPreferences.set(299, 2));
                }
            }
        } else if (elem) {
            elem.parentElement.removeChild(elem);
        }
    }

    private getOrderedPlayers(gamedatas: LookAtTheStarsGamedatas) {
        const players = Object.values(gamedatas.players).sort((a, b) => a.playerNo - b.playerNo);
        const playerIndex = players.findIndex(player => Number(player.id) === Number(this.player_id));
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
        const jumpControls = document.getElementById('jump-controls');
        jumpControls.classList.toggle('folded');
        localStorage.setItem(LOCAL_STORAGE_JUMP_KEY, jumpControls.classList.contains('folded').toString());
    }
    
    private jumpToPlayer(playerId: number): void {
        const elementId = playerId === 0 ? `cards` : `player-table-${playerId}`;
        document.getElementById(elementId).scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
    
    private setPoints(playerId: number, points: number) {
        this.scoreCtrl[playerId]?.toValue(points);
        this.getPlayerTable(playerId).setFinalScore(points);
    }

    private addHelp() {
        dojo.place(`
            <button id="lookatthestars-help-button">?</button>
        `, 'left-side');
        document.getElementById('lookatthestars-help-button').addEventListener('click', () => this.showHelp());
    }

    private getStar2Help(types: number[]) {
        return types.map(type => `
        <div class="help-section">
            <div class="help-star2" data-index="${type}"></div>
            <div>${this.tableCenter.getStar2Tooltip(type)}</div>
        </div>
        `).join('');
    }

    public getSheetTooltipInfos(sheetType: number): { title: string, description: string } {
        let title = ``;
        let description = ``;
        switch (sheetType + 1) {
            case 1:
                title = _(`SOUTHERN AFRICA`);
                description = _(` ✦ For the Tswana and Sotho, <strong>Dithutlwa</strong> (the giraffes) are represented by the stars of the Southern Cross.  ✦ For the San, Aldebaran and Betelgeuse are known as the <strong>male and female hartebeest</strong>.`);
                break;
            case 2:
                title = _(`CHINA`);
                description = _(` ✦ <strong>Tshang-Lung</strong>, the blue dragon, is associated with the East and spring. Its appearance in the sky marked the beginning of the spring rains. ✦ <strong>Tchou-Niao</strong>, the red bird, associated with the South and summer, is represented as a hybrid of birds, a quail, or a phoenix.`);
                break;
            case 3:
                title = _(`ANCIENT EGYPT`);
                description = _(` ✦ The constellations of the <strong>Ibis</strong> and the <strong>Scarab</strong> would correspond to Cancer and Sagittarius. ✦ The scarab is the symbol of the god Khepri who was believed to roll the disk of the sun across the sky. ✦ The sacred ibis is associated with Thoth, god of wisdom and writing.`);
                break;
            case 4:
                title = _(`ANCIENT GREECE`);
                description = _(` ✦ The elongated shape of the <strong>Hydra female</strong> constellation represents the giant snake that Hercules faced during one of his twelve labors. ✦ The <strong>Lyre</strong> allowed Orpheus to charm the creatures of the Underworld.`);
                break;
            case 5:
                title = _(`INDIA`);
                description = _(` ✦ <strong>Kalaparusha (or Prajapati)</strong> was transformed into a deer for being cruel to his daughter. The Belt of Orion represents the arrow that pierced him. ✦ The couple <strong>Soma and Vishnu</strong>, with the lyre and the club of knowledge, are associated with the duos sun/moon and day/night.`);
                break;
            case 6:
                title = _(`INUIT`);
                description = _(` ✦ In Alaska, the Pleiades represent a red fox. Its Inuit name is <strong>Kaguyagat</strong>. ✦ The Big Dipper is known as <strong>Tukturjuit</strong>, the caribou.`);
                break;
            case 7:
                title = _(`NAVAJO`);
                description = _(` ✦ <strong>Ma’ii Bizò‘</strong>, the Coyote Star, was placed by the god Coyote in the South, its twinkle visible to the Navajo at the winter solstice. ✦ <strong>Náhookòs Bikò‘</strong>, the North Star, symbolizes the central fire of the hogan (Navajo home). It never moves and so brings stability and balance to the other stars.`);
                break;
            case 8:
                title = _(`POLYNESIANS`);
                description = _(` ✦ The demigod Maui is said to have raised the islands of Hawaii by pulling them up from the ocean floor with his magic hook, <strong>Ka Makau Nui o Maui</strong>. ✦ <strong>Nāmāhoe</strong>, the twins, is composed of Nānā Mua, "who looks forward" (Castor), and Nānā Hope, "who looks back" (Pollux).`);
                break;
        }
        return { title, description };
    }

    private getConstellationsHelp(types: number[]) {
        return types.map(type => {
            const infos = this.getSheetTooltipInfos(type);
            return `
            <div class="constellation-section">
                <strong>${infos.title}</strong>
                <span>${infos.description}</span>
            </div>
            `
        }).join('');
    }/*const infos = this.game.getSheetTooltipInfos(Number(player.sheetType));
    html = `<div>
        <strong>${infos.title}</strong><br><br>
        ${infos.description}
    </div>`;*/

    private showHelp() {
        const helpDialog = new ebg.popindialog();
        helpDialog.create('lookatthestarsHelpDialog');
        helpDialog.setTitle(_("Help"));
        
        let html = `
        <div id="help-popin">
            <h1>${_("Bonus cards")}</h1>
            <h2>${_("Recommended for beginners")}</h2>
            ${this.getStar2Help([1, 3, 2, 4, 7])}
            <h2>${_("For experienced players")}</h2>
            ${this.getStar2Help([6, 0, 8, 5])}

            <h1>${_("Constellations")}</h1>
            ${_("Here is a brief overview of the constellations that the illustrations on the game boards are loosely based on.")}
            
            ${this.getConstellationsHelp([3, 2, 1, 0, 7, 6, 5, 4])}
        </div>
        `;
        
        // Show the dialog
        helpDialog.setContent(html);

        helpDialog.show();
    }

    public placeShape() {
        const informations = this.getCurrentPlayerTable().getShapeInformations();
        this.actions.performAction('actPlaceShape', informations);
    }

    public placeShootingStar() {
        const informations = this.getCurrentPlayerTable().getShootingStarInformations();
        this.actions.performAction('actPlaceShootingStar', informations);
    }

    public placeLine() {
        const informations = this.getCurrentPlayerTable().getLineInformations();
        this.actions.performAction('actPlaceLine', informations);
    }

    public placePlanet(x: number, y: number) {
        this.actions.performAction('actPlacePlanet', { x, y });
    }

    public placeStar(x: number, y: number) {
        this.actions.performAction('actPlaceStar', { x, y });
    }

    public placeBlackHole(x: number, y: number) {
        this.actions.performAction('actPlaceBlackHole', { x, y });
    }

    public placeCrescentMoon(x: number, y: number) {
        this.actions.performAction('actPlaceCrescentMoon', { x, y });
    }

    public placeGalaxy(x: number, y: number) {
        this.actions.performAction('actPlaceGalaxy', { x, y });
    }

    public placeTwinklingStar(x: number, y: number) {
        this.actions.performAction('actPlaceTwinklingStar', { x, y });
    }

    public placeNova(x: number, y: number) {
        this.actions.performAction('actPlaceNova', { x, y });
    }

    public placeLuminousAura(x: number, y: number) {
        this.actions.performAction('actPlaceLuminousAura', { x, y });
    }

    public cancelPlaceShape() {
        this.actions.performAction('actCancelPlaceShape', null, { checkAction: false });
    }

    public cancelBonus() {
        this.actions.performAction('actCancelBonus');
    }

    public skipCard() {
        this.actions.performAction('actSkipCard');
    }

    public skipBonus() {
        this.actions.performAction('actSkipBonus');
    }

    public confirmTurn() {
        this.actions.performAction('actConfirmTurn');
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

        const liveScoring = this.gamedatas.liveScoring;

        const notifs = [
            ['discardShape', ANIMATION_MS],
            ['newShape', ANIMATION_MS],
            ['placedLines', 1],
            ['placedShootingStar', 1],
            ['placedPlanet', 1],
            ['placedStar', 1],
            ['placedBlackHole', 1],
            ['placedCrescentMoon', 1],
            ['placedGalaxy', 1],
            ['placedTwinklingStar', 1],
            ['placedNova', 1],
            ['placedLuminousAura', 1],
            ['cancelPlacedLines', 1],
            ['cancelBonus', 1],
            ['day', 1],
            ['liveScore', 1],
            ['score', 1],
            ['scoreConstellations', liveScoring ? 1 : SCORE_MS],
            ['scorePlanets', liveScoring ? 1 : SCORE_MS],
            ['scoreShootingStars', liveScoring ? 1 : SCORE_MS],
            ['scoreStar1', liveScoring ? 1 : SCORE_MS],
            ['scoreStar2', liveScoring ? 1 : SCORE_MS],
        ];
    
        notifs.forEach((notif) => {
            dojo.subscribe(notif[0], this, `notif_${notif[0]}`);
            (this as any).notifqueue.setSynchronous(notif[0], notif[1]);
        });
    }

    notif_discardShape(notif: Notif<NotifCardArgs>) {
        this.slideToObjectAndDestroy(`card-${notif.args.card.id}`, 'topbar');
        setTimeout(() => this.tableCenter.updateCounters(), 600);
    }

    notif_newShape(notif: Notif<NotifCardArgs>) {
        this.cards.createMoveOrUpdateCard(notif.args.card);
    }

    notif_placedLines(notif: Notif<NotifPlacedLinesArgs>) {
        const playerTable = this.getPlayerTable(notif.args.playerId);
        playerTable.placeLines(notif.args.lines, notif.args.bonus ? ['round', 'round-bonus'] : ['round']);
        playerTable.setConstellationsCounters(notif.args.currentConstellations);
    }
    notif_placedShootingStar(notif: Notif<NotifPlacedShootingStarArgs>) {
        this.getPlayerTable(notif.args.playerId).placeLines(notif.args.lines, ['round']);
        this.getPlayerTable(notif.args.playerId).placeShootingStarHeadStr(notif.args.head, ['round']);
    }
    notif_placedPlanet(notif: Notif<NotifPlacedCoordinatesArgs>) {
        this.getPlayerTable(notif.args.playerId).placeObject(notif.args.coordinates, 'planet', ['round', 'round-bonus']);
    }
    notif_placedStar(notif: Notif<NotifPlacedCoordinatesArgs>) {
        this.getPlayerTable(notif.args.playerId).placeObject(notif.args.coordinates, 'star', ['round', 'round-bonus']);
    }
    notif_placedBlackHole(notif: Notif<NotifPlacedCoordinatesArgs>) {
        this.getPlayerTable(notif.args.playerId).placeObject(notif.args.coordinates, 'black-hole', ['round', 'round-bonus']);
    }
    notif_placedCrescentMoon(notif: Notif<NotifPlacedCoordinatesArgs>) {
        this.getPlayerTable(notif.args.playerId).placeObject(notif.args.coordinates, 'crescent-moon', ['round', 'round-bonus']);
    }
    notif_placedGalaxy(notif: Notif<NotifPlacedCoordinatesArgs>) {
        this.getPlayerTable(notif.args.playerId).placeObject(notif.args.coordinates, 'galaxy', ['round', 'round-bonus']);
    }
    notif_placedTwinklingStar(notif: Notif<NotifPlacedCoordinatesArgs>) {
        this.getPlayerTable(notif.args.playerId).placeObject(notif.args.coordinates, 'twinkling-star', ['round', 'round-bonus']);
    }
    notif_placedNova(notif: Notif<NotifPlacedCoordinatesArgs>) {
        this.getPlayerTable(notif.args.playerId).placeObject(notif.args.coordinates, 'nova', ['round', 'round-bonus']);
    }
    notif_placedLuminousAura(notif: Notif<NotifPlacedCoordinatesArgs>) {
        this.getPlayerTable(notif.args.playerId).placeObject(notif.args.coordinates, 'luminous-aura', ['round', 'round-bonus']);
    }

    notif_cancelPlacedLines(notif: Notif<NotifPlacedLinesArgs>) {
        const playerTable = this.getPlayerTable(notif.args.playerId);
        playerTable.cancelPlacedLines();
        playerTable.setConstellationsCounters(notif.args.currentConstellations);
    }

    notif_cancelBonus(notif: Notif<NotifPlacedLinesArgs>) {
        const playerTable = this.getPlayerTable(notif.args.playerId);
        playerTable.cancelBonus();
        playerTable.setConstellationsCounters(notif.args.currentConstellations);
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
    
    notif_liveScore(notif: Notif<NotifLiveScoreArgs>) {
        const playerTable = this.getPlayerTable(notif.args.playerId);
        const playerScore = notif.args.playerScore;
        playerTable.setConstellationsScore(playerScore.checkedConstellations, playerScore.constellations);
        playerTable.setPlanetScore(playerScore.planets);
        playerTable.setShootingStarsScore(playerScore.shootingStars);
        playerTable.setStar1Score(playerScore.star1);
        playerTable.setStar2Score(playerScore.star2);
        playerTable.setFinalScore(playerScore.total);
    }

    /* This enable to inject translatable styled things to logs or action bar */
    /* @Override */
    public bgaFormatText(log: string, args: any) {
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
        return { log, args };
    }
}