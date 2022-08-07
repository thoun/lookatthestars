function slideToObjectAndAttach(game, object, destinationId, changeSide) {
    if (changeSide === void 0) { changeSide = false; }
    var destination = document.getElementById(destinationId);
    if (destination.contains(object)) {
        return;
    }
    var originBR = object.getBoundingClientRect();
    destination.appendChild(object);
    if (document.visibilityState !== 'hidden' && !game.instantaneousMode) {
        var destinationBR = object.getBoundingClientRect();
        var deltaX = destinationBR.left - originBR.left;
        var deltaY = destinationBR.top - originBR.top;
        object.style.zIndex = '10';
        object.style.transform = "translate(".concat(-deltaX, "px, ").concat(-deltaY, "px)");
        setTimeout(function () {
            object.style.transition = "transform 0.5s linear";
            object.style.transform = null;
        });
        setTimeout(function () {
            object.style.zIndex = null;
            object.style.transition = null;
        }, 600);
    }
}
function slideFromObject(game, object, fromId) {
    var from = document.getElementById(fromId);
    var originBR = from.getBoundingClientRect();
    if (document.visibilityState !== 'hidden' && !game.instantaneousMode) {
        var destinationBR = object.getBoundingClientRect();
        var deltaX = destinationBR.left - originBR.left;
        var deltaY = destinationBR.top - originBR.top;
        object.style.zIndex = '10';
        object.style.transform = "translate(".concat(-deltaX, "px, ").concat(-deltaY, "px)");
        setTimeout(function () {
            object.style.transition = "transform 0.5s linear";
            object.style.transform = null;
        });
        setTimeout(function () {
            object.style.zIndex = null;
            object.style.transition = null;
        }, 600);
    }
}
var Cards = /** @class */ (function () {
    function Cards(game) {
        this.game = game;
    }
    // gameui.cards.debugSeeAllCards()
    Cards.prototype.debugSeeAllCards = function () {
        var _this = this;
        document.querySelectorAll('.card').forEach(function (card) { return card.remove(); });
        var html = "<div id=\"all-cards\">";
        html += "</div>";
        dojo.place(html, 'full-table', 'before');
        [1, 2, 3, 4, 5, 6].forEach(function (subType) {
            var card = {
                id: 10 + subType,
                type: 1,
                subType: subType,
            };
            _this.createMoveOrUpdateCard(card, "all-cards");
        });
        [2, 3, 4, 5, 6].forEach(function (type) {
            return [1, 2, 3].forEach(function (subType) {
                var card = {
                    id: 10 * type + subType,
                    type: type,
                    subType: subType,
                };
                _this.createMoveOrUpdateCard(card, "all-cards");
            });
        });
    };
    Cards.prototype.createMoveOrUpdateCard = function (card, destinationId, init, from) {
        var _this = this;
        if (init === void 0) { init = false; }
        if (from === void 0) { from = null; }
        var existingDiv = document.getElementById("card-".concat(card.id));
        var side = card.type ? 'front' : 'back';
        if (existingDiv) {
            if (existingDiv.parentElement.id == destinationId) {
                return;
            }
            this.game.removeTooltip("card-".concat(card.id));
            var oldType = Number(existingDiv.dataset.category);
            existingDiv.classList.remove('selectable', 'selected', 'disabled');
            if (init) {
                document.getElementById(destinationId).appendChild(existingDiv);
            }
            else {
                slideToObjectAndAttach(this.game, existingDiv, destinationId);
            }
            existingDiv.dataset.side = '' + side;
            if (!oldType && card.type) {
                this.setVisibleInformations(existingDiv, card);
            }
            else if (oldType && !card.type) {
                setTimeout(function () { return _this.removeVisibleInformations(existingDiv); }, 500); // so we don't change face while it is still visible
            }
            this.game.setTooltip(existingDiv.id, this.getTooltip(card.type, card.family));
        }
        else {
            var div = document.createElement('div');
            div.id = "card-".concat(card.id);
            div.classList.add('card');
            div.dataset.id = '' + card.id;
            div.dataset.side = '' + side;
            div.innerHTML = "\n                <div class=\"card-sides\">\n                    <div class=\"card-side front\">\n                    </div>\n                    <div class=\"card-side back\">\n                    </div>\n                </div>\n            ";
            document.getElementById(destinationId).appendChild(div);
            if (from) {
                var fromCardId = document.getElementById(from).id;
                slideFromObject(this.game, div, fromCardId);
            }
            if (card.type) {
                this.setVisibleInformations(div, card);
                if (!destinationId.startsWith('help-')) {
                    this.game.setTooltip(div.id, this.getTooltip(card.type, card.family));
                }
            }
        }
    };
    Cards.prototype.setVisibleInformations = function (div, card) {
        div.dataset.type = '' + card.type;
        // TODO
    };
    Cards.prototype.removeVisibleInformations = function (div) {
        div.removeAttribute('data-type');
        // TODO
    };
    Cards.prototype.getTooltip = function (category, family) {
        return 'TODO';
        switch (category) {
            case 1:
                return "\n                <div><strong>".concat(_("Mermaid"), "</strong></div>\n                ").concat(_("1 point for each card of the color the player has the most of. If they have more mermaid cards, they must look at which of the other colors they have more of. The same color cannot be counted for more than one mermaid card."), "\n                <br><br>\n                <strong>").concat(_("Effect: If they place 4 mermaid cards, the player immediately wins the game."), "</strong>");
            case 2:
                if (family >= 4) {
                    return "<div><strong>".concat(_("Swimmer"), "/").concat(_("Shark"), "</strong></div>\n                    <div>").concat(_("1 point for each combination of swimmer and shark cards."), "</div><br>\n                    <div>").concat(_("Effect:"), " ").concat(_("The player steals a random card from another player and adds it to their hand."), "</div>");
                }
                var duoCards = [
                    [_('Crab'), _("The player chooses a discard pile, consults it without shuffling it, and chooses a card from it to add to their hand. They do not have to show it to the other players.")],
                    [_('Boat'), _("The player immediately takes another turn.")],
                    [_('Fish'), _("The player adds the top card from the deck to their hand.")]
                ];
                var duo = duoCards[family - 1];
                return "<div><strong>".concat(duo[0], "</strong></div>\n                <div>").concat(_("1 point for each pair of ${card} cards.").replace('${card}', duo[0]), "</div><br>\n                <div>").concat(_("Effect:"), " ").concat(_(duo[1]), "</div>");
            case 3:
                var collectorCards = [
                    ['0, 2, 4, 6, 8, 10', '1, 2, 3, 4, 5, 6', _('Shell')],
                    ['0, 3, 6, 9, 12', '1, 2, 3, 4, 5', _('Octopus')],
                    ['1, 3, 5', '1, 2, 3', _('Penguin')],
                    ['0, 5', '1,  2', _('Sailor')],
                ];
                var collector = collectorCards[family - 1];
                return "<div><strong>".concat(collector[2], "</strong></div>\n                <div>").concat(_("${points} points depending on whether the player has ${numbers} ${card} cards.").replace('${points}', collector[0]).replace('${numbers}', collector[1]).replace('${card}', collector[2]), "</div>");
            case 4:
                var multiplierCards = [
                    [_('The lighthouse'), _('Boat')],
                    [_('The shoal of fish'), _('Fish')],
                    [_('The penguin colony'), _('Penguin')],
                    [_('The captain'), _('Sailor')],
                ];
                var multiplier = multiplierCards[family - 1];
                return "<div><strong>".concat(multiplier[0], "</strong></div>\n                <div>").concat(_("1 point per ${card} card.").replace('${card}', multiplier[1]), "</div>\n                <div>").concat(_("This card does not count as a ${card} card.").replace('${card}', multiplier[1]), "</div>");
        }
    };
    return Cards;
}());
var TableCenter = /** @class */ (function () {
    function TableCenter(game, gamedatas) {
        this.game = game;
        this.gamedatas = gamedatas;
        [1, 2].forEach(function (number) { return document.getElementById("star".concat(number)).dataset.index = '' + gamedatas["star".concat(number)]; });
        var currentPile = 3;
        var currentPileDiv = document.getElementById("pile".concat(currentPile));
        for (var i = 0; i < gamedatas.cards.length; i++) {
            if (currentPile == 3 && i >= 6) {
                currentPile = 2;
                currentPileDiv = document.getElementById("pile".concat(currentPile));
            }
            else if (currentPile == 2 && i >= 12) {
                currentPile = 1;
                currentPileDiv = document.getElementById("pile".concat(currentPile));
            }
            game.cards.createMoveOrUpdateCard(gamedatas.cards[i], currentPileDiv.id, true);
        }
        /*const map = document.getElementById('map');
        map.dataset.size = gamedatas.map;
        const mapElements = document.getElementById('map-elements');

        // intersections
        Object.keys(gamedatas.MAP_POSITIONS).forEach(key => {
            const position = Number(key);
            const elements = gamedatas.MAP_POSITIONS[position];
            const tooltipsIds = [];
            if (elements.includes(0)) { tooltipsIds.push(0); }
            if (elements.some(element => element >= 1 && element <= 12)) { tooltipsIds.push(1); }
            if (elements.includes(20)) { tooltipsIds.push(20); }
            if (elements.includes(30)) { tooltipsIds.push(30); }
            if (elements.includes(32)) { tooltipsIds.push(32); }
            if (elements.includes(40)) { tooltipsIds.push(40); }
            if (elements.includes(41) || elements.includes(42)) { tooltipsIds.push(41); }
            if (elements.includes(50)) { tooltipsIds.push(50); }
            if (elements.includes(51)) { tooltipsIds.push(51); }
            if (elements.some(element => element >= 97 && element <= 122)) { tooltipsIds.push(97); }

            const departure = elements.find(element => element >= 1 && element <= 12);
            const coordinates = this.getCoordinatesFromPosition(position);

            let html = `<div id="intersection${position}" class="intersection ${elements.some(element => element == 0) ? 'green-light' : ''}`;
            if (departure > 0) {
                html += ` departure" data-departure=${departure}`;
            }
            html += `" data-tooltip="${JSON.stringify(tooltipsIds)}" style="left: ${coordinates[0]}px; top: ${coordinates[1]}px;"></div>`;
            dojo.place(html, mapElements);
            
            if (departure > 0) {
                document.getElementById(`intersection${position}`).addEventListener('click', () => this.game.placeDeparturePawn(position));
            }
        });

        // routes
        Object.keys(gamedatas.MAP_ROUTES).forEach(key => {
            const position = Number(key);
            const destinations = gamedatas.MAP_ROUTES[position];

            destinations.forEach(destination => {
                const coordinates = this.getCoordinatesFromPositions(position, destination);

                let html = `<div id="route${position}-${destination}" class="route" style="left: ${coordinates[0]}px; top: ${coordinates[1]}px;" data-direction="${Math.abs(position-destination) <= 1 ? 0 : 1}"></div>`;
                dojo.place(html, mapElements);
                document.getElementById(`route${position}-${destination}`).addEventListener('click', () => this.game.placeRoute(position, destination));
            });
        });

        // departure pawns
        Object.values(gamedatas.players).filter(player => player.departurePosition).forEach(player => this.addDeparturePawn(Number(player.id), player.departurePosition));

        // markers
        Object.values(gamedatas.players).forEach(player => player.markers.forEach(marker => this.addMarker(Number(player.id), marker)));

        const currentPlayer = gamedatas.players[this.game.getPlayerId()];

        // common objectives
        gamedatas.commonObjectives.forEach(commonObjective => this.placeCommonObjective(commonObjective, !!currentPlayer));

        // personal objective
        Object.keys(gamedatas.MAP_POSITIONS).filter(key => gamedatas.MAP_POSITIONS[key].some(element => element >= 97 && element <= 122)).forEach(position =>
        //currentPlayer?.personalObjectivePositions.forEach(position =>
            dojo.place(`<div class="objective-letter" data-position="${position}"></div>`, `intersection${position}`)
        );

        // tickets
        this.setRound(gamedatas.validatedTickets, gamedatas.currentTicket, true);*/
    }
    return TableCenter;
}());
var isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
;
var log = isDebug ? console.log.bind(window.console) : function () { };
var PlayerTable = /** @class */ (function () {
    function PlayerTable(game, player, day) {
        this.playerId = Number(player.id);
        var html = "\n        <div id=\"player-table-".concat(this.playerId, "\" class=\"player-table \" style=\"box-shadow: 0 0 3px 3px #").concat(player.color, ";\" data-type=\"").concat(player.sheetType, "\">\n            <div id=\"player-table-").concat(this.playerId, "-main\" class=\"main\">\n                <div id=\"player-table-").concat(this.playerId, "-day\" class=\"day\" data-level=\"").concat(day, "\">\n                </div>\n            </div>\n            <div class=\"name\" style=\"color: #").concat(player.color, ";\">\n                <span>").concat(player.name, "</span>\n            </div>\n        </div>\n        ");
        dojo.place(html, document.getElementById('tables'));
        /*this.oldLadies = new PlayerTableOldLadiesBlock(this.playerId, player.scoreSheets, game.isVisibleScoring());
        this.students = new PlayerTableStudentsBlock(this.playerId, player.scoreSheets, game.isVisibleScoring());
        this.tourists = new PlayerTableTouristsBlock(this.playerId, player.scoreSheets, game.isVisibleScoring());
        this.businessmen = new PlayerTableBusinessmenBlock(this.playerId, player.scoreSheets, game.isVisibleScoring());
        this.commonObjectives = new PlayerTableCommonObjectivesBlock(this.playerId, player.scoreSheets, game.isVisibleScoring());
        this.personalObjective = new PlayerTablePersonalObjectiveBlock(this.playerId, player.scoreSheets, game.isVisibleScoring());
        this.turnZones = new PlayerTableTurnZonesBlock(this.playerId, player.scoreSheets, game.isVisibleScoring());
        this.trafficJam = new PlayerTableTrafficJamBlock(this.playerId, player.scoreSheets, game.isVisibleScoring());

        this.updateScoreSheet(player.scoreSheets, game.isVisibleScoring());*/
    }
    PlayerTable.prototype.setDay = function (day) {
        document.getElementById("player-table-".concat(this.playerId, "-day")).dataset.level = '' + day;
    };
    PlayerTable.prototype.updateScoreSheet = function (scoreSheets, visibleScoring) {
        this.oldLadies.updateScoreSheet(scoreSheets, visibleScoring);
        this.students.updateScoreSheet(scoreSheets, visibleScoring);
        this.tourists.updateScoreSheet(scoreSheets, visibleScoring);
        this.businessmen.updateScoreSheet(scoreSheets, visibleScoring);
        this.commonObjectives.updateScoreSheet(scoreSheets, visibleScoring);
        this.personalObjective.updateScoreSheet(scoreSheets, visibleScoring);
        this.turnZones.updateScoreSheet(scoreSheets, visibleScoring);
        this.trafficJam.updateScoreSheet(scoreSheets, visibleScoring);
        if (visibleScoring) {
            this.setContentAndValidation("total-score", scoreSheets.current.total, scoreSheets.current.total != scoreSheets.validated.total);
        }
    };
    PlayerTable.prototype.setContentAndValidation = function (id, content, unvalidated) {
        var div = document.getElementById("player-table-".concat(this.playerId, "-").concat(id));
        var contentStr = '';
        if (typeof content === 'string') {
            contentStr = content;
        }
        else if (typeof content === 'number') {
            contentStr = '' + content;
        }
        div.innerHTML = contentStr;
        div.dataset.unvalidated = unvalidated.toString();
    };
    return PlayerTable;
}());
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var ANIMATION_MS = 500;
var ZOOM_LEVELS = [0.5, 0.625, 0.75, 0.875, 1 /*, 1.25, 1.5*/];
var ZOOM_LEVELS_MARGIN = [-100, -60, -33, -14, 0 /*, 20, 33.34*/];
var LOCAL_STORAGE_ZOOM_KEY = 'LookAtTheStars-zoom';
var COMMON_OBJECTIVES = [
    null,
    [20, 5],
    [30, 5],
    [40, 5],
    [50, 5],
    [41, 3],
    [42, 3],
];
function formatTextIcons(rawText) {
    if (!rawText) {
        return '';
    }
    return rawText
        .replace(/\[GreenLight\]/ig, '<div class="map-icon" data-element="0"></div>')
        .replace(/\[OldLady\]/ig, '<div class="map-icon" data-element="20"></div>')
        .replace(/\[Student\]/ig, '<div class="map-icon" data-element="30"></div>')
        .replace(/\[School\]/ig, '<div class="map-icon" data-element="32"></div>')
        .replace(/\[Tourist\]/ig, '<div class="map-icon" data-element="40"></div>')
        .replace(/\[MonumentLight\]/ig, '<div class="map-icon" data-element="41"></div>')
        .replace(/\[MonumentDark\]/ig, '<div class="map-icon" data-element="42"></div>')
        .replace(/\[Businessman\]/ig, '<div class="map-icon" data-element="50"></div>')
        .replace(/\[Office\]/ig, '<div class="map-icon" data-element="51"></div>');
}
var LookAtTheStars = /** @class */ (function () {
    function LookAtTheStars() {
        this.zoom = 0.75;
        this.playersTables = [];
        this.registeredTablesByPlayerId = [];
        this.TOOLTIP_DELAY = document.body.classList.contains('touch-device') ? 1500 : undefined;
        var zoomStr = localStorage.getItem(LOCAL_STORAGE_ZOOM_KEY);
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
    LookAtTheStars.prototype.setup = function (gamedatas) {
        var _this = this;
        var players = Object.values(gamedatas.players);
        // ignore loading of some pictures
        [1, 2, 3, 4, 5, 6, 7, 8].filter(function (i) { return !players.some(function (player) { return Number(player.sheetType) === i; }); }).forEach(function (i) {
            _this.dontPreloadImage("sheet-".concat(i, ".png"));
        });
        log("Starting game setup");
        this.gamedatas = gamedatas;
        log('gamedatas', gamedatas);
        var day = 0;
        if (gamedatas.cards.length <= 6) {
            day = 2;
        }
        else if (gamedatas.cards.length <= 12) {
            day = 1;
        }
        this.cards = new Cards(this);
        this.tableCenter = new TableCenter(this, gamedatas);
        this.createPlayerTables(gamedatas, day);
        this.createPlayerJumps(gamedatas);
        Object.values(gamedatas.players).forEach(function (player) {
            //this.highlightObjectiveLetters(player);
            //this.setObjectivesCounters(Number(player.id), player.scoreSheets.current);
        });
        /*document.getElementById('round-panel').innerHTML = `${_('Round')}&nbsp;<span id="round-number-counter"></span>&nbsp;/&nbsp;12`;
        this.roundNumberCounter = new ebg.counter();
        this.roundNumberCounter.create(`round-number-counter`);
        this.roundNumberCounter.setValue(gamedatas.roundNumber);*/
        this.setupNotifications();
        this.setupPreferences();
        document.getElementById('zoom-out').addEventListener('click', function () { return _this.zoomOut(); });
        document.getElementById('zoom-in').addEventListener('click', function () { return _this.zoomIn(); });
        if (this.zoom !== 1) {
            this.setZoom(this.zoom);
        }
        if (Number(gamedatas.gamestate.id) >= 90) { // score or end
            this.onEnteringShowScore();
        }
        this.addTooltips();
        log("Ending game setup");
    };
    ///////////////////////////////////////////////////
    //// Game & client states
    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    LookAtTheStars.prototype.onEnteringState = function (stateName, args) {
        log('Entering state: ' + stateName, args.args);
        switch (stateName) {
            case 'placeRoute':
                this.onEnteringPlaceRoute(args.args);
                break;
            case 'endScore':
                this.onEnteringShowScore();
                break;
        }
    };
    LookAtTheStars.prototype.setGamestateDescription = function (property) {
        if (property === void 0) { property = ''; }
        var originalState = this.gamedatas.gamestates[this.gamedatas.gamestate.id];
        this.gamedatas.gamestate.description = "".concat(originalState['description' + property]);
        this.gamedatas.gamestate.descriptionmyturn = "".concat(originalState['descriptionmyturn' + property]);
        this.updatePageTitle();
    };
    LookAtTheStars.prototype.onEnteringPlaceRoute = function (args) {
        if (args.canConfirm) {
            this.setGamestateDescription('Confirm');
        }
        var currentPositionIntersection = document.getElementById("intersection".concat(args.currentPosition));
        currentPositionIntersection.classList.add('glow');
        currentPositionIntersection.style.setProperty('--background-lighter', "#".concat(this.getPlayerColor(this.getActivePlayerId()), "66"));
        currentPositionIntersection.style.setProperty('--background-darker', "#".concat(this.getPlayerColor(this.getActivePlayerId()), "CC"));
    };
    LookAtTheStars.prototype.onEnteringShowScore = function () {
        var _this = this;
        Object.keys(this.gamedatas.players).forEach(function (playerId) { var _a; return (_a = _this.scoreCtrl[playerId]) === null || _a === void 0 ? void 0 : _a.setValue(0); });
        this.gamedatas.hiddenScore = false;
    };
    LookAtTheStars.prototype.onLeavingState = function (stateName) {
        log('Leaving state: ' + stateName);
        switch (stateName) {
            case 'placeDeparturePawn':
                this.onLeavingPlaceDeparturePawn();
                break;
            case 'placeRoute':
                this.onLeavingPlaceRoute();
                break;
        }
    };
    LookAtTheStars.prototype.onLeavingPlaceDeparturePawn = function () {
        Array.from(document.getElementsByClassName('intersection')).forEach(function (element) { return element.classList.remove('selectable'); });
    };
    LookAtTheStars.prototype.onLeavingPlaceRoute = function () {
        document.querySelectorAll('.intersection.glow').forEach(function (element) { return element.classList.remove('glow'); });
    };
    /*private onLeavingStepEvolution() {
            const playerId = this.getPlayerId();
            this.getPlayerTable(playerId)?.unhighlightHiddenEvolutions();
    }*/
    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    LookAtTheStars.prototype.onUpdateActionButtons = function (stateName, args) {
        var _this = this;
        if (this.isCurrentPlayerActive()) {
            switch (stateName) {
                case 'placeDeparturePawn':
                    var placeDeparturePawnArgs_1 = args;
                    placeDeparturePawnArgs_1._private.positions.forEach(function (position, index) {
                        document.getElementById("intersection".concat(position)).classList.add('selectable');
                        var ticketDiv = "<div class=\"ticket\" data-ticket=\"".concat(placeDeparturePawnArgs_1._private.tickets[index], "\"></div>");
                        _this.addActionButton("placeDeparturePawn".concat(position, "_button"), dojo.string.substitute(_("Start at ${ticket}"), { ticket: ticketDiv }), function () { return _this.placeDeparturePawn(position); });
                    });
                    break;
                case 'placeRoute':
                    this.addActionButton("confirmTurn_button", _("Confirm turn"), function () { return _this.confirmTurn(); });
                    var placeRouteArgs = args;
                    if (placeRouteArgs.canConfirm) {
                        this.startActionTimer("confirmTurn_button", 8);
                    }
                    else {
                        dojo.addClass("confirmTurn_button", "disabled");
                    }
                    this.addActionButton("cancelLast_button", _("Cancel last marker"), function () { return _this.cancelLast(); }, null, null, 'gray');
                    this.addActionButton("resetTurn_button", _("Reset the whole turn"), function () { return _this.resetTurn(); }, null, null, 'gray');
                    if (!placeRouteArgs.canCancel) {
                        dojo.addClass("cancelLast_button", "disabled");
                        dojo.addClass("resetTurn_button", "disabled");
                    }
                    break;
            }
        }
        else {
            this.onLeavingPlaceDeparturePawn();
        }
    };
    ///////////////////////////////////////////////////
    //// Utility methods
    ///////////////////////////////////////////////////
    LookAtTheStars.prototype.isVisibleScoring = function () {
        return !this.gamedatas.hiddenScore;
    };
    LookAtTheStars.prototype.getPlayerId = function () {
        return Number(this.player_id);
    };
    LookAtTheStars.prototype.getPlayerColor = function (playerId) {
        return this.gamedatas.players[playerId].color;
    };
    LookAtTheStars.prototype.setTooltip = function (id, html) {
        this.addTooltipHtml(id, html, this.TOOLTIP_DELAY);
    };
    LookAtTheStars.prototype.setZoom = function (zoom) {
        if (zoom === void 0) { zoom = 1; }
        this.zoom = zoom;
        localStorage.setItem(LOCAL_STORAGE_ZOOM_KEY, '' + this.zoom);
        var newIndex = ZOOM_LEVELS.indexOf(this.zoom);
        dojo.toggleClass('zoom-in', 'disabled', newIndex === ZOOM_LEVELS.length - 1);
        dojo.toggleClass('zoom-out', 'disabled', newIndex === 0);
        var div = document.getElementById('full-table');
        if (zoom === 1) {
            div.style.transform = '';
            div.style.margin = '';
        }
        else {
            div.style.transform = "scale(".concat(zoom, ")");
            div.style.margin = "0 ".concat(ZOOM_LEVELS_MARGIN[newIndex], "% ").concat((1 - zoom) * -100, "% 0");
        }
        document.getElementById('zoom-wrapper').style.height = "".concat(div.getBoundingClientRect().height, "px");
    };
    LookAtTheStars.prototype.zoomIn = function () {
        if (this.zoom === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]) {
            return;
        }
        var newIndex = ZOOM_LEVELS.indexOf(this.zoom) + 1;
        this.setZoom(ZOOM_LEVELS[newIndex]);
    };
    LookAtTheStars.prototype.zoomOut = function () {
        if (this.zoom === ZOOM_LEVELS[0]) {
            return;
        }
        var newIndex = ZOOM_LEVELS.indexOf(this.zoom) - 1;
        this.setZoom(ZOOM_LEVELS[newIndex]);
    };
    LookAtTheStars.prototype.setupPreferences = function () {
        var _this = this;
        // Extract the ID and value from the UI control
        var onchange = function (e) {
            var match = e.target.id.match(/^preference_control_(\d+)$/);
            if (!match) {
                return;
            }
            var prefId = +match[1];
            var prefValue = +e.target.value;
            _this.prefs[prefId].value = prefValue;
            _this.onPreferenceChange(prefId, prefValue);
        };
        // Call onPreferenceChange() when any value changes
        dojo.query(".preference_control").connect("onchange", onchange);
        // Call onPreferenceChange() now
        dojo.forEach(dojo.query("#ingame_menu_content .preference_control"), function (el) { return onchange({ target: el }); });
        try {
            document.getElementById('preference_control_203').closest(".preference_choice").style.display = 'none';
        }
        catch (e) { }
    };
    LookAtTheStars.prototype.onPreferenceChange = function (prefId, prefValue) {
        switch (prefId) {
            case 204:
                document.getElementsByTagName('html')[0].dataset.noBuilding = (prefValue == 2).toString();
                break;
            case 205:
                document.getElementsByTagName('html')[0].dataset.noGrid = (prefValue == 2).toString();
                break;
        }
    };
    LookAtTheStars.prototype.expandObjectiveClick = function () {
        var wrappers = document.querySelectorAll(".personal-objective-wrapper");
        var expanded = this.prefs[203].value == '1';
        wrappers.forEach(function (wrapper) { return wrapper.dataset.expanded = (!expanded).toString(); });
        var select = document.getElementById('preference_control_203');
        select.value = expanded ? '2' : '1';
        var event = new Event('change');
        select.dispatchEvent(event);
    };
    LookAtTheStars.prototype.showPersonalObjective = function (playerId) {
        var _this = this;
        if (document.getElementById("personal-objective-wrapper-".concat(playerId)).childElementCount > 0) {
            return;
        }
        var player = this.gamedatas.players[playerId];
        var html = "\n            <div class=\"personal-objective collapsed\">\n                ".concat(player.personalObjectiveLetters.map(function (letter, letterIndex) { return "<div class=\"letter\" data-player-id=\"".concat(playerId, "\" data-position=\"").concat(player.personalObjectivePositions[letterIndex], "\">").concat(letter, "</div>"); }).join(''), "\n            </div>\n            <div class=\"personal-objective expanded\" data-type=\"").concat(player.personalObjective, "\"></div>\n            <div id=\"toggle-objective-expand-").concat(playerId, "\" class=\"arrow\"></div>\n        ");
        dojo.place(html, "personal-objective-wrapper-".concat(playerId));
        document.getElementById("toggle-objective-expand-".concat(playerId)).addEventListener('click', function () { return _this.expandObjectiveClick(); });
    };
    LookAtTheStars.prototype.getOrderedPlayers = function (gamedatas) {
        var _this = this;
        var players = Object.values(gamedatas.players).sort(function (a, b) { return a.playerNo - b.playerNo; });
        var playerIndex = players.findIndex(function (player) { return Number(player.id) === Number(_this.player_id); });
        var orderedPlayers = playerIndex > 0 ? __spreadArray(__spreadArray([], players.slice(playerIndex), true), players.slice(0, playerIndex), true) : players;
        return orderedPlayers;
    };
    LookAtTheStars.prototype.createPlayerTables = function (gamedatas, day) {
        var _this = this;
        var orderedPlayers = this.getOrderedPlayers(gamedatas);
        orderedPlayers.forEach(function (player) {
            return _this.createPlayerTable(gamedatas, Number(player.id), day);
        });
    };
    LookAtTheStars.prototype.createPlayerTable = function (gamedatas, playerId, day) {
        var table = new PlayerTable(this, gamedatas.players[playerId], day);
        this.playersTables.push(table);
        this.registeredTablesByPlayerId[playerId] = [table];
    };
    LookAtTheStars.prototype.createPlayerJumps = function (gamedatas) {
        var _this = this;
        dojo.place("\n        <div id=\"jump-toggle\" class=\"jump-link toggle\">\n            \u21D4\n        </div>", "jump-controls");
        document.getElementById("jump-toggle").addEventListener('click', function () { return _this.jumpToggle(); });
        var orderedPlayers = this.getOrderedPlayers(gamedatas);
        orderedPlayers.forEach(function (player) {
            dojo.place("<div id=\"jump-".concat(player.id, "\" class=\"jump-link\" style=\"color: #").concat(player.color, "; border-color: #").concat(player.color, ";\"><div class=\"eye\" style=\"background: #").concat(player.color, ";\"></div> ").concat(player.name, "</div>"), "jump-controls");
            document.getElementById("jump-".concat(player.id)).addEventListener('click', function () { return _this.jumpToPlayer(Number(player.id)); });
        });
        var jumpDiv = document.getElementById("jump-controls");
        jumpDiv.style.marginTop = "-".concat(Math.round(jumpDiv.getBoundingClientRect().height / 2), "px");
    };
    LookAtTheStars.prototype.jumpToggle = function () {
        document.getElementById("jump-controls").classList.toggle('folded');
    };
    LookAtTheStars.prototype.jumpToPlayer = function (playerId) {
        document.getElementById("player-table-".concat(playerId)).scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    };
    LookAtTheStars.prototype.getTooltip = function (element) {
        switch (element) {
            case 0: return '[GreenLight] : ' + _("If your route ends at an intersection with a [GreenLight], you place an additional marker.");
            case 1: return _("<strong>Number:</strong> Possible starting point. You choose between 2 numbers at the beginning of the game to place your Departure Pawn.");
            case 20: return '[OldLady] : ' + _("When a marker reaches [OldLady], check a box on the [OldLady] zone. Add the number next to each checked box at game end.");
            case 30: return '[Student] : ' + _("When a marker reaches [Student], check a box on the [Student] zone. Multiply [Student] with [School] at game end.");
            case 32: return '[School] : ' + _("When a marker reaches [School], check a box on the [School] zone. Multiply [Student] with [School] at game end.") + "<br><i>".concat(_("If the [School] is marked with a Star, write the number of [Student] you have checked when a marker reaches it."), "</i>");
            case 40: return '[Tourist] : ' + _("When a marker reaches [Tourist], check a box on the first available row on the [Tourist] zone. You will score when you drop off the [Tourist] to [MonumentLight]/[MonumentDark]. If the current row is full and you didn't reach [MonumentLight]/[MonumentDark], nothing happens.");
            case 41: return '[MonumentLight][MonumentDark] : ' + _("When a marker reaches [MonumentLight]/[MonumentDark], write the score on the column of the [Tourist] at the end of the current row. If the current row is empty, nothing happens.") + "<br><i>".concat(_("If [MonumentLight]/[MonumentDark] is marked with a Star, write the number of [Tourist] you have checked When a marker reaches it."), "</i>");
            case 50: return '[Businessman] : ' + _("When a marker reaches [Businessman], check a box on the first available row on the [Businessman] zone. You will score when you drop off the [Businessman] to [Office]. If the current row is full and you didn't reach [Office], nothing happens.");
            case 51: return '[Office] : ' + _("When a marker reaches [Office], write the score on the column of the [Businessman] at the end of the current row, and check the corresponding symbol ([OldLady], [Tourist] or [Student]) as if you reached it with a marker. If the current row is empty, nothing happens.") + "<br><i>".concat(_("If the [Office] is marked with a Star, write the number of [Businessman] you have checked When a marker reaches it."), "</i>");
            case 90: return _("<strong>Common Objective:</strong> Score 10 points when you complete the objective, or 6 points if another player completed it on a previous round.");
            case 91: return _("<strong>Personal Objective:</strong> Score 10 points when your markers link the 3 Letters of your personal objective.");
            case 92: return _("<strong>Turn Zone:</strong> If you choose to change a turn into a straight line or a straight line to a turn, check a box on the Turn Zone. The score here is negative, and you only have 5 of them!");
            case 93: return _("<strong>Traffic Jam:</strong> For each marker already in place when you add a marker on a route, check a Traffic Jam box. If the road is black, check an extra box. The score here is negative!");
            case 94: return _("<strong>Total score:</strong> Add sum of all green zone totals, subtract sum of all red zone totals.");
            case 95: return _("<strong>Tickets:</strong> The red check indicates the current round ticket. It defines the shape of the route you have to place. The black checks indicates past rounds.");
            case 97: return _("<strong>Letter:</strong> Used to define your personal objective.");
        }
    };
    LookAtTheStars.prototype.addTooltips = function () {
        var _this = this;
        document.querySelectorAll("[data-tooltip]").forEach(function (element) {
            var tooltipsIds = JSON.parse(element.dataset.tooltip);
            var tooltip = "";
            tooltipsIds.forEach(function (id) { return tooltip += "<div class=\"tooltip-section\">".concat(formatTextIcons(_this.getTooltip(id)), "</div>"); });
            _this.addTooltipHtml(element.id, tooltip);
        });
    };
    LookAtTheStars.prototype.eliminatePlayer = function (playerId) {
        this.gamedatas.players[playerId].eliminated = 1;
        document.getElementById("overall_player_board_".concat(playerId)).classList.add('eliminated-player');
        dojo.addClass("player-table-".concat(playerId), 'eliminated');
        this.setNewScore(playerId, 0);
    };
    LookAtTheStars.prototype.setNewScore = function (playerId, score) {
        var _this = this;
        var _a;
        if (this.gamedatas.hiddenScore) {
            setTimeout(function () {
                Object.keys(_this.gamedatas.players).filter(function (pId) { return _this.gamedatas.players[pId].eliminated == 0; }).forEach(function (pId) { return document.getElementById("player_score_".concat(pId)).innerHTML = '-'; });
            }, 100);
        }
        else {
            if (!isNaN(score)) {
                (_a = this.scoreCtrl[playerId]) === null || _a === void 0 ? void 0 : _a.toValue(this.gamedatas.players[playerId].eliminated != 0 ? 0 : score);
            }
        }
    };
    LookAtTheStars.prototype.positionReached = function (position, playerMarkers) {
        return playerMarkers.some(function (marker) { return marker.from == position || marker.to == position; });
    };
    LookAtTheStars.prototype.highlightObjectiveLetters = function (player) {
        var _this = this;
        if (player.personalObjective) {
            var lettersPositions = player.personalObjectivePositions;
            lettersPositions.forEach(function (lettersPosition) {
                var reached = _this.positionReached(lettersPosition, player.markers).toString();
                var mapLetter = document.querySelector(".objective-letter[data-position=\"".concat(lettersPosition, "\"]"));
                var panelLetter = document.querySelector(".letter[data-player-id=\"".concat(player.id, "\"][data-position=\"").concat(lettersPosition, "\"]"));
                if (mapLetter) {
                    mapLetter.dataset.reached = reached;
                }
                if (panelLetter) {
                    panelLetter.dataset.reached = reached;
                }
            });
        }
    };
    LookAtTheStars.prototype.setObjectivesCounters = function (playerId, scoreSheet) {
        if (playerId === this.getPlayerId()) {
            [1, 2].forEach(function (objectiveNumber) {
                var span = document.getElementById("common-objective-".concat(objectiveNumber, "-counter"));
                var objective = COMMON_OBJECTIVES[Number(span.dataset.type)];
                var checked = 0;
                switch (objective[0]) {
                    case 20: //OLD_LADY
                        checked = scoreSheet.oldLadies.checked;
                        break;
                    case 30: //STUDENT
                        checked = scoreSheet.students.checkedStudents + scoreSheet.students.checkedInternships;
                        break;
                    case 40: //TOURIST
                        checked = scoreSheet.tourists.checkedTourists.reduce(function (a, b) { return a + b; }, 0);
                        break;
                    case 50: //BUSINESSMAN
                        checked = scoreSheet.businessmen.checkedBusinessmen.reduce(function (a, b) { return a + b; }, 0);
                        break;
                    case 41: //MONUMENT_LIGHT
                        checked = scoreSheet.tourists.checkedMonumentsLight;
                        break;
                    case 42: //MONUMENT_DARK
                        checked = scoreSheet.tourists.checkedMonumentsDark;
                        break;
                }
                span.innerHTML = checked.toString();
                span.dataset.reached = (checked >= objective[1]).toString();
            });
        }
    };
    LookAtTheStars.prototype.placeDeparturePawn = function (position) {
        if (!this.checkAction('placeDeparturePawn')) {
            return;
        }
        this.takeAction('placeDeparturePawn', {
            position: position
        });
    };
    LookAtTheStars.prototype.placeRoute = function (from, to) {
        var _this = this;
        var _a;
        var args = this.gamedatas.gamestate.args;
        var route = (_a = args.possibleRoutes) === null || _a === void 0 ? void 0 : _a.find(function (r) { return (r.from === from && r.to === to) || (r.from === to && r.to === from); });
        if (!route) {
            return;
        }
        if (!this.checkAction('placeRoute')) {
            return;
        }
        var eliminationWarning = route.isElimination /* && args.possibleRoutes.some(r => !r.isElimination)*/;
        if (eliminationWarning) {
            this.confirmationDialog(_('Are you sure you want to place that marker? You will be eliminated!'), function () {
                _this.takeAction('placeRoute', {
                    from: from,
                    to: to,
                });
            });
        }
        else {
            this.takeAction('placeRoute', {
                from: from,
                to: to,
            });
        }
    };
    LookAtTheStars.prototype.cancelLast = function () {
        if (!this.checkAction('cancelLast')) {
            return;
        }
        this.takeAction('cancelLast');
    };
    LookAtTheStars.prototype.resetTurn = function () {
        if (!this.checkAction('resetTurn')) {
            return;
        }
        this.takeAction('resetTurn');
    };
    LookAtTheStars.prototype.confirmTurn = function () {
        if (!this.checkAction('confirmTurn', true)) {
            return;
        }
        this.takeAction('confirmTurn');
    };
    LookAtTheStars.prototype.takeAction = function (action, data) {
        data = data || {};
        data.lock = true;
        this.ajaxcall("/lookatthestars/lookatthestars/".concat(action, ".html"), data, this, function () { });
    };
    LookAtTheStars.prototype.startActionTimer = function (buttonId, time) {
        var _a;
        if (Number((_a = this.prefs[202]) === null || _a === void 0 ? void 0 : _a.value) === 2) {
            return;
        }
        var button = document.getElementById(buttonId);
        var actionTimerId = null;
        var _actionTimerLabel = button.innerHTML;
        var _actionTimerSeconds = time;
        var actionTimerFunction = function () {
            var button = document.getElementById(buttonId);
            if (button == null || button.classList.contains('disabled')) {
                window.clearInterval(actionTimerId);
            }
            else if (_actionTimerSeconds-- > 1) {
                button.innerHTML = _actionTimerLabel + ' (' + _actionTimerSeconds + ')';
            }
            else {
                window.clearInterval(actionTimerId);
                button.click();
            }
        };
        actionTimerFunction();
        actionTimerId = window.setInterval(function () { return actionTimerFunction(); }, 1000);
    };
    ///////////////////////////////////////////////////
    //// Reaction to cometD notifications
    /*
        setupNotifications:

        In this method, you associate each of your game notifications with your local method to handle it.

        Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                your pylos.game.php file.

    */
    LookAtTheStars.prototype.setupNotifications = function () {
        //log( 'notifications subscriptions setup' );
        var _this = this;
        var notifs = [
            ['newRound', ANIMATION_MS],
            ['placedRoute', ANIMATION_MS * 2],
            ['confirmTurn', ANIMATION_MS],
            ['flipObjective', ANIMATION_MS],
            ['removeMarkers', 1],
            ['revealPersonalObjective', 1],
            ['updateScoreSheet', 1],
        ];
        notifs.forEach(function (notif) {
            dojo.subscribe(notif[0], _this, "notif_".concat(notif[0]));
            _this.notifqueue.setSynchronous(notif[0], notif[1]);
        });
    };
    LookAtTheStars.prototype.notif_newRound = function (notif) {
        this.playersTables.forEach(function (playerTable) { return playerTable.setRound(notif.args.validatedTickets, notif.args.currentTicket); });
        this.roundNumberCounter.toValue(notif.args.round);
    };
    LookAtTheStars.prototype.notif_updateScoreSheet = function (notif) {
        var _this = this;
        var playerId = notif.args.playerId;
        this.registeredTablesByPlayerId[playerId].forEach(function (table) { return table.updateScoreSheet(notif.args.scoreSheets, !_this.gamedatas.hiddenScore); });
        this.setNewScore(playerId, notif.args.scoreSheets.current.total);
        this.setObjectivesCounters(playerId, notif.args.scoreSheets.current);
    };
    LookAtTheStars.prototype.notif_placedRoute = function (notif) {
        var playerId = notif.args.playerId;
        this.gamedatas.players[notif.args.playerId].markers.push(notif.args.marker);
        var player = this.gamedatas.players[notif.args.playerId];
        this.highlightObjectiveLetters(player);
    };
    LookAtTheStars.prototype.notif_confirmTurn = function (notif) {
        //notif.args.markers.forEach(marker => this.tableCenter.setMarkerValidated(notif.args.playerId, marker));
    };
    LookAtTheStars.prototype.notif_removeMarkers = function (notif) {
        var _this = this;
        notif.args.markers.forEach(function (marker) {
            var markerIndex = _this.gamedatas.players[notif.args.playerId].markers.findIndex(function (m) { return m.from == marker.from && m.to == marker.to; });
            if (markerIndex !== -1) {
                _this.gamedatas.players[notif.args.playerId].markers.splice(markerIndex, 1);
            }
        });
        var player = this.gamedatas.players[notif.args.playerId];
        this.highlightObjectiveLetters(player);
    };
    LookAtTheStars.prototype.notif_playerEliminated = function (notif) {
        var playerId = Number(notif.args.who_quits);
        this.setNewScore(playerId, 0);
        this.eliminatePlayer(playerId);
    };
    LookAtTheStars.prototype.notif_flipObjective = function (notif) {
        document.getElementById("common-objective-".concat(notif.args.objective.id)).dataset.side = '1';
    };
    LookAtTheStars.prototype.notif_revealPersonalObjective = function (notif) {
        var playerId = notif.args.playerId;
        var player = this.gamedatas.players[playerId];
        player.personalObjective = notif.args.personalObjective;
        player.personalObjectiveLetters = notif.args.personalObjectiveLetters;
        player.personalObjectivePositions = notif.args.personalObjectivePositions;
        this.showPersonalObjective(playerId);
        this.highlightObjectiveLetters(player);
    };
    /* This enable to inject translatable styled things to logs or action bar */
    /* @Override */
    LookAtTheStars.prototype.format_string_recursive = function (log, args) {
        try {
            if (log && args && !args.processed) {
                if (args.shape && args.shape[0] != '<') {
                    args.shape = "<div class=\"shape\" data-shape=\"".concat(JSON.stringify(args.shape), "\" data-step=\"").concat(args.step, "\"></div>");
                }
                if (args.elements && typeof args.elements !== 'string') {
                    args.elements = args.elements.map(function (element) {
                        return "<div class=\"map-icon\" data-element=\"".concat(element, "\"></div>");
                    }).join('');
                }
                if (args.objectiveLetters && args.objectiveLetters[0] != '<') {
                    args.objectiveLetters = "<strong>".concat(args.objectiveLetters, "</strong>");
                }
            }
        }
        catch (e) {
            console.error(log, args, "Exception thrown", e.stack);
        }
        return this.inherited(arguments);
    };
    return LookAtTheStars;
}());
define([
    "dojo", "dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    "ebg/stock"
], function (dojo, declare) {
    return declare("bgagame.lookatthestars", ebg.core.gamegui, new LookAtTheStars());
});
