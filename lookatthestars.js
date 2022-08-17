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
            this.game.removeTooltip("card-".concat(card.id));
            var oldType = Number(existingDiv.dataset.category);
            existingDiv.dataset.side = '' + side;
            if (!oldType && card.type) {
                this.setVisibleInformations(existingDiv, card);
            }
            else if (oldType && !card.type) {
                setTimeout(function () { return _this.removeVisibleInformations(existingDiv); }, 500); // so we don't change face while it is still visible
            }
            this.game.setTooltip(existingDiv.id, this.getTooltip(card.type, card.family));
            if (!destinationId || existingDiv.parentElement.id == destinationId) {
                return;
            }
            if (init) {
                document.getElementById(destinationId).appendChild(existingDiv);
            }
            else {
                slideToObjectAndAttach(this.game, existingDiv, destinationId);
            }
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
        div.dataset.typeArg = '' + card.typeArg;
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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
;
var log = isDebug ? console.log.bind(window.console) : function () { };
var SVG_LEFT_MARGIN = 37.5;
var SVG_BOTTOM_MARGIN = 577;
var SVG_LINE_WIDTH = 52.3;
var SVG_LINE_HEIGHT = 53.5;
function isSafari() {
    return !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);
}
var PlayerTable = /** @class */ (function () {
    function PlayerTable(game, player) {
        this.game = game;
        this.playerId = Number(player.id);
        var html = "\n        <div id=\"player-table-".concat(this.playerId, "\" class=\"player-table \" style=\"box-shadow: 0 0 3px 3px #").concat(player.color, ";\" data-type=\"").concat(player.sheetType, "\">\n            <div id=\"player-table-").concat(this.playerId, "-main\" class=\"main\">\n                <div id=\"player-table-").concat(this.playerId, "-svg\" class=\"svg-wrapper\">").concat(this.makeSVG(), "</div>\n                <div id=\"player-table-").concat(this.playerId, "-day\" class=\"day\" data-level=\"").concat(this.game.day, "\">\n                </div>\n            </div>\n            <div class=\"name\" style=\"color: #").concat(player.color, ";\">\n                <span>").concat(player.name, "</span>\n            </div>\n\n            <div class=\"checkedConstellations\">");
        for (var i = 3; i <= 8; i++) {
            html += "<div id=\"player-table-".concat(this.playerId, "-constellation").concat(i, "\" class=\"constellation score\" data-number=\"").concat(i, "\"></div>");
        }
        html += "    </div>\n            <div id=\"player-table-".concat(this.playerId, "-constellations\" class=\"constellations score\"></div>\n            <div id=\"player-table-").concat(this.playerId, "-planets\" class=\"planets score\"></div>\n            <div id=\"player-table-").concat(this.playerId, "-shooting-stars\" class=\"shooting-stars score\"></div>\n            <div id=\"player-table-").concat(this.playerId, "-star1\" class=\"star1 score\"></div>\n            <div id=\"player-table-").concat(this.playerId, "-star2\" class=\"star2 score\"></div>\n            <div id=\"player-table-").concat(this.playerId, "-total\" class=\"total score\"></div>\n        </div>\n        ");
        dojo.place(html, document.getElementById('tables'));
        this.placeLines(player.lines);
        this.placeInitialObjects(player.objects);
        if (player.roundLines) {
            this.placeLines(player.roundLines, ['round']);
        }
        if (player.roundObjects) {
            this.placeInitialObjects(player.roundObjects, ['round', 'round-bonus']);
        }
        if (player.playerScore) {
            this.setConstellationsScore(player.playerScore.checkedConstellations, player.playerScore.constellations);
            this.setPlanetScore(player.playerScore.planets);
            this.setShootingStarsScore(player.playerScore.shootingStars);
            this.setStar1Score(player.playerScore.star1);
            this.setStar2Score(player.playerScore.star2);
            this.setFinalScore(player.playerScore.total);
        }
        //refresh hack
        /*// TODO ? if (!isSafari()) {
            const svg = document.getElementById(`lats-svg-${this.playerId}`);
            svg.setAttribute('filter',"");
            setTimeout(()=>{
                    svg.setAttribute('filter',"url(#PencilTexture)");
            },800);
        }*/
    }
    PlayerTable.prototype.onKeyPress = function (event) {
        if (['TEXTAREA', 'INPUT'].includes(event.target.nodeName)) {
            return;
        }
        //console.log(event.key, event.keyCode);
        var action = null;
        if (this.currentCard) {
            action = 'Shape';
        }
        else if (this.linePossiblePositions) {
            action = 'Line';
        }
        if (action != null) {
            switch (event.key) { // event.keyCode
                case 'ArrowUp': // 38
                    this["move".concat(action, "Top")]();
                    event.stopImmediatePropagation();
                    event.preventDefault();
                    break;
                case 'ArrowRight': // 39
                    this["move".concat(action, "Right")]();
                    event.stopImmediatePropagation();
                    event.preventDefault();
                    break;
                case 'ArrowDown': // 40
                    this["move".concat(action, "Bottom")]();
                    event.stopImmediatePropagation();
                    event.preventDefault();
                    break;
                case 'ArrowLeft': // 37
                    this["move".concat(action, "Left")]();
                    event.stopImmediatePropagation();
                    event.preventDefault();
                    break;
                case ' ': // 32
                case 'Space': // 32
                case 'Tab': // 9
                case 'Shift': // 16
                case 'Control': // 17
                    this["rotate".concat(action)]();
                    event.stopImmediatePropagation();
                    event.preventDefault();
                    break;
                case 'Alt': // 18
                    this["rotate".concat(action, "Backwards")]();
                    event.stopImmediatePropagation();
                    event.preventDefault();
                    break;
                case 'Enter': // 13
                    switch (action) {
                        case 'Shape':
                            if (this.getValid()) {
                                this.game.placeShape();
                            }
                            break;
                        case 'Line':
                            if (this.getValidForLine()) {
                                this.game.placeLine();
                            }
                            break;
                    }
                    event.stopImmediatePropagation();
                    event.preventDefault();
                    break;
            }
        }
    };
    PlayerTable.prototype.placeInitialObjects = function (objects, classes) {
        var _this = this;
        var _a, _b, _c;
        if (classes === void 0) { classes = []; }
        (_a = objects.shootingStars) === null || _a === void 0 ? void 0 : _a.forEach(function (shootingStar) {
            _this.placeLines(shootingStar.lines, classes);
            _this.placeShootingStarHead(shootingStar.head, classes);
        });
        (_b = objects.planets) === null || _b === void 0 ? void 0 : _b.forEach(function (planet) { return _this.placeObject(planet, 'planet', classes); });
        (_c = objects.stars) === null || _c === void 0 ? void 0 : _c.forEach(function (star) { return _this.placeObject(star, 'star', classes); });
    };
    PlayerTable.prototype.setDay = function (day) {
        document.getElementById("player-table-".concat(this.playerId, "-day")).dataset.level = '' + day;
    };
    PlayerTable.prototype.makeSVG = function () {
        return "\n        <svg viewBox=\"0 0 546 612\" preserveAspectRatio=\"none\"> \n            <defs>\n                <filter x=\"-2%\" y=\"-2%\" width=\"104%\" height=\"104%\" filterUnits=\"objectBoundingBox\" id=\"PencilTexture\">\n                <feTurbulence type=\"fractalNoise\" baseFrequency=\"3.4\" numOctaves=\"2\" result=\"noise\">\n                </feTurbulence>\n                <feDisplacementMap xChannelSelector=\"R\" yChannelSelector=\"G\" scale=\"4\" in=\"SourceGraphic\" result=\"newSource\">\n                </feDisplacementMap>\n                </filter>\n            </defs>\n            <g id=\"lats-svg-".concat(this.playerId, "\" ").concat(isSafari() ? '' : 'filter="url(#PencilTexture)"', ">\n                <line x1=\"0\" y1=\"0\" x2=\"0\" y2=\"0\"  stroke=\"red\" stroke-width=\"1\" stroke-opacity=\"1\"></line>\n            </g>\n        </svg>");
    };
    PlayerTable.prototype.placeLines = function (lines, additionalClass) {
        var _this = this;
        if (additionalClass === void 0) { additionalClass = []; }
        lines.forEach(function (line) { return _this.placeLine(line, parseInt(line[0], 16), parseInt(line[1], 16), parseInt(line[2], 16), parseInt(line[3], 16), additionalClass); });
    };
    PlayerTable.prototype.placeShootingStarHead = function (head, additionalClass) {
        var _a, _b, _c, _d;
        if (additionalClass === void 0) { additionalClass = []; }
        var lineid = "shooting-star-head-".concat(this.playerId, "-").concat(head);
        var headLinesLength = 13;
        var x = SVG_LEFT_MARGIN + parseInt(head[0], 16) * SVG_LINE_WIDTH;
        var y = SVG_BOTTOM_MARGIN - parseInt(head[1], 16) * SVG_LINE_HEIGHT;
        var newLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        newLine.setAttribute('id', lineid + '1');
        newLine.setAttribute('d', "M".concat(x - headLinesLength, " ").concat(y, " L").concat(x + headLinesLength, " ").concat(y, " Z"));
        (_a = newLine.classList).add.apply(_a, __spreadArray(['line'], additionalClass, false));
        $('lats-svg-' + this.playerId).append(newLine);
        newLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        newLine.setAttribute('id', lineid + '1');
        newLine.setAttribute('d', "M".concat(x, " ").concat(y - headLinesLength, " L").concat(x, " ").concat(y + headLinesLength, " Z"));
        (_b = newLine.classList).add.apply(_b, __spreadArray(['line'], additionalClass, false));
        $('lats-svg-' + this.playerId).append(newLine);
        newLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        newLine.setAttribute('id', lineid + '1');
        newLine.setAttribute('d', "M".concat(x - headLinesLength, " ").concat(y - headLinesLength, " L").concat(x + headLinesLength, " ").concat(y + headLinesLength, " Z"));
        (_c = newLine.classList).add.apply(_c, __spreadArray(['line'], additionalClass, false));
        $('lats-svg-' + this.playerId).append(newLine);
        newLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        newLine.setAttribute('id', lineid + '1');
        newLine.setAttribute('d', "M".concat(x + headLinesLength, " ").concat(y - headLinesLength, " L").concat(x - headLinesLength, " ").concat(y + headLinesLength, " Z"));
        (_d = newLine.classList).add.apply(_d, __spreadArray(['line'], additionalClass, false));
        $('lats-svg-' + this.playerId).append(newLine);
    };
    PlayerTable.prototype.placeObject = function (coordinates, type, additionalClass) {
        var _a;
        if (additionalClass === void 0) { additionalClass = []; }
        var newObject = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        var xCoordinate = parseInt(coordinates[0], 16);
        var yCoordinate = parseInt(coordinates[1], 16);
        var x = SVG_LEFT_MARGIN + xCoordinate * SVG_LINE_WIDTH;
        var y = SVG_BOTTOM_MARGIN - yCoordinate * SVG_LINE_HEIGHT;
        newObject.setAttribute('id', type + coordinates);
        newObject.setAttribute('x', "".concat(x - 20));
        newObject.setAttribute('y', "".concat(y - 20));
        newObject.setAttribute('width', "40");
        newObject.setAttribute('height', "40");
        newObject.setAttribute('href', "".concat(g_gamethemeurl, "img/object-").concat(type, ".png"));
        (_a = newObject.classList).add.apply(_a, __spreadArray(['object'], additionalClass, false));
        document.getElementById('lats-svg-' + this.playerId).after(newObject);
    };
    PlayerTable.prototype.placeLine = function (line, xfrom, yfrom, xto, yto, additionalClass) {
        var _a;
        var _this = this;
        if (additionalClass === void 0) { additionalClass = []; }
        var lineid = "line-".concat(this.playerId, "-").concat(line);
        var c1 = {
            x: SVG_LEFT_MARGIN + (xfrom * SVG_LINE_WIDTH),
            y: SVG_BOTTOM_MARGIN - (yfrom * SVG_LINE_HEIGHT),
        };
        var c2 = {
            x: SVG_LEFT_MARGIN + (xto * SVG_LINE_WIDTH),
            y: SVG_BOTTOM_MARGIN - (yto * SVG_LINE_HEIGHT),
        };
        var newLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        newLine.setAttribute('id', lineid);
        newLine.setAttribute('d', "M".concat(c1.x, " ").concat(c1.y, " L").concat(c2.x, " ").concat(c2.y, " Z"));
        (_a = newLine.classList).add.apply(_a, __spreadArray(['line'], additionalClass, false));
        //newLine.setAttribute('vector-effect','non-scaling-stroke');
        $('lats-svg-' + this.playerId).append(newLine);
        // TODO ? newLine.setAttribute('style', 'stroke-dasharray:'+newLine.getTotalLength()+';stroke-dashoffset:'+newLine.getTotalLength());
        //force refresh hack
        setTimeout(function () {
            newLine === null || newLine === void 0 ? void 0 : newLine.setAttribute('style', '');
            var svgDiv = document.getElementById("player-table-".concat(_this.playerId, "-svg"));
            if (svgDiv) {
                if (svgDiv.getAttribute('style') == 'opacity:0.9999;') {
                    svgDiv.setAttribute('style', 'opacity:1');
                }
                else {
                    svgDiv.setAttribute('style', 'opacity:0.9999;');
                }
            }
        }, 1500);
    };
    PlayerTable.prototype.getShapeInformations = function () {
        return {
            x: this.shapeX,
            y: this.shapeY,
            rotation: this.shapeRotation,
        };
    };
    PlayerTable.prototype.getShootingStarInformations = function () {
        return __assign(__assign({}, this.getShapeInformations()), { size: this.shootingStarSize });
    };
    PlayerTable.prototype.getLineInformations = function () {
        return {
            xFrom: this.shapeX,
            yFrom: this.shapeY,
            xTo: [1, 2, 3].includes(this.shapeRotation) ? this.shapeX + 1 : ([5, 6, 7].includes(this.shapeRotation) ? this.shapeX - 1 : this.shapeX),
            yTo: [7, 0, 1].includes(this.shapeRotation) ? this.shapeY + 1 : ([3, 4, 5].includes(this.shapeRotation) ? this.shapeY - 1 : this.shapeY),
        };
    };
    PlayerTable.prototype.setCardBorderPosition = function () {
        var x = SVG_LEFT_MARGIN + (this.shapeX * SVG_LINE_WIDTH);
        var y = SVG_BOTTOM_MARGIN - (this.shapeY * SVG_LINE_HEIGHT);
        var cardBorderDiv = document.getElementById("player-table-".concat(this.playerId, "-card-border"));
        cardBorderDiv.style.left = "".concat(x - 20, "px");
        cardBorderDiv.style.top = "".concat(y - 180, "px");
    };
    PlayerTable.prototype.setLineBorderPosition = function () {
        var x = SVG_LEFT_MARGIN + (this.shapeX * SVG_LINE_WIDTH);
        var y = SVG_BOTTOM_MARGIN - (this.shapeY * SVG_LINE_HEIGHT);
        var cardBorderDiv = document.getElementById("player-table-".concat(this.playerId, "-line-border"));
        cardBorderDiv.style.left = "".concat(x - 70, "px");
        cardBorderDiv.style.top = "".concat(y - 70, "px");
    };
    PlayerTable.prototype.getValid = function () {
        var possiblePositions;
        if (this.currentCard.type == 1) {
            possiblePositions = this.shootingStarPossiblePositions[this.shootingStarSize];
        }
        else if (this.currentCard.type == 2) {
            possiblePositions = this.possiblePositions;
        }
        return possiblePositions[(this.shapeX + 1).toString(16) + (this.shapeY + 1).toString(16)].includes(this.shapeRotation);
    };
    PlayerTable.prototype.getValidClass = function () {
        return this.getValid() ? 'valid' : 'invalid';
    };
    PlayerTable.prototype.getValidForLine = function () {
        var infos = this.getLineInformations();
        var fromStr = infos.xFrom.toString(16) + infos.yFrom.toString(16);
        var toStr = infos.xTo.toString(16) + infos.yTo.toString(16);
        return this.linePossiblePositions.includes(fromStr + toStr) || this.linePossiblePositions.includes(toStr + fromStr);
    };
    PlayerTable.prototype.getValidClassForLine = function () {
        return this.getValidForLine() ? 'valid' : 'invalid';
    };
    PlayerTable.prototype.setShapeToPlace = function (currentShape, possiblePositions) {
        var _this = this;
        if (this.currentCard != null) {
            return;
        }
        this.currentCard = currentShape;
        this.shapeX = 3;
        this.shapeY = 3 + this.game.day;
        this.shapeRotation = 0;
        if (this.currentCard.type == 1) {
            this.shootingStarPossiblePositions = possiblePositions;
            this.shootingStarSize = 3;
        }
        else if (this.currentCard.type == 2) {
            this.possiblePositions = possiblePositions;
        }
        var validClass = this.getValidClass();
        dojo.place("<div id=\"player-table-".concat(this.playerId, "-card-border\" class=\"card border\" data-validity=\"").concat(validClass, "\">\n            <div id=\"player-table-").concat(this.playerId, "-button-left\" type=\"button\" class=\"arrow left\"></div>\n            <div id=\"player-table-").concat(this.playerId, "-button-right\" type=\"button\" class=\"arrow right\"></div>\n            <div id=\"player-table-").concat(this.playerId, "-button-top\" type=\"button\" class=\"arrow top\"></div>\n            <div id=\"player-table-").concat(this.playerId, "-button-bottom\" type=\"button\" class=\"arrow bottom\"></div>\n            <div id=\"player-table-").concat(this.playerId, "-button-rotate\" type=\"button\" class=\"arrow rotate\"></div>\n        </div>"), "player-table-".concat(this.playerId, "-main"));
        this.setCardBorderPosition();
        document.getElementById("player-table-".concat(this.playerId, "-button-left")).addEventListener('click', function () { return _this.moveShapeLeft(); });
        document.getElementById("player-table-".concat(this.playerId, "-button-right")).addEventListener('click', function () { return _this.moveShapeRight(); });
        document.getElementById("player-table-".concat(this.playerId, "-button-top")).addEventListener('click', function () { return _this.moveShapeTop(); });
        document.getElementById("player-table-".concat(this.playerId, "-button-bottom")).addEventListener('click', function () { return _this.moveShapeBottom(); });
        document.getElementById("player-table-".concat(this.playerId, "-button-rotate")).addEventListener('click', function () { return _this.rotateShape(); });
        this.moveShape();
    };
    PlayerTable.prototype.setLineToPlace = function (possiblePositions) {
        var _this = this;
        this.linePossiblePositions = possiblePositions;
        this.shapeX = 5;
        this.shapeY = 5 + this.game.day;
        this.shapeRotation = 0;
        var validClass = this.getValidClassForLine();
        dojo.place("<div id=\"player-table-".concat(this.playerId, "-line-border\" class=\"line border\" data-validity=\"").concat(validClass, "\">\n            <div id=\"player-table-").concat(this.playerId, "-button-left\" type=\"button\" class=\"arrow left\"></div>\n            <div id=\"player-table-").concat(this.playerId, "-button-right\" type=\"button\" class=\"arrow right\"></div>\n            <div id=\"player-table-").concat(this.playerId, "-button-top\" type=\"button\" class=\"arrow top\"></div>\n            <div id=\"player-table-").concat(this.playerId, "-button-bottom\" type=\"button\" class=\"arrow bottom\"></div>\n            <div id=\"player-table-").concat(this.playerId, "-button-rotate\" type=\"button\" class=\"arrow rotate\"></div>\n        </div>"), "player-table-".concat(this.playerId, "-main"));
        this.setLineBorderPosition();
        document.getElementById("player-table-".concat(this.playerId, "-button-left")).addEventListener('click', function () { return _this.moveLineLeft(); });
        document.getElementById("player-table-".concat(this.playerId, "-button-right")).addEventListener('click', function () { return _this.moveLineRight(); });
        document.getElementById("player-table-".concat(this.playerId, "-button-top")).addEventListener('click', function () { return _this.moveLineTop(); });
        document.getElementById("player-table-".concat(this.playerId, "-button-bottom")).addEventListener('click', function () { return _this.moveLineBottom(); });
        document.getElementById("player-table-".concat(this.playerId, "-button-rotate")).addEventListener('click', function () { return _this.rotateLine(); });
        this.moveLine();
    };
    PlayerTable.prototype.getRotatedAndShiftedLines = function (lines) {
        var _this = this;
        var rotatedLines = lines.map(function (line) { return line; });
        if (this.shapeRotation == 1 || this.shapeRotation == 3) {
            // rotate 90°
            rotatedLines = rotatedLines.map(function (line) {
                return (Number.parseInt(line[1], 16)).toString(16) +
                    (3 - Number.parseInt(line[0], 16)).toString(16) +
                    (Number.parseInt(line[3], 16)).toString(16) +
                    (3 - Number.parseInt(line[2], 16)).toString(16);
            });
        }
        if (this.shapeRotation == 2 || this.shapeRotation == 3) {
            // rotate 180°
            rotatedLines = rotatedLines.map(function (line) {
                return (3 - Number.parseInt(line[0], 16)).toString(16) +
                    (3 - Number.parseInt(line[1], 16)).toString(16) +
                    (3 - Number.parseInt(line[2], 16)).toString(16) +
                    (3 - Number.parseInt(line[3], 16)).toString(16);
            });
        }
        var rotatedAndShiftedLines = rotatedLines.map(function (line) {
            return (Number.parseInt(line[0], 16) + _this.shapeX).toString(16) +
                (Number.parseInt(line[1], 16) + _this.shapeY).toString(16) +
                (Number.parseInt(line[2], 16) + _this.shapeX).toString(16) +
                (Number.parseInt(line[3], 16) + _this.shapeY).toString(16);
        });
        return rotatedAndShiftedLines;
    };
    ;
    PlayerTable.prototype.getRotatedAndShiftedCoordinates = function (coordinates) {
        var rotatedCoordinates = '' + coordinates;
        if (this.shapeRotation == 1 || this.shapeRotation == 3) {
            // rotate 90°
            rotatedCoordinates =
                (Number.parseInt(rotatedCoordinates[1], 16)).toString(16) +
                    (3 - Number.parseInt(rotatedCoordinates[0], 16)).toString(16);
        }
        if (this.shapeRotation == 2 || this.shapeRotation == 3) {
            // rotate 180°
            rotatedCoordinates =
                (3 - Number.parseInt(rotatedCoordinates[0], 16)).toString(16) +
                    (3 - Number.parseInt(rotatedCoordinates[1], 16)).toString(16);
        }
        var rotatedAndShiftedCoordinates = (Number.parseInt(rotatedCoordinates[0], 16) + this.shapeX).toString(16) +
            (Number.parseInt(rotatedCoordinates[1], 16) + this.shapeY).toString(16);
        return rotatedAndShiftedCoordinates;
    };
    ;
    PlayerTable.prototype.moveShape = function () {
        var _a;
        var oldLines = Array.from(document.getElementById("player-table-".concat(this.playerId, "-svg")).getElementsByClassName('temp-line'));
        oldLines.forEach(function (oldLine) { var _a; return (_a = oldLine.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(oldLine); });
        var validClass = this.getValidClass();
        var lines = [];
        if (this.currentCard.type == 1) {
            lines = this.game.gamedatas.SHOOTING_STAR_SIZES[this.shootingStarSize].lines;
        }
        else if (this.currentCard.type == 2) {
            lines = this.currentCard.lines;
        }
        var rotatedAndShiftedLines = this.getRotatedAndShiftedLines(lines);
        this.placeLines(rotatedAndShiftedLines, ['temp-line', validClass]);
        if (this.currentCard.type == 1) {
            var head = this.game.gamedatas.SHOOTING_STAR_SIZES[this.shootingStarSize].head;
            var rotatedAndShiftedHead = this.getRotatedAndShiftedCoordinates(head);
            this.placeShootingStarHead(rotatedAndShiftedHead, ['temp-line', validClass]);
        }
        this.setCardBorderPosition();
        document.getElementById("player-table-".concat(this.playerId, "-card-border")).dataset.validity = validClass;
        (_a = document.getElementById('placeShape_button')) === null || _a === void 0 ? void 0 : _a.classList.toggle('disabled', !this.getValid());
    };
    PlayerTable.prototype.moveLine = function () {
        var _a;
        var oldLines = Array.from(document.getElementById("player-table-".concat(this.playerId, "-svg")).getElementsByClassName('temp-line'));
        oldLines.forEach(function (oldLine) { var _a; return (_a = oldLine.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(oldLine); });
        var validClass = this.getValidClassForLine();
        var infos = this.getLineInformations();
        var lines = [
            infos.xFrom.toString(16) + infos.yFrom.toString(16) + infos.xTo.toString(16) + infos.yTo.toString(16)
        ];
        this.placeLines(lines, ['temp-line', validClass]);
        this.setLineBorderPosition();
        document.getElementById("player-table-".concat(this.playerId, "-line-border")).dataset.validity = validClass;
        (_a = document.getElementById('placeLine_button')) === null || _a === void 0 ? void 0 : _a.classList.toggle('disabled', !this.getValidForLine());
    };
    PlayerTable.prototype.rotateShape = function () {
        this.shapeRotation = (this.shapeRotation + 1) % 4;
        this.moveShape();
    };
    PlayerTable.prototype.rotateShapeBackwards = function () {
        this.shapeRotation = (4 + this.shapeRotation - 1) % 4;
        this.moveShape();
    };
    PlayerTable.prototype.moveShapeLeft = function () {
        if (this.shapeX <= -1) {
            return;
        }
        this.shapeX--;
        this.moveShape();
    };
    PlayerTable.prototype.moveShapeRight = function () {
        if (this.shapeX >= 7) {
            return;
        }
        this.shapeX++;
        this.moveShape();
    };
    PlayerTable.prototype.rotateLine = function () {
        this.shapeRotation = (this.shapeRotation + 1) % 8;
        this.moveLine();
    };
    PlayerTable.prototype.rotateLineBackwards = function () {
        this.shapeRotation = (8 + this.shapeRotation - 1) % 8;
        this.moveLine();
    };
    PlayerTable.prototype.moveLineBottom = function () {
        if (this.shapeY <= (this.game.day * 2)) {
            return;
        }
        this.shapeY--;
        this.moveLine();
    };
    PlayerTable.prototype.moveLineTop = function () {
        if (this.shapeY >= 10) {
            return;
        }
        this.shapeY++;
        this.moveLine();
    };
    PlayerTable.prototype.moveLineLeft = function () {
        if (this.shapeX <= 0) {
            return;
        }
        this.shapeX--;
        this.moveLine();
    };
    PlayerTable.prototype.moveLineRight = function () {
        if (this.shapeX >= 9) {
            return;
        }
        this.shapeX++;
        this.moveLine();
    };
    PlayerTable.prototype.moveShapeBottom = function () {
        if (this.shapeY <= -1 + (this.game.day * 2)) {
            return;
        }
        this.shapeY--;
        this.moveShape();
    };
    PlayerTable.prototype.moveShapeTop = function () {
        if (this.shapeY >= 8) {
            return;
        }
        this.shapeY++;
        this.moveShape();
    };
    PlayerTable.prototype.removeShapeToPlace = function () {
        var _a;
        var cardBorderDiv = document.getElementById("player-table-".concat(this.playerId, "-card-border"));
        (_a = cardBorderDiv === null || cardBorderDiv === void 0 ? void 0 : cardBorderDiv.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(cardBorderDiv);
        var oldLines = Array.from(document.getElementById("player-table-".concat(this.playerId, "-svg")).getElementsByClassName('temp-line'));
        oldLines.forEach(function (oldLine) { var _a; return (_a = oldLine.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(oldLine); });
        this.currentCard = null;
    };
    PlayerTable.prototype.removeLineToPlace = function () {
        var _a;
        var cardBorderDiv = document.getElementById("player-table-".concat(this.playerId, "-line-border"));
        (_a = cardBorderDiv === null || cardBorderDiv === void 0 ? void 0 : cardBorderDiv.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(cardBorderDiv);
        var oldLines = Array.from(document.getElementById("player-table-".concat(this.playerId, "-svg")).getElementsByClassName('temp-line'));
        oldLines.forEach(function (oldLine) { var _a; return (_a = oldLine.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(oldLine); });
        this.linePossiblePositions = null;
    };
    PlayerTable.prototype.cancelPlacedLines = function () {
        var oldLines = Array.from(document.getElementById("player-table-".concat(this.playerId, "-svg")).getElementsByClassName('round'));
        oldLines.forEach(function (oldLine) { var _a; return (_a = oldLine.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(oldLine); });
    };
    PlayerTable.prototype.cancelBonus = function () {
        var oldLines = Array.from(document.getElementById("player-table-".concat(this.playerId, "-svg")).getElementsByClassName('round-bonus'));
        oldLines.forEach(function (oldLine) { var _a; return (_a = oldLine.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(oldLine); });
    };
    PlayerTable.prototype.setConstellationsScore = function (checkedConstellations, score) {
        for (var i = 3; i <= 8; i++) {
            if (checkedConstellations.includes(i)) {
                document.getElementById("player-table-".concat(this.playerId, "-constellation").concat(i)).innerHTML = '.';
            }
        }
        document.getElementById("player-table-".concat(this.playerId, "-constellations")).innerHTML = '' + score;
    };
    PlayerTable.prototype.setPlanetScore = function (score) {
        document.getElementById("player-table-".concat(this.playerId, "-planets")).innerHTML = '' + score;
    };
    PlayerTable.prototype.setShootingStarsScore = function (score) {
        document.getElementById("player-table-".concat(this.playerId, "-shooting-stars")).innerHTML = '' + score;
    };
    PlayerTable.prototype.setStar1Score = function (score) {
        document.getElementById("player-table-".concat(this.playerId, "-star1")).innerHTML = '' + score;
    };
    PlayerTable.prototype.setStar2Score = function (score) {
        document.getElementById("player-table-".concat(this.playerId, "-star2")).innerHTML = '' + score;
    };
    PlayerTable.prototype.setFinalScore = function (score) {
        document.getElementById("player-table-".concat(this.playerId, "-total")).innerHTML = '' + score;
    };
    PlayerTable.prototype.nextShape = function () {
        // validate round lines
        var oldLines = Array.from(document.getElementById("player-table-".concat(this.playerId, "-svg")).getElementsByClassName('round'));
        oldLines.forEach(function (oldLine) { return oldLine.classList.remove('round'); });
    };
    PlayerTable.prototype.setShootingStarSize = function (size) {
        this.shootingStarSize = size;
        this.moveShape();
        var buttons = Array.from(document.getElementsByClassName('setShootingStarSizeButton'));
        buttons.forEach(function (button) { return button.classList.toggle('current-size', button.dataset.shootingStarSize == '' + size); });
    };
    PlayerTable.prototype.setStarSelection = function (possibleCoordinates, placeFunction) {
        var _this = this;
        possibleCoordinates.forEach(function (possibleCoordinate) {
            var xCoordinate = parseInt(possibleCoordinate[0], 16);
            var yCoordinate = parseInt(possibleCoordinate[1], 16);
            var x = SVG_LEFT_MARGIN + xCoordinate * SVG_LINE_WIDTH;
            var y = SVG_BOTTOM_MARGIN - yCoordinate * SVG_LINE_HEIGHT;
            var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('id', 'possible-coordinates-' + possibleCoordinates);
            circle.setAttribute('cx', "".concat(x));
            circle.setAttribute('cy', "".concat(y));
            circle.setAttribute('r', "10");
            circle.classList.add('coordinates-selector');
            $('lats-svg-' + _this.playerId).after(circle);
            circle.addEventListener('click', function () { return placeFunction(xCoordinate, yCoordinate); });
        });
    };
    PlayerTable.prototype.removeStarSelection = function () {
        var oldLines = Array.from(document.getElementById("player-table-".concat(this.playerId, "-svg")).getElementsByClassName('coordinates-selector'));
        oldLines.forEach(function (oldLine) { var _a; return (_a = oldLine.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(oldLine); });
    };
    return PlayerTable;
}());
var ANIMATION_MS = 500;
var SCORE_MS = 1 /*TODO 000 */;
var ZOOM_LEVELS = [0.5, 0.625, 0.75, 0.875, 1 /*, 1.25, 1.5*/];
var ZOOM_LEVELS_MARGIN = [-100, -60, -33, -14, 0 /*, 20, 33.34*/];
var LOCAL_STORAGE_ZOOM_KEY = 'LookAtTheStars-zoom';
function formatTextIcons(rawText) {
    if (!rawText) {
        return '';
    }
    return rawText
        .replace(/\[CardBack\]/ig, '<div class="icon moon"></div>')
        .replace(/\[Star5\]/ig, '<div class="icon star5"></div>')
        .replace(/\[Star7\]/ig, '<div class="icon star7"></div>');
}
var LookAtTheStars = /** @class */ (function () {
    function LookAtTheStars() {
        this.zoom = 0.75;
        this.day = 0;
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
        if (gamedatas.cards.length <= 6) {
            this.day = 2;
        }
        else if (gamedatas.cards.length <= 12) {
            this.day = 1;
        }
        this.cards = new Cards(this);
        this.tableCenter = new TableCenter(this, gamedatas);
        this.createPlayerTables(gamedatas);
        this.createPlayerJumps(gamedatas);
        //document.addEventListener('keyup', e => this.getCurrentPlayerTable()?.onKeyPress(e));
        document.getElementsByTagName('body')[0].addEventListener('keydown', function (e) { var _a; return (_a = _this.getCurrentPlayerTable()) === null || _a === void 0 ? void 0 : _a.onKeyPress(e); });
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
        log("Ending game setup");
    };
    ///////////////////////////////////////////////////
    //// Game & client states
    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    LookAtTheStars.prototype.onEnteringState = function (stateName, args) {
        var _this = this;
        log('Entering state: ' + stateName, args.args);
        switch (stateName) {
            case 'placeShape':
                this.onEnteringPlaceShape(args.args);
                break;
            case 'placeLine':
                this.onEnteringPlaceLine(args.args);
                break;
            case 'placePlanet':
                this.onEnteringStarSelection(args.args, function (x, y) { return _this.placePlanet(x, y); });
                break;
            case 'placeStar':
                this.onEnteringStarSelection(args.args, function (x, y) { return _this.placeStar(x, y); });
                break;
            case 'nextShape':
                this.onEnteringNextShape();
                break;
            case 'endScore':
                this.onEnteringShowScore();
                break;
        }
    };
    LookAtTheStars.prototype.onEnteringPlaceShape = function (args) {
        var _a;
        (_a = this.getCurrentPlayerTable()) === null || _a === void 0 ? void 0 : _a.setShapeToPlace(args.currentCard, args.possiblePositions);
    };
    LookAtTheStars.prototype.onEnteringPlaceLine = function (args) {
        var _a;
        (_a = this.getCurrentPlayerTable()) === null || _a === void 0 ? void 0 : _a.setLineToPlace(args.possibleLines);
    };
    LookAtTheStars.prototype.onEnteringStarSelection = function (args, placeFunction) {
        var _a;
        (_a = this.getCurrentPlayerTable()) === null || _a === void 0 ? void 0 : _a.setStarSelection(args.possibleCoordinates, placeFunction);
    };
    LookAtTheStars.prototype.onEnteringNextShape = function () {
        this.playersTables.forEach(function (playerTable) { return playerTable.nextShape(); });
    };
    LookAtTheStars.prototype.onEnteringShowScore = function () {
        var _this = this;
        Object.keys(this.gamedatas.players).forEach(function (playerId) { var _a; return (_a = _this.scoreCtrl[playerId]) === null || _a === void 0 ? void 0 : _a.setValue(0); });
    };
    LookAtTheStars.prototype.onLeavingState = function (stateName) {
        log('Leaving state: ' + stateName);
        switch (stateName) {
            case 'placeShape':
                this.onLeavingPlaceShape();
                break;
            case 'placeLine':
                this.onLeavingPlaceLine();
                break;
            case 'placePlanet':
            case 'placeStar':
                this.onLeavingStarSelection();
                break;
        }
    };
    LookAtTheStars.prototype.onLeavingPlaceShape = function () {
        var _a;
        (_a = this.getCurrentPlayerTable()) === null || _a === void 0 ? void 0 : _a.removeShapeToPlace();
    };
    LookAtTheStars.prototype.onLeavingPlaceLine = function () {
        var _a;
        (_a = this.getCurrentPlayerTable()) === null || _a === void 0 ? void 0 : _a.removeLineToPlace();
    };
    LookAtTheStars.prototype.onLeavingStarSelection = function () {
        var _a;
        (_a = this.getCurrentPlayerTable()) === null || _a === void 0 ? void 0 : _a.removeStarSelection();
    };
    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    LookAtTheStars.prototype.onUpdateActionButtons = function (stateName, args) {
        var _this = this;
        log('onUpdateActionButtons: ' + stateName, args);
        if (this.isCurrentPlayerActive()) {
            switch (stateName) {
                case 'placeShape':
                    var placeCardArg = args;
                    if (placeCardArg.currentCard.type == 1) {
                        [1, 2, 3].forEach(function (size) {
                            _this.addActionButton("setShootingStarSize_button".concat(size), _('${size}-line(s) shooting star').replace('${size}', size), function () { return _this.getCurrentPlayerTable().setShootingStarSize(size); }, null, null, 'gray');
                            var buttonDiv = document.getElementById("setShootingStarSize_button".concat(size));
                            buttonDiv.classList.add('setShootingStarSizeButton');
                            buttonDiv.dataset.shootingStarSize = '' + size;
                            buttonDiv.classList.toggle('current-size', size == 3);
                        });
                        this.addActionButton("placeShootingStar_button", _("Place shooting star"), function () { return _this.placeShootingStar(); });
                    }
                    else if (placeCardArg.currentCard.type == 2) {
                        this.addActionButton("placeShape_button", _("Place shape"), function () { return _this.placeShape(); });
                    }
                    this.addActionButton("skipCard_button", _("Skip this card"), function () { return _this.skipCard(); }, null, null, 'red');
                    break;
                case 'placeLine':
                    this.addActionButton("placeLine_button", _("Place line"), function () { return _this.placeLine(); });
                    this.addActionButton("skipBonus_button", _("Skip bonus"), function () { return _this.skipBonus(); }, null, null, 'red');
                    this.addActionButton("cancelPlaceShape_button", _("Cancel"), function () { return _this.cancelPlaceShape(); }, null, null, 'gray');
                    break;
                case 'placePlanet':
                    this.addActionButton("skipBonus_button", _("Skip bonus"), function () { return _this.skipBonus(); }, null, null, 'red');
                    this.addActionButton("cancelPlaceShape_button", _("Cancel"), function () { return _this.cancelPlaceShape(); }, null, null, 'gray');
                    break;
                case 'confirmTurn':
                    this.addActionButton("confirmTurn_button", _("Confirm turn"), function () { return _this.confirmTurn(); });
                    this.startActionTimer("confirmTurn_button", 10);
                    var confirmTurnArgs = args;
                    if (confirmTurnArgs.canCancelBonus) {
                        this.addActionButton("cancelBonus_button", _("Cancel bonus"), function () { return _this.cancelBonus(); }, null, null, 'gray');
                    }
                    this.addActionButton("cancelPlaceShape_button", _("Cancel turn"), function () { return _this.cancelPlaceShape(); }, null, null, 'gray');
                    break;
            }
        }
        else if (stateName == 'playCard') {
            this.addActionButton("cancelPlaceShape_button", _("Cancel"), function () { return _this.cancelPlaceShape(); }, null, null, 'gray');
            this.onLeavingPlaceShape();
            this.onLeavingPlaceLine();
            this.onLeavingStarSelection();
        }
    };
    ///////////////////////////////////////////////////
    //// Utility methods
    ///////////////////////////////////////////////////
    LookAtTheStars.prototype.getPlayerId = function () {
        return Number(this.player_id);
    };
    LookAtTheStars.prototype.getPlayerColor = function (playerId) {
        return this.gamedatas.players[playerId].color;
    };
    LookAtTheStars.prototype.getPlayer = function (playerId) {
        return Object.values(this.gamedatas.players).find(function (player) { return Number(player.id) == playerId; });
    };
    LookAtTheStars.prototype.getPlayerTable = function (playerId) {
        return this.playersTables.find(function (playerTable) { return playerTable.playerId === playerId; });
    };
    LookAtTheStars.prototype.getCurrentPlayerTable = function () {
        var _this = this;
        return this.playersTables.find(function (playerTable) { return playerTable.playerId === _this.getPlayerId(); });
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
    LookAtTheStars.prototype.getOrderedPlayers = function (gamedatas) {
        var _this = this;
        var players = Object.values(gamedatas.players).sort(function (a, b) { return a.playerNo - b.playerNo; });
        var playerIndex = players.findIndex(function (player) { return Number(player.id) === Number(_this.player_id); });
        var orderedPlayers = playerIndex > 0 ? __spreadArray(__spreadArray([], players.slice(playerIndex), true), players.slice(0, playerIndex), true) : players;
        return orderedPlayers;
    };
    LookAtTheStars.prototype.createPlayerTables = function (gamedatas) {
        var _this = this;
        var orderedPlayers = this.getOrderedPlayers(gamedatas);
        orderedPlayers.forEach(function (player) {
            return _this.createPlayerTable(gamedatas, Number(player.id));
        });
    };
    LookAtTheStars.prototype.createPlayerTable = function (gamedatas, playerId) {
        var table = new PlayerTable(this, gamedatas.players[playerId]);
        this.playersTables.push(table);
        this.registeredTablesByPlayerId[playerId] = [table];
    };
    LookAtTheStars.prototype.createPlayerJumps = function (gamedatas) {
        var _this = this;
        dojo.place("\n        <div id=\"jump-toggle\" class=\"jump-link toggle\">\n            \u21D4\n        </div>\n        <div id=\"jump-0\" class=\"jump-link\">\n            <div class=\"eye\"></div> ".concat(formatTextIcons('[CardBack][Star5][Star7]'), "\n        </div>"), "jump-controls");
        document.getElementById("jump-toggle").addEventListener('click', function () { return _this.jumpToggle(); });
        document.getElementById("jump-0").addEventListener('click', function () { return _this.jumpToPlayer(0); });
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
        var elementId = playerId === 0 ? "cards" : "player-table-".concat(playerId);
        document.getElementById(elementId).scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    };
    LookAtTheStars.prototype.setPoints = function (playerId, points) {
        var _a;
        (_a = this.scoreCtrl[playerId]) === null || _a === void 0 ? void 0 : _a.toValue(points);
        this.getPlayerTable(playerId).setFinalScore(points);
    };
    LookAtTheStars.prototype.placeShape = function () {
        if (!this.checkAction('placeShape')) {
            return;
        }
        var informations = this.getCurrentPlayerTable().getShapeInformations();
        this.takeAction('placeShape', informations);
    };
    LookAtTheStars.prototype.placeShootingStar = function () {
        if (!this.checkAction('placeShootingStar')) {
            return;
        }
        var informations = this.getCurrentPlayerTable().getShootingStarInformations();
        this.takeAction('placeShootingStar', informations);
    };
    LookAtTheStars.prototype.placeLine = function () {
        if (!this.checkAction('placeLine')) {
            return;
        }
        var informations = this.getCurrentPlayerTable().getLineInformations();
        this.takeAction('placeLine', informations);
    };
    LookAtTheStars.prototype.placePlanet = function (x, y) {
        if (!this.checkAction('placePlanet')) {
            return;
        }
        this.takeAction('placePlanet', { x: x, y: y });
    };
    LookAtTheStars.prototype.placeStar = function (x, y) {
        if (!this.checkAction('placeStar')) {
            return;
        }
        this.takeAction('placeStar', { x: x, y: y });
    };
    LookAtTheStars.prototype.cancelPlaceShape = function () {
        /*if(!(this as any).checkAction('cancelPlaceShape')) {
            return;
        }*/
        this.takeAction('cancelPlaceShape');
    };
    LookAtTheStars.prototype.cancelBonus = function () {
        if (!this.checkAction('cancelBonus')) {
            return;
        }
        this.takeAction('cancelBonus');
    };
    LookAtTheStars.prototype.skipCard = function () {
        if (!this.checkAction('skipCard')) {
            return;
        }
        this.takeAction('skipCard');
    };
    LookAtTheStars.prototype.skipBonus = function () {
        if (!this.checkAction('skipBonus')) {
            return;
        }
        this.takeAction('skipBonus');
    };
    LookAtTheStars.prototype.confirmTurn = function () {
        if (!this.checkAction('confirmTurn')) {
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
        if (Number((_a = this.prefs[200]) === null || _a === void 0 ? void 0 : _a.value) === 2) {
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
            ['discardShape', ANIMATION_MS],
            ['newShape', ANIMATION_MS],
            ['placedLines', 1],
            ['placedShootingStar', 1],
            ['placedPlanet', 1],
            ['placedStar', 1],
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
        notifs.forEach(function (notif) {
            dojo.subscribe(notif[0], _this, "notif_".concat(notif[0]));
            _this.notifqueue.setSynchronous(notif[0], notif[1]);
        });
    };
    LookAtTheStars.prototype.notif_discardShape = function (notif) {
        this.slideToObjectAndDestroy("card-".concat(notif.args.card.id), 'topbar');
    };
    LookAtTheStars.prototype.notif_newShape = function (notif) {
        this.cards.createMoveOrUpdateCard(notif.args.card);
    };
    LookAtTheStars.prototype.notif_placedLines = function (notif) {
        this.getPlayerTable(notif.args.playerId).placeLines(notif.args.lines, ['round']);
    };
    LookAtTheStars.prototype.notif_placedShootingStar = function (notif) {
        this.getPlayerTable(notif.args.playerId).placeLines(notif.args.lines, ['round']);
        this.getPlayerTable(notif.args.playerId).placeShootingStarHead(notif.args.head, ['round']);
    };
    LookAtTheStars.prototype.notif_placedPlanet = function (notif) {
        this.getPlayerTable(notif.args.playerId).placeObject(notif.args.coordinates, 'planet', ['round', 'round-bonus']);
    };
    LookAtTheStars.prototype.notif_placedStar = function (notif) {
        this.getPlayerTable(notif.args.playerId).placeObject(notif.args.coordinates, 'star', ['round', 'round-bonus']);
    };
    LookAtTheStars.prototype.notif_cancelPlacedLines = function (notif) {
        this.getPlayerTable(notif.args.playerId).cancelPlacedLines();
    };
    LookAtTheStars.prototype.notif_cancelBonus = function (notif) {
        this.getPlayerTable(notif.args.playerId).cancelBonus();
    };
    LookAtTheStars.prototype.notif_day = function (notif) {
        var _this = this;
        this.day = notif.args.day;
        this.playersTables.forEach(function (playerTable) { return playerTable.setDay(_this.day); });
    };
    LookAtTheStars.prototype.notif_score = function (notif) {
        this.setPoints(notif.args.playerId, notif.args.score);
    };
    LookAtTheStars.prototype.notif_scoreConstellations = function (notif) {
        this.getPlayerTable(notif.args.playerId).setConstellationsScore(notif.args.checkedConstellations, notif.args.score);
    };
    LookAtTheStars.prototype.notif_scorePlanets = function (notif) {
        this.getPlayerTable(notif.args.playerId).setPlanetScore(notif.args.score);
    };
    LookAtTheStars.prototype.notif_scoreShootingStars = function (notif) {
        this.getPlayerTable(notif.args.playerId).setShootingStarsScore(notif.args.score);
    };
    LookAtTheStars.prototype.notif_scoreStar1 = function (notif) {
        this.getPlayerTable(notif.args.playerId).setStar1Score(notif.args.score);
    };
    LookAtTheStars.prototype.notif_scoreStar2 = function (notif) {
        this.getPlayerTable(notif.args.playerId).setStar2Score(notif.args.score);
    };
    /* This enable to inject translatable styled things to logs or action bar */
    /* @Override */
    LookAtTheStars.prototype.format_string_recursive = function (log, args) {
        var _a, _b;
        try {
            if (log && args && !args.processed) {
                ['points', 'scoring'].forEach(function (field) {
                    if (args[field] !== null && args[field] !== undefined && args[field][0] != '<') {
                        args[field] = "<strong>".concat(_(args[field]), "</strong>");
                    }
                });
                for (var property in args) {
                    if (((_b = (_a = args[property]) === null || _a === void 0 ? void 0 : _a.indexOf) === null || _b === void 0 ? void 0 : _b.call(_a, ']')) > 0) {
                        args[property] = formatTextIcons(_(args[property]));
                    }
                }
                log = formatTextIcons(_(log));
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
