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
            var oldType = Number(existingDiv.dataset.category);
            existingDiv.dataset.side = '' + side;
            if (!oldType && card.type) {
                this.setVisibleInformations(existingDiv, card);
            }
            else if (oldType && !card.type) {
                setTimeout(function () { return _this.removeVisibleInformations(existingDiv); }, 500); // so we don't change face while it is still visible
            }
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
            }
        }
    };
    Cards.prototype.setVisibleInformations = function (div, card) {
        div.dataset.type = '' + card.type;
        div.dataset.typeArg = '' + card.typeArg;
    };
    Cards.prototype.removeVisibleInformations = function (div) {
        div.removeAttribute('data-type');
        div.removeAttribute('data-type-arg');
    };
    return Cards;
}());
var TableCenter = /** @class */ (function () {
    function TableCenter(game, gamedatas) {
        var _this = this;
        this.game = game;
        this.gamedatas = gamedatas;
        this.pileCounters = [];
        [1, 2, 3].forEach(function (number) {
            dojo.place("\n            <div id=\"pile".concat(number, "-wrapper\" class=\"pile-wrapper\">\n             <div id=\"pile").concat(number, "\" class=\"pile\"></div>\n             <div id=\"pile").concat(number, "-counter\" class=\"pile-counter\"></div>\n            </div>    \n            "), "shapes");
            _this.pileCounters[number] = new ebg.counter();
            _this.pileCounters[number].create("pile".concat(number, "-counter"));
            _this.pileCounters[number].setValue(gamedatas["remainingCardsInDiscard".concat(number)]);
        });
        [1, 2].forEach(function (number) {
            dojo.place("\n            <div id=\"star".concat(number, "\" class=\"card\" data-index=\"").concat(gamedatas["star".concat(number)], "\">\n                <div class=\"icon-indicator\">\n                    <div class=\"icon star").concat(number == 2 ? 7 : 5, "\"></div>\n                </div>\n            </div> \n            "), "objectives");
        });
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
        this.game.setTooltip("star1", _('When you reproduce on your board the shape indicated by this card, earn the number of victory points indicated on that card at the end of the game.'));
        this.game.setTooltip("star2", _('When you reproduce on your board the shape indicated by this card, get an immediate bonus:') + '<br>' + this.getStar2Tooltip(gamedatas.star2));
        this.updateCounters();
    }
    TableCenter.prototype.updateCounters = function () {
        var _this = this;
        [1, 2, 3].forEach(function (number) {
            return _this.pileCounters[number].setValue(document.getElementById("pile".concat(number)).childElementCount);
        });
    };
    TableCenter.prototype.getStar2Tooltip = function (type) {
        switch (type) {
            case 0: return _('Draw a <strong>luminous aura</strong> on a star in an existing constellation. It is not possible to draw multiple luminous auras in the same constellation. From now on, you can’t add lines to this constellation. A luminous aura is worth 2 victory points at the end of the game.');
            case 1: return _('Draw a new <strong>planet</strong> on an unused star (that no line or object touches).');
            case 2: return _('Draw <strong>2 new stars</strong> in a space that does not contain any stars, respecting the position of the star grid. These stars can then be used to draw lines.');
            case 3: return _('Draw a <strong>line</strong> between 2 adjacent stars.');
            case 4: return _('Draw a <strong>galaxy</strong> that covers 2 unused stars that are adjacent horizontally. The galaxy must be adjacent to the constellation that earned the bonus. A galaxy earns 2 victory points at the end of the game');
            case 5: return _('Draw a <strong>black hole</strong> on an unused star. From now on, you cannot draw on the adjacent stars. At the end of the game, score 1 point for each unused star adjacent to the black hole. <strong>You can only draw one black hole per game</strong>');
            case 6: return _('Draw a <strong>nova</strong> on a star in an existing constellation. This constellation can now have 9 or 10 lines. As with a normal constellation, it will earn 1 point per line at the end of the game. As usual, if several constellations have the same number of lines, only one of them will score victory points.');
            case 7: return _('Draw a <strong>twinkling star</strong> on an unused star. A twinkling star earns 3 victory points if it is adjacent to exactly 2 constellations at the end of the game.');
            case 8: return _('Draw a <strong>crescent moon</strong> on an unused star. Each constellation which has at least 1 star in a vertical or horizontal alignment with the crescent moon scores 1 additional victory point at the end of the game. <strong>You can only draw one crescent moon per game.</strong>');
        }
    };
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
        var html = "\n        <div id=\"player-table-".concat(this.playerId, "\" class=\"player-table\" data-type=\"").concat(player.sheetType, "\">\n            <div id=\"player-table-").concat(this.playerId, "-main\" class=\"main\">\n                <div id=\"player-table-").concat(this.playerId, "-svg\" class=\"svg-wrapper\">").concat(this.makeSVG(), "</div>\n                <div id=\"player-table-").concat(this.playerId, "-day\" class=\"day\" data-level=\"").concat(this.game.day, "\">\n                </div>\n            </div>\n            <div class=\"name-background\" style=\"background: #").concat(player.color, ";\"></div>\n            <div class=\"name\" style=\"color: #").concat(player.color, ";\">\n                <span>").concat(player.name, "</span>\n            </div>\n\n            <div class=\"checkedConstellations\">");
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
        this.setConstellationsCounters(player.currentConstellations);
        if (player.playerScore) {
            this.setConstellationsScore(player.playerScore.checkedConstellations, player.playerScore.constellations);
            this.setPlanetScore(player.playerScore.planets);
            this.setShootingStarsScore(player.playerScore.shootingStars);
            this.setStar1Score(player.playerScore.star1);
            this.setStar2Score(player.playerScore.star2);
            this.setFinalScore(player.playerScore.total);
        }
        /*const infos = this.game.getSheetTooltipInfos(Number(player.sheetType));
        html = `<div>
            <strong>${infos.title}</strong><br><br>
            ${infos.description}
        </div>`;
        this.game.setTooltip(`player-table-${this.playerId}-main`, html);*/
    }
    PlayerTable.prototype.setConstellationsCounters = function (constellations) {
        var _this = this;
        var oldCounters = Array.from(document.getElementById("player-table-".concat(this.playerId, "-main")).getElementsByClassName('constellation-counter'));
        oldCounters.forEach(function (oldLine) { var _a; return (_a = oldLine.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(oldLine); });
        constellations.forEach(function (constellation) {
            var counterId = "constellation-counter-".concat(_this.playerId, "-").concat(constellation.key);
            var xCoordinate = parseInt(constellation.key[0], 16);
            var yCoordinate = parseInt(constellation.key[1], 16);
            var c1 = {
                x: 554 - (SVG_LEFT_MARGIN + (xCoordinate * SVG_LINE_WIDTH)),
                y: SVG_BOTTOM_MARGIN - (yCoordinate * SVG_LINE_HEIGHT) - 17,
            };
            var newCounter = document.createElement('div');
            newCounter.setAttribute('id', counterId);
            newCounter.setAttribute('style', "right: ".concat(c1.x, "px; top: ").concat(c1.y, "px;"));
            newCounter.classList.add('constellation-counter');
            newCounter.innerText = '' + constellation.lines.length;
            $("player-table-".concat(_this.playerId, "-main")).append(newCounter);
        });
    };
    PlayerTable.prototype.onKeyPress = function (event) {
        if (['TEXTAREA', 'INPUT'].includes(event.target.nodeName) || !this.game.isCurrentPlayerActive()) {
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
                                if (document.getElementById('placeShootingStar_button')) {
                                    this.game.placeShootingStar();
                                }
                                else {
                                    this.game.placeShape();
                                }
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
        else if (this.game.getPrivateGameStateName() === 'confirmTurn') {
            switch (event.key) { // event.keyCode
                case 'Enter': // 13
                    this.game.confirmTurn();
                    event.stopImmediatePropagation();
                    event.preventDefault();
                    break;
                case 'Escape': // 27
                    this.game.cancelPlaceShape();
                    event.stopImmediatePropagation();
                    event.preventDefault();
                    break;
            }
        }
    };
    PlayerTable.prototype.placeInitialObjects = function (objects, classes) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        if (classes === void 0) { classes = []; }
        (_a = objects.shootingStars) === null || _a === void 0 ? void 0 : _a.forEach(function (shootingStar) {
            _this.placeLines(shootingStar.lines, classes);
            _this.placeShootingStarHeadStr(shootingStar.head, classes);
        });
        (_b = objects.planets) === null || _b === void 0 ? void 0 : _b.forEach(function (object) { return _this.placeObject(object, 'planet', classes); });
        (_c = objects.stars) === null || _c === void 0 ? void 0 : _c.forEach(function (object) { return _this.placeObject(object, 'star', classes); });
        (_d = objects.blackHoles) === null || _d === void 0 ? void 0 : _d.forEach(function (object) { return _this.placeObject(object, 'black-hole', classes); });
        (_e = objects.crescentMoons) === null || _e === void 0 ? void 0 : _e.forEach(function (object) { return _this.placeObject(object, 'crescent-moon', classes); });
        (_f = objects.galaxies) === null || _f === void 0 ? void 0 : _f.forEach(function (object) { return _this.placeObject(object, 'galaxy', classes); });
        (_g = objects.twinklingStars) === null || _g === void 0 ? void 0 : _g.forEach(function (object) { return _this.placeObject(object, 'twinkling-star', classes); });
        (_h = objects.novas) === null || _h === void 0 ? void 0 : _h.forEach(function (object) { return _this.placeObject(object, 'nova', classes); });
        (_j = objects.luminousAuras) === null || _j === void 0 ? void 0 : _j.forEach(function (object) { return _this.placeObject(object, 'luminous-aura', classes); });
    };
    PlayerTable.prototype.setDay = function (day) {
        document.getElementById("player-table-".concat(this.playerId, "-day")).dataset.level = '' + day;
    };
    PlayerTable.prototype.makeSVG = function () {
        return "\n        <svg viewBox=\"0 0 546 612\" preserveAspectRatio=\"none\"> \n            <g id=\"lats-svg-".concat(this.playerId, "\">\n                <line x1=\"0\" y1=\"0\" x2=\"0\" y2=\"0\"  stroke=\"red\" stroke-width=\"1\" stroke-opacity=\"1\"></line>\n            </g>\n        </svg>");
    };
    PlayerTable.prototype.placeLines = function (lines, additionalClass) {
        var _this = this;
        if (additionalClass === void 0) { additionalClass = []; }
        lines.forEach(function (line) { return _this.placeLine(line, parseInt(line[0], 16), parseInt(line[1], 16), parseInt(line[2], 16), parseInt(line[3], 16), additionalClass); });
    };
    PlayerTable.prototype.placeShootingStarHeadStr = function (coordinates, additionalClass) {
        if (additionalClass === void 0) { additionalClass = []; }
        this.placeShootingStarHead([parseInt(coordinates[0], 16), parseInt(coordinates[1], 16),], additionalClass);
    };
    PlayerTable.prototype.placeShootingStarHead = function (coordinates, additionalClass) {
        var _a;
        if (additionalClass === void 0) { additionalClass = []; }
        var lineid = "shooting-star-head-".concat(this.playerId, "-").concat(JSON.stringify(coordinates));
        var xCoordinate = coordinates[0];
        var yCoordinate = coordinates[1];
        var x = SVG_LEFT_MARGIN + xCoordinate * SVG_LINE_WIDTH;
        var y = SVG_BOTTOM_MARGIN - yCoordinate * SVG_LINE_HEIGHT;
        var newObject = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        newObject.setAttribute('id', lineid);
        newObject.setAttribute('x', "".concat(x - 20));
        newObject.setAttribute('y', "".concat(y - 20));
        newObject.setAttribute('width', "40");
        newObject.setAttribute('height', "40");
        newObject.setAttribute('href', "".concat(g_gamethemeurl, "img/shooting-star-head.png"));
        (_a = newObject.classList).add.apply(_a, __spreadArray(['line'], additionalClass, false));
        document.getElementById('lats-svg-' + this.playerId).after(newObject);
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
        newObject.setAttribute('x', "".concat(type == 'galaxy' ? x - 3 : x - 20));
        newObject.setAttribute('y', "".concat(y - 20));
        newObject.setAttribute('width', "".concat(type == 'galaxy' ? 60 : 40));
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
        var positionKey = JSON.stringify([this.shapeX, this.shapeY]);
        return possiblePositions[positionKey].includes(this.shapeRotation);
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
        var rotatedLines = lines.map(function (line) { return [
            [Number.parseInt(line[0], 16), Number.parseInt(line[1], 16),],
            [Number.parseInt(line[2], 16), Number.parseInt(line[3], 16),],
        ]; });
        if (this.shapeRotation == 1 || this.shapeRotation == 3) {
            // rotate 90°
            rotatedLines = rotatedLines.map(function (line) { return [
                [line[0][1], 3 - line[0][0],],
                [line[1][1], 3 - line[1][0],],
            ]; });
        }
        if (this.shapeRotation == 2 || this.shapeRotation == 3) {
            // rotate 180°
            rotatedLines = rotatedLines.map(function (line) { return [
                [3 - line[0][0], 3 - line[0][1],],
                [3 - line[1][0], 3 - line[1][1],],
            ]; });
        }
        var rotatedAndShiftedLines = rotatedLines.map(function (line) { return [
            [line[0][0] + _this.shapeX, line[0][1] + _this.shapeY,],
            [line[1][0] + _this.shapeX, line[1][1] + _this.shapeY,],
        ]; });
        return rotatedAndShiftedLines;
    };
    ;
    PlayerTable.prototype.getRotatedAndShiftedCoordinates = function (coordinates) {
        var rotatedCoordinates = [Number.parseInt(coordinates[0], 16), Number.parseInt(coordinates[1], 16),];
        if (this.shapeRotation == 1 || this.shapeRotation == 3) {
            // rotate 90°
            rotatedCoordinates = [rotatedCoordinates[1], 3 - rotatedCoordinates[0],];
        }
        if (this.shapeRotation == 2 || this.shapeRotation == 3) {
            // rotate 180°
            rotatedCoordinates = [3 - rotatedCoordinates[0], 3 - rotatedCoordinates[1],];
        }
        var rotatedAndShiftedCoordinates = [rotatedCoordinates[0] + this.shapeX, rotatedCoordinates[1] + this.shapeY];
        return rotatedAndShiftedCoordinates;
    };
    ;
    PlayerTable.prototype.moveShape = function () {
        var _this = this;
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
        rotatedAndShiftedLines.forEach(function (line) { return _this.placeLine(JSON.stringify(line), line[0][0], line[0][1], line[1][0], line[1][1], ['temp-line', validClass]); });
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
        if (this.shapeX <= -2) {
            return;
        }
        this.shapeX--;
        this.moveShape();
    };
    PlayerTable.prototype.moveShapeRight = function () {
        if (this.shapeX >= 8) {
            return;
        }
        this.shapeX++;
        this.moveShape();
    };
    PlayerTable.prototype.moveShapeBottom = function () {
        if (this.shapeY <= -2 + (this.game.day * 2)) {
            return;
        }
        this.shapeY--;
        this.moveShape();
    };
    PlayerTable.prototype.moveShapeTop = function () {
        if (this.shapeY >= 9) {
            return;
        }
        this.shapeY++;
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
            document.getElementById("player-table-".concat(this.playerId, "-constellation").concat(i)).innerHTML = checkedConstellations.includes(i) ? '.' : '';
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
    PlayerTable.prototype.setStarSelection = function (possibleCoordinates, placeFunction, specialType) {
        var _this = this;
        if (specialType === void 0) { specialType = null; }
        possibleCoordinates.forEach(function (possibleCoordinate) {
            var xCoordinate = parseInt(possibleCoordinate[0], 16);
            var yCoordinate = parseInt(possibleCoordinate[1], 16);
            var x = SVG_LEFT_MARGIN + xCoordinate * SVG_LINE_WIDTH;
            var y = SVG_BOTTOM_MARGIN - yCoordinate * SVG_LINE_HEIGHT;
            var circle = null;
            if (specialType === 'galaxy') {
                circle = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
                circle.setAttribute('id', 'possible-coordinates-' + possibleCoordinate);
                circle.setAttribute('cx', "".concat(x + (SVG_LINE_WIDTH / 2)));
                circle.setAttribute('cy', "".concat(y));
                circle.setAttribute('rx', "".concat(SVG_LINE_WIDTH / 2));
                circle.setAttribute('ry', "10");
            }
            else {
                circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('id', 'possible-coordinates-' + possibleCoordinate);
                circle.setAttribute('cx', "".concat(x));
                circle.setAttribute('cy', "".concat(y));
                circle.setAttribute('r', "10");
            }
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
var SCORE_MS = 1500;
var ZOOM_LEVELS = [0.5, 0.625, 0.75, 0.875, 1];
var ZOOM_LEVELS_MARGIN = [-100, -60, -33, -14, 0];
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
        this.addHelp();
        document.getElementById('zoom-out').addEventListener('click', function () { return _this.zoomOut(); });
        document.getElementById('zoom-in').addEventListener('click', function () { return _this.zoomIn(); });
        if (this.zoom !== 1) {
            this.setZoom(this.zoom);
        }
        if (Number(gamedatas.gamestate.id) >= 90) { // score or end
            this.onEnteringShowScore();
        }
        this.onScreenWidthChange = function () {
            _this.updateTableHeight();
        };
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
            case 'placeBlackHole':
                this.onEnteringStarSelection(args.args, function (x, y) { return _this.placeBlackHole(x, y); });
                break;
            case 'placeCrescentMoon':
                this.onEnteringStarSelection(args.args, function (x, y) { return _this.placeCrescentMoon(x, y); });
                break;
            case 'placeGalaxy':
                this.onEnteringStarSelection(args.args, function (x, y) { return _this.placeGalaxy(x, y); }, 'galaxy');
                break;
            case 'placeTwinklingStar':
                this.onEnteringStarSelection(args.args, function (x, y) { return _this.placeTwinklingStar(x, y); });
                break;
            case 'placeNova':
                this.onEnteringStarSelection(args.args, function (x, y) { return _this.placeNova(x, y); });
                break;
            case 'placeLuminousAura':
                this.onEnteringStarSelection(args.args, function (x, y) { return _this.placeLuminousAura(x, y); });
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
        document.getElementById("card-".concat(args.currentCard.id)).classList.add('highlight-current-shape');
    };
    LookAtTheStars.prototype.onEnteringBonus = function () {
        document.getElementById('star2').classList.add('highlight-objective');
    };
    LookAtTheStars.prototype.onEnteringPlaceLine = function (args) {
        var _a;
        (_a = this.getCurrentPlayerTable()) === null || _a === void 0 ? void 0 : _a.setLineToPlace(args.possibleLines);
        this.onEnteringBonus();
    };
    LookAtTheStars.prototype.onEnteringStarSelection = function (args, placeFunction, specialType) {
        var _a;
        if (specialType === void 0) { specialType = null; }
        (_a = this.getCurrentPlayerTable()) === null || _a === void 0 ? void 0 : _a.setStarSelection(args.possibleCoordinates, placeFunction, specialType);
        this.onEnteringBonus();
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
            case 'placeBlackHole':
            case 'placeCrescentMoon':
            case 'placeGalaxy':
            case 'placeTwinklingStar':
            case 'placeNova':
            case 'placeLuminousAura':
                this.onLeavingStarSelection();
                break;
        }
    };
    LookAtTheStars.prototype.onLeavingPlaceShape = function () {
        var _a, _b;
        (_a = this.getCurrentPlayerTable()) === null || _a === void 0 ? void 0 : _a.removeShapeToPlace();
        (_b = document.querySelector(".highlight-current-shape")) === null || _b === void 0 ? void 0 : _b.classList.remove('highlight-current-shape');
    };
    LookAtTheStars.prototype.onLeavingBonus = function () {
        document.getElementById('star2').classList.remove('highlight-objective');
    };
    LookAtTheStars.prototype.onLeavingPlaceLine = function () {
        var _a;
        (_a = this.getCurrentPlayerTable()) === null || _a === void 0 ? void 0 : _a.removeLineToPlace();
        this.onLeavingBonus();
    };
    LookAtTheStars.prototype.onLeavingStarSelection = function () {
        var _a;
        (_a = this.getCurrentPlayerTable()) === null || _a === void 0 ? void 0 : _a.removeStarSelection();
        this.onLeavingBonus();
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
                case 'placeStar':
                case 'placeBlackHole':
                case 'placeCrescentMoon':
                case 'placeGalaxy':
                case 'placeTwinklingStar':
                case 'placeNova':
                case 'placeLuminousAura':
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
    LookAtTheStars.prototype.getPrivateGameStateName = function () {
        var _a;
        return (_a = this.gamedatas.gamestate.private_state) === null || _a === void 0 ? void 0 : _a.name;
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
        this.updateTableHeight();
    };
    LookAtTheStars.prototype.updateTableHeight = function () {
        document.getElementById('zoom-wrapper').style.height = "".concat(document.getElementById('full-table').getBoundingClientRect().height, "px");
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
            document.getElementById('preference_control_299').closest(".preference_choice").style.display = 'none';
        }
        catch (e) { }
    };
    LookAtTheStars.prototype.onPreferenceChange = function (prefId, prefValue) {
        switch (prefId) {
            case 201:
                document.getElementsByTagName('html')[0].dataset.noCounter = (prefValue == 2).toString();
                break;
            case 299:
                this.toggleKeysNotice(prefValue == 1);
                break;
        }
    };
    LookAtTheStars.prototype.toggleKeysNotice = function (visible) {
        var elem = document.getElementById('keys-notice');
        if (visible) {
            if (!elem) {
                var table = this.getCurrentPlayerTable();
                if (table) {
                    dojo.place("\n                    <div id=\"keys-notice\">\n                        ".concat(_("If you have a keyboard, you can use Arrows to move the shape, Space to turn it, and Enter to validate."), "\n                        <div style=\"text-align: center; margin-top: 10px;\"><a id=\"hide-keys-notice\">").concat(_("Got it!"), "</a></div>\n                    </div>\n                    "), "player-table-".concat(table.playerId));
                    document.getElementById('hide-keys-notice').addEventListener('click', function () {
                        var select = document.getElementById('preference_control_299');
                        select.value = '2';
                        var event = new Event('change');
                        select.dispatchEvent(event);
                    });
                }
            }
        }
        else if (elem) {
            elem.parentElement.removeChild(elem);
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
    LookAtTheStars.prototype.addHelp = function () {
        var _this = this;
        dojo.place("\n            <button id=\"lookatthestars-help-button\">?</button>\n        ", 'left-side');
        document.getElementById('lookatthestars-help-button').addEventListener('click', function () { return _this.showHelp(); });
    };
    LookAtTheStars.prototype.getStar2Help = function (types) {
        var _this = this;
        return types.map(function (type) { return "\n        <div class=\"help-section\">\n            <div class=\"help-star2\" data-index=\"".concat(type, "\"></div>\n            <div>").concat(_this.tableCenter.getStar2Tooltip(type), "</div>\n        </div>\n        "); }).join('');
    };
    LookAtTheStars.prototype.getSheetTooltipInfos = function (sheetType) {
        var title = "";
        var description = "";
        switch (sheetType + 1) {
            case 1:
                title = _("SOUTHERN AFRICA");
                description = _(" \u2726 For the Tswana and Sotho, <strong>Dithutlwa</strong> (the giraffes) are represented by the stars of the Southern Cross.  \u2726 For the San, Aldebaran and Betelgeuse are known as the <strong>male and female hartebeest</strong>.");
                break;
            case 2:
                title = _("CHINA");
                description = _(" \u2726 <strong>Tshang-Lung</strong>, the blue dragon, is associated with the East and spring. Its appearance in the sky marked the beginning of the spring rains. \u2726 <strong>Tchou-Niao</strong>, the red bird, associated with the South and summer, is represented as a hybrid of birds, a quail, or a phoenix.");
                break;
            case 3:
                title = _("ANCIENT EGYPT");
                description = _(" \u2726 The constellations of the <strong>Ibis</strong> and the <strong>Scarab</strong> would correspond to Cancer and Sagittarius. \u2726 The scarab is the symbol of the god Khepri who was believed to roll the disk of the sun across the sky. \u2726 The sacred ibis is associated with Thoth, god of wisdom and writing.");
                break;
            case 4:
                title = _("ANCIENT GREECE");
                description = _(" \u2726 The elongated shape of the <strong>Hydra female</strong> constellation represents the giant snake that Hercules faced during one of his twelve labors. \u2726 The <strong>Lyre</strong> allowed Orpheus to charm the creatures of the Underworld.");
                break;
            case 5:
                title = _("INDIA");
                description = _(" \u2726 <strong>Kalaparusha (or Prajapati)</strong> was transformed into a deer for being cruel to his daughter. The Belt of Orion represents the arrow that pierced him. \u2726 The couple <strong>Soma and Vishnu</strong>, with the lyre and the club of knowledge, are associated with the duos sun/moon and day/night.");
                break;
            case 6:
                title = _("INUITS");
                description = _(" \u2726 In Alaska, the Pleiades represent a red fox. Its Inuit name is <strong>Kaguyagat</strong>. \u2726 The Big Dipper is known as <strong>Tukturjuit</strong>, the caribou.");
                break;
            case 7:
                title = _("NAVAJO");
                description = _(" \u2726 <strong>Ma\u2019ii Biz\u00F2\u2018</strong>, the Coyote Star, was placed by the god Coyote in the South, its twinkle visible to the Navajo at the winter solstice. \u2726 <strong>N\u00E1hook\u00F2s Bik\u00F2\u2018</strong>, the North Star, symbolizes the central fire of the hogan (Navajo home). It never moves and so brings stability and balance to the other stars.");
                break;
            case 8:
                title = _("POLYNESIANS");
                description = _(" \u2726 The demigod Maui is said to have raised the islands of Hawaii by pulling them up from the ocean floor with his magic hook, <strong>Ka Makau Nui o Maui</strong>. \u2726 <strong>N\u0101m\u0101hoe</strong>, the twins, is composed of N\u0101n\u0101 Mua, \"who looks forward\" (Castor), and N\u0101n\u0101 Hope, \"who looks back\" (Pollux).");
                break;
        }
        return { title: title, description: description };
    };
    LookAtTheStars.prototype.getConstellationsHelp = function (types) {
        var _this = this;
        return types.map(function (type) {
            var infos = _this.getSheetTooltipInfos(type);
            return "\n            <div class=\"constellation-section\">\n                <strong>".concat(infos.title, "</strong>\n                <span>").concat(infos.description, "</span>\n            </div>\n            ");
        }).join('');
    }; /*const infos = this.game.getSheetTooltipInfos(Number(player.sheetType));
    html = `<div>
        <strong>${infos.title}</strong><br><br>
        ${infos.description}
    </div>`;*/
    LookAtTheStars.prototype.showHelp = function () {
        var helpDialog = new ebg.popindialog();
        helpDialog.create('lookatthestarsHelpDialog');
        helpDialog.setTitle(_("Help"));
        var html = "\n        <div id=\"help-popin\">\n            <h1>".concat(_("Bonus cards"), "</h1>\n            <h2>").concat(_("Recommended for beginners"), "</h2>\n            ").concat(this.getStar2Help([1, 3, 2, 4, 7]), "\n            <h2>").concat(_("For experienced players"), "</h2>\n            ").concat(this.getStar2Help([6, 0, 8, 5]), "\n\n            <h1>").concat(_("Constellations"), "</h1>\n            ").concat(_("Here is a brief overview of the constellations that the illustrations on the game boards are loosely based on."), "\n            \n            ").concat(this.getConstellationsHelp([3, 2, 1, 0, 7, 6, 5, 4]), "\n        </div>\n        ");
        // Show the dialog
        helpDialog.setContent(html);
        helpDialog.show();
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
    LookAtTheStars.prototype.placeBlackHole = function (x, y) {
        if (!this.checkAction('placeBlackHole')) {
            return;
        }
        this.takeAction('placeBlackHole', { x: x, y: y });
    };
    LookAtTheStars.prototype.placeCrescentMoon = function (x, y) {
        if (!this.checkAction('placeCrescentMoon')) {
            return;
        }
        this.takeAction('placeCrescentMoon', { x: x, y: y });
    };
    LookAtTheStars.prototype.placeGalaxy = function (x, y) {
        if (!this.checkAction('placeGalaxy')) {
            return;
        }
        this.takeAction('placeGalaxy', { x: x, y: y });
    };
    LookAtTheStars.prototype.placeTwinklingStar = function (x, y) {
        if (!this.checkAction('placeTwinklingStar')) {
            return;
        }
        this.takeAction('placeTwinklingStar', { x: x, y: y });
    };
    LookAtTheStars.prototype.placeNova = function (x, y) {
        if (!this.checkAction('placeNova')) {
            return;
        }
        this.takeAction('placeNova', { x: x, y: y });
    };
    LookAtTheStars.prototype.placeLuminousAura = function (x, y) {
        if (!this.checkAction('placeLuminousAura')) {
            return;
        }
        this.takeAction('placeLuminousAura', { x: x, y: y });
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
        var liveScoring = this.gamedatas.liveScoring;
        var notifs = [
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
        notifs.forEach(function (notif) {
            dojo.subscribe(notif[0], _this, "notif_".concat(notif[0]));
            _this.notifqueue.setSynchronous(notif[0], notif[1]);
        });
    };
    LookAtTheStars.prototype.notif_discardShape = function (notif) {
        var _this = this;
        this.slideToObjectAndDestroy("card-".concat(notif.args.card.id), 'topbar');
        setTimeout(function () { return _this.tableCenter.updateCounters(); }, 600);
    };
    LookAtTheStars.prototype.notif_newShape = function (notif) {
        this.cards.createMoveOrUpdateCard(notif.args.card);
    };
    LookAtTheStars.prototype.notif_placedLines = function (notif) {
        var playerTable = this.getPlayerTable(notif.args.playerId);
        playerTable.placeLines(notif.args.lines, notif.args.bonus ? ['round', 'round-bonus'] : ['round']);
        playerTable.setConstellationsCounters(notif.args.currentConstellations);
    };
    LookAtTheStars.prototype.notif_placedShootingStar = function (notif) {
        this.getPlayerTable(notif.args.playerId).placeLines(notif.args.lines, ['round']);
        this.getPlayerTable(notif.args.playerId).placeShootingStarHeadStr(notif.args.head, ['round']);
    };
    LookAtTheStars.prototype.notif_placedPlanet = function (notif) {
        this.getPlayerTable(notif.args.playerId).placeObject(notif.args.coordinates, 'planet', ['round', 'round-bonus']);
    };
    LookAtTheStars.prototype.notif_placedStar = function (notif) {
        this.getPlayerTable(notif.args.playerId).placeObject(notif.args.coordinates, 'star', ['round', 'round-bonus']);
    };
    LookAtTheStars.prototype.notif_placedBlackHole = function (notif) {
        this.getPlayerTable(notif.args.playerId).placeObject(notif.args.coordinates, 'black-hole', ['round', 'round-bonus']);
    };
    LookAtTheStars.prototype.notif_placedCrescentMoon = function (notif) {
        this.getPlayerTable(notif.args.playerId).placeObject(notif.args.coordinates, 'crescent-moon', ['round', 'round-bonus']);
    };
    LookAtTheStars.prototype.notif_placedGalaxy = function (notif) {
        this.getPlayerTable(notif.args.playerId).placeObject(notif.args.coordinates, 'galaxy', ['round', 'round-bonus']);
    };
    LookAtTheStars.prototype.notif_placedTwinklingStar = function (notif) {
        this.getPlayerTable(notif.args.playerId).placeObject(notif.args.coordinates, 'twinkling-star', ['round', 'round-bonus']);
    };
    LookAtTheStars.prototype.notif_placedNova = function (notif) {
        this.getPlayerTable(notif.args.playerId).placeObject(notif.args.coordinates, 'nova', ['round', 'round-bonus']);
    };
    LookAtTheStars.prototype.notif_placedLuminousAura = function (notif) {
        this.getPlayerTable(notif.args.playerId).placeObject(notif.args.coordinates, 'luminous-aura', ['round', 'round-bonus']);
    };
    LookAtTheStars.prototype.notif_cancelPlacedLines = function (notif) {
        var playerTable = this.getPlayerTable(notif.args.playerId);
        playerTable.cancelPlacedLines();
        playerTable.setConstellationsCounters(notif.args.currentConstellations);
    };
    LookAtTheStars.prototype.notif_cancelBonus = function (notif) {
        var playerTable = this.getPlayerTable(notif.args.playerId);
        playerTable.cancelBonus();
        playerTable.setConstellationsCounters(notif.args.currentConstellations);
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
    LookAtTheStars.prototype.notif_liveScore = function (notif) {
        var playerTable = this.getPlayerTable(notif.args.playerId);
        var playerScore = notif.args.playerScore;
        playerTable.setConstellationsScore(playerScore.checkedConstellations, playerScore.constellations);
        playerTable.setPlanetScore(playerScore.planets);
        playerTable.setShootingStarsScore(playerScore.shootingStars);
        playerTable.setStar1Score(playerScore.star1);
        playerTable.setStar2Score(playerScore.star1);
        playerTable.setFinalScore(playerScore.total);
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
