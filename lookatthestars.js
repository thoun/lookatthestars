function slideToObjectAndAttach(game, object, destinationId, zoom) {
    if (zoom === void 0) { zoom = 1; }
    var destination = document.getElementById(destinationId);
    if (destination.contains(object)) {
        return Promise.resolve(true);
    }
    return new Promise(function (resolve) {
        var originalZIndex = Number(object.style.zIndex);
        object.style.zIndex = '10';
        var objectCR = object.getBoundingClientRect();
        var destinationCR = destination.getBoundingClientRect();
        var deltaX = destinationCR.left - objectCR.left;
        var deltaY = destinationCR.top - objectCR.top;
        var attachToNewParent = function () {
            object.style.top = 'unset';
            object.style.left = 'unset';
            object.style.position = 'relative';
            object.style.zIndex = originalZIndex ? '' + originalZIndex : 'unset';
            object.style.transform = 'unset';
            object.style.transition = 'unset';
            destination.appendChild(object);
        };
        if (document.visibilityState === 'hidden' || game.instantaneousMode) {
            // if tab is not visible, we skip animation (else they could be delayed or cancelled by browser)
            attachToNewParent();
        }
        else {
            object.style.transition = "transform 0.5s ease-in";
            object.style.transform = "translate(".concat(deltaX / zoom, "px, ").concat(deltaY / zoom, "px)");
            var securityTimeoutId_1 = null;
            var transitionend_1 = function () {
                attachToNewParent();
                object.removeEventListener('transitionend', transitionend_1);
                object.removeEventListener('transitioncancel', transitionend_1);
                resolve(true);
                if (securityTimeoutId_1) {
                    clearTimeout(securityTimeoutId_1);
                }
            };
            object.addEventListener('transitionend', transitionend_1);
            object.addEventListener('transitioncancel', transitionend_1);
            // security check : if transition fails, we force tile to destination
            securityTimeoutId_1 = setTimeout(function () {
                if (!destination.contains(object)) {
                    attachToNewParent();
                    object.removeEventListener('transitionend', transitionend_1);
                    object.removeEventListener('transitioncancel', transitionend_1);
                    resolve(true);
                }
            }, 700);
        }
    });
}
function slideToObjectTicketSlot2(game, object, destinationId, keepTransform) {
    var destination = document.getElementById(destinationId);
    if (destination.contains(object)) {
        return Promise.resolve(true);
    }
    return new Promise(function (resolve) {
        var originalZIndex = Number(object.style.zIndex);
        object.style.zIndex = '10';
        var slot1left = Number(window.getComputedStyle(document.getElementById('ticket-slot-1')).left.match(/\d+/)[0]);
        var slot2left = Number(window.getComputedStyle(document.getElementById('ticket-slot-2')).left.match(/\d+/)[0]);
        var deltaX = slot2left - slot1left;
        var attachToNewParent = function () {
            object.style.zIndex = originalZIndex ? '' + originalZIndex : 'unset';
            object.style.transform = keepTransform !== null && keepTransform !== void 0 ? keepTransform : 'unset';
            object.style.transition = 'unset';
            destination.appendChild(object);
        };
        if (document.visibilityState === 'hidden' || game.instantaneousMode) {
            // if tab is not visible, we skip animation (else they could be delayed or cancelled by browser)
            attachToNewParent();
        }
        else {
            object.style.transition = "transform 0.5s ease-in";
            object.style.transform = "translateX(".concat(deltaX, "px) ").concat(keepTransform !== null && keepTransform !== void 0 ? keepTransform : '');
            var securityTimeoutId_2 = null;
            var transitionend_2 = function () {
                attachToNewParent();
                object.removeEventListener('transitionend', transitionend_2);
                object.removeEventListener('transitioncancel', transitionend_2);
                resolve(true);
                if (securityTimeoutId_2) {
                    clearTimeout(securityTimeoutId_2);
                }
            };
            object.addEventListener('transitionend', transitionend_2);
            object.addEventListener('transitioncancel', transitionend_2);
            // security check : if transition fails, we force tile to destination
            securityTimeoutId_2 = setTimeout(function () {
                if (!destination.contains(object)) {
                    attachToNewParent();
                    object.removeEventListener('transitionend', transitionend_2);
                    object.removeEventListener('transitioncancel', transitionend_2);
                    resolve(true);
                }
            }, 700);
        }
    });
}
var PlayerTableBlock = /** @class */ (function () {
    function PlayerTableBlock(playerId) {
        this.playerId = playerId;
    }
    PlayerTableBlock.prototype.setContentAndValidation = function (id, content, unvalidated) {
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
    return PlayerTableBlock;
}());
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var PlayerTableOldLadiesBlock = /** @class */ (function (_super) {
    __extends(PlayerTableOldLadiesBlock, _super);
    function PlayerTableOldLadiesBlock(playerId, scoreSheets, visibleScoring) {
        var _this = _super.call(this, playerId) || this;
        var html = "\n        <div id=\"old-ladies-block-".concat(playerId, "\" data-tooltip=\"[20]\" class=\"old-ladies block\" data-zone=\"2\">");
        for (var i = 1; i <= 8; i++) {
            html += "\n                <div id=\"player-table-".concat(playerId, "-old-ladies-checkmark").concat(i, "\" class=\"checkmark\" data-number=\"").concat(i, "\"></div>\n            ");
        }
        html += "        \n                    <div id=\"player-table-".concat(playerId, "-old-ladies-total\" class=\"total\"></div>\n                </div>\n        ");
        dojo.place(html, "player-table-".concat(playerId, "-main"));
        _this.updateScoreSheet(scoreSheets, visibleScoring);
        return _this;
    }
    PlayerTableOldLadiesBlock.prototype.updateScoreSheet = function (scoreSheets, visibleScoring) {
        var current = scoreSheets.current.oldLadies;
        var validated = scoreSheets.validated.oldLadies;
        for (var i = 1; i <= 8; i++) {
            this.setContentAndValidation("old-ladies-checkmark".concat(i), current.checked >= i ? '✔' : '', current.checked >= i && validated.checked < i);
        }
        if (visibleScoring) {
            this.setContentAndValidation("old-ladies-total", current.total, current.total !== validated.total);
        }
    };
    return PlayerTableOldLadiesBlock;
}(PlayerTableBlock));
var PlayerTableStudentsBlock = /** @class */ (function (_super) {
    __extends(PlayerTableStudentsBlock, _super);
    function PlayerTableStudentsBlock(playerId, scoreSheets, visibleScoring) {
        var _this = _super.call(this, playerId) || this;
        var html = "\n        <div id=\"students-block-".concat(playerId, "\" data-tooltip=\"[30,32]\" class=\"students block\" data-zone=\"3\">\n                ");
        for (var i = 1; i <= 6; i++) {
            html += "\n                    <div id=\"player-table-".concat(playerId, "-students-checkmark").concat(i, "\" class=\"students checkmark\" data-number=\"").concat(i, "\"></div>");
        }
        for (var i = 1; i <= 3; i++) {
            html += "\n                    <div id=\"player-table-".concat(playerId, "-internships-checkmark").concat(i, "\" class=\"internships checkmark\" data-number=\"").concat(i, "\"></div>");
        }
        for (var i = 1; i <= 4; i++) {
            html += "\n                    <div id=\"player-table-".concat(playerId, "-schools-checkmark").concat(i, "\" class=\"schools checkmark\" data-number=\"").concat(i, "\"></div>");
        }
        html += "\n                    <div id=\"player-table-".concat(playerId, "-students-special\" class=\"special\"></div>\n                    <div id=\"player-table-").concat(playerId, "-students-subtotal\" class=\"subtotal\"></div>\n                    <div id=\"player-table-").concat(playerId, "-students-total\" class=\"total\"></div>\n                </div>\n        ");
        dojo.place(html, "player-table-".concat(playerId, "-main"));
        _this.updateScoreSheet(scoreSheets, visibleScoring);
        return _this;
    }
    PlayerTableStudentsBlock.prototype.updateScoreSheet = function (scoreSheets, visibleScoring) {
        var current = scoreSheets.current.students;
        var validated = scoreSheets.validated.students;
        for (var i = 1; i <= 6; i++) {
            this.setContentAndValidation("students-checkmark".concat(i), current.checkedStudents >= i ? '✔' : '', current.checkedStudents >= i && validated.checkedStudents < i);
        }
        for (var i = 1; i <= 3; i++) {
            this.setContentAndValidation("internships-checkmark".concat(i), current.checkedInternships >= i ? '✔' : '', current.checkedInternships >= i && validated.checkedInternships < i);
        }
        for (var i = 1; i <= 4; i++) {
            this.setContentAndValidation("schools-checkmark".concat(i), current.checkedSchools >= i ? '✔' : '', current.checkedSchools >= i && validated.checkedSchools < i);
        }
        this.setContentAndValidation("students-special", current.specialSchool, current.specialSchool !== validated.specialSchool);
        if (visibleScoring) {
            this.setContentAndValidation("students-subtotal", current.subTotal, current.subTotal !== validated.subTotal);
            this.setContentAndValidation("students-total", current.total, current.total !== validated.total);
        }
    };
    return PlayerTableStudentsBlock;
}(PlayerTableBlock));
var PlayerTableTouristsBlock = /** @class */ (function (_super) {
    __extends(PlayerTableTouristsBlock, _super);
    function PlayerTableTouristsBlock(playerId, scoreSheets, visibleScoring) {
        var _this = _super.call(this, playerId) || this;
        var html = "\n        <div id=\"tourists-block-".concat(playerId, "\" data-tooltip=\"[40,41]\" class=\"tourists block\" data-zone=\"4\">");
        for (var i = 1; i <= 3; i++) {
            html += "\n                    <div id=\"player-table-".concat(playerId, "-tourists-light-checkmark").concat(i, "\" class=\"monument light checkmark\" data-number=\"").concat(i, "\"></div>");
        }
        for (var i = 1; i <= 3; i++) {
            html += "\n                    <div id=\"player-table-".concat(playerId, "-tourists-dark-checkmark").concat(i, "\" class=\"monument dark checkmark\" data-number=\"").concat(i, "\"></div>");
        }
        html += "\n                    <div id=\"player-table-".concat(playerId, "-tourists-specialLight\" class=\"special\" data-style=\"Light\"></div>\n                    <div id=\"player-table-").concat(playerId, "-tourists-specialDark\" class=\"special\" data-style=\"Dark\"></div>\n                    <div id=\"player-table-").concat(playerId, "-tourists-specialMax\" class=\"special\"></div>");
        for (var row = 1; row <= 3; row++) {
            for (var i = 1; i <= 4; i++) {
                html += "\n                        <div id=\"player-table-".concat(playerId, "-tourists-checkmark").concat(row, "-").concat(i, "\" class=\"tourists checkmark\" data-row=\"").concat(row, "\" data-number=\"").concat(i, "\"></div>");
            }
        }
        html += " \n                    <div id=\"player-table-".concat(playerId, "-tourists-subtotal1\" class=\"subtotal\" data-number=\"1\"></div>\n                    <div id=\"player-table-").concat(playerId, "-tourists-subtotal2\" class=\"subtotal\" data-number=\"2\"></div>\n                    <div id=\"player-table-").concat(playerId, "-tourists-subtotal3\" class=\"subtotal\" data-number=\"3\"></div>\n                    <div id=\"player-table-").concat(playerId, "-tourists-total\" class=\"total\"></div>\n                </div>\n        ");
        dojo.place(html, "player-table-".concat(playerId, "-main"));
        _this.updateScoreSheet(scoreSheets, visibleScoring);
        return _this;
    }
    PlayerTableTouristsBlock.prototype.updateScoreSheet = function (scoreSheets, visibleScoring) {
        var current = scoreSheets.current.tourists;
        var validated = scoreSheets.validated.tourists;
        for (var i = 1; i <= 3; i++) {
            this.setContentAndValidation("tourists-light-checkmark".concat(i), current.checkedMonumentsLight >= i ? '✔' : '', current.checkedMonumentsLight >= i && validated.checkedMonumentsLight < i);
        }
        for (var i = 1; i <= 3; i++) {
            this.setContentAndValidation("tourists-dark-checkmark".concat(i), current.checkedMonumentsDark >= i ? '✔' : '', current.checkedMonumentsDark >= i && validated.checkedMonumentsDark < i);
        }
        this.setContentAndValidation("tourists-specialLight", current.specialMonumentLight, current.specialMonumentLight !== validated.specialMonumentLight);
        this.setContentAndValidation("tourists-specialDark", current.specialMonumentDark, current.specialMonumentDark !== validated.specialMonumentDark);
        if (visibleScoring) {
            this.setContentAndValidation("tourists-specialMax", current.specialMonumentMax, current.specialMonumentMax !== validated.specialMonumentMax);
        }
        for (var row = 1; row <= 3; row++) {
            for (var i = 1; i <= 4; i++) {
                this.setContentAndValidation("tourists-checkmark".concat(row, "-").concat(i), current.checkedTourists[row - 1] >= i ? '✔' : (current.subTotals[row - 1] ? '⎯⎯' : ''), current.checkedTourists[row - 1] >= i && validated.checkedTourists[row - 1] < i);
            }
            this.setContentAndValidation("tourists-subtotal".concat(row), current.subTotals[row - 1], current.subTotals[row - 1] != validated.subTotals[row - 1]);
        }
        if (visibleScoring) {
            this.setContentAndValidation("tourists-total", current.total, current.total != validated.total);
        }
    };
    return PlayerTableTouristsBlock;
}(PlayerTableBlock));
var PlayerTableBusinessmenBlock = /** @class */ (function (_super) {
    __extends(PlayerTableBusinessmenBlock, _super);
    function PlayerTableBusinessmenBlock(playerId, scoreSheets, visibleScoring) {
        var _this = _super.call(this, playerId) || this;
        var html = "\n        <div id=\"businessmen-block-".concat(playerId, "\" data-tooltip=\"[50,51]\" class=\"businessmen block\" data-zone=\"5\">\n                    <div id=\"player-table-").concat(playerId, "-businessmen-special\" class=\"special\"></div>");
        for (var row = 1; row <= 3; row++) {
            for (var i = 1; i <= 3; i++) {
                html += "\n                        <div id=\"player-table-".concat(playerId, "-businessmen-checkmark").concat(row, "-").concat(i, "\" class=\"checkmark\" data-row=\"").concat(row, "\" data-number=\"").concat(i, "\"></div>");
            }
        }
        html += "\n                    <div id=\"player-table-".concat(playerId, "-businessmen-subtotal1\" class=\"subtotal\" data-number=\"1\"></div>\n                    <div id=\"player-table-").concat(playerId, "-businessmen-subtotal2\" class=\"subtotal\" data-number=\"2\"></div>\n                    <div id=\"player-table-").concat(playerId, "-businessmen-subtotal3\" class=\"subtotal\" data-number=\"3\"></div>\n                    <div id=\"player-table-").concat(playerId, "-businessmen-total\" class=\"total\"></div>\n                </div>\n        ");
        dojo.place(html, "player-table-".concat(playerId, "-main"));
        _this.updateScoreSheet(scoreSheets, visibleScoring);
        return _this;
    }
    PlayerTableBusinessmenBlock.prototype.updateScoreSheet = function (scoreSheets, visibleScoring) {
        var current = scoreSheets.current.businessmen;
        var validated = scoreSheets.validated.businessmen;
        this.setContentAndValidation("businessmen-special", current.specialOffice, current.specialOffice !== validated.specialOffice);
        for (var row = 1; row <= 3; row++) {
            for (var i = 1; i <= 3; i++) {
                this.setContentAndValidation("businessmen-checkmark".concat(row, "-").concat(i), current.checkedBusinessmen[row - 1] >= i ? '✔' : (current.subTotals[row - 1] ? '⎯⎯' : ''), current.checkedBusinessmen[row - 1] >= i && validated.checkedBusinessmen[row - 1] < i);
            }
            this.setContentAndValidation("businessmen-subtotal".concat(row), current.subTotals[row - 1], current.subTotals[row - 1] != validated.subTotals[row - 1]);
        }
        if (visibleScoring) {
            this.setContentAndValidation("businessmen-total", current.total, current.total != validated.total);
        }
    };
    return PlayerTableBusinessmenBlock;
}(PlayerTableBlock));
var PlayerTableCommonObjectivesBlock = /** @class */ (function (_super) {
    __extends(PlayerTableCommonObjectivesBlock, _super);
    function PlayerTableCommonObjectivesBlock(playerId, scoreSheets, visibleScoring) {
        var _this = _super.call(this, playerId) || this;
        var html = "\n        <div id=\"common-objectives-block-".concat(playerId, "\" data-tooltip=\"[90]\" class=\"common-objectives block\">\n            <div id=\"player-table-").concat(playerId, "-common-objectives-objective1\" class=\"subtotal\" data-number=\"1\"></div>\n            <div id=\"player-table-").concat(playerId, "-common-objectives-objective2\" class=\"subtotal\" data-number=\"2\"></div>\n            <div id=\"player-table-").concat(playerId, "-common-objectives-total\" class=\"total\"></div>\n        </div>\n        ");
        dojo.place(html, "player-table-".concat(playerId, "-main"));
        _this.updateScoreSheet(scoreSheets, visibleScoring);
        return _this;
    }
    PlayerTableCommonObjectivesBlock.prototype.updateScoreSheet = function (scoreSheets, visibleScoring) {
        var current = scoreSheets.current.commonObjectives;
        var validated = scoreSheets.validated.commonObjectives;
        for (var i = 1; i <= 2; i++) {
            this.setContentAndValidation("common-objectives-objective".concat(i), current.subTotals[i - 1], current.subTotals[i - 1] != validated.subTotals[i - 1]);
        }
        if (visibleScoring) {
            this.setContentAndValidation("common-objectives-total", current.total, current.total != validated.total);
        }
    };
    return PlayerTableCommonObjectivesBlock;
}(PlayerTableBlock));
var PlayerTablePersonalObjectiveBlock = /** @class */ (function (_super) {
    __extends(PlayerTablePersonalObjectiveBlock, _super);
    function PlayerTablePersonalObjectiveBlock(playerId, scoreSheets, visibleScoring) {
        var _this = _super.call(this, playerId) || this;
        var html = "\n        <div id=\"personal-objective-block-".concat(playerId, "\" data-tooltip=\"[91]\" class=\"personal-objective block\">\n            <div id=\"player-table-").concat(playerId, "-personal-objective-total\" class=\"total\"></div>\n        </div>\n        ");
        dojo.place(html, "player-table-".concat(playerId, "-main"));
        _this.updateScoreSheet(scoreSheets, visibleScoring);
        return _this;
    }
    PlayerTablePersonalObjectiveBlock.prototype.updateScoreSheet = function (scoreSheets, visibleScoring) {
        var current = scoreSheets.current.personalObjective;
        var validated = scoreSheets.validated.personalObjective;
        if (visibleScoring) {
            this.setContentAndValidation("personal-objective-total", current.total, current.total != validated.total);
        }
    };
    return PlayerTablePersonalObjectiveBlock;
}(PlayerTableBlock));
var PlayerTableTurnZonesBlock = /** @class */ (function (_super) {
    __extends(PlayerTableTurnZonesBlock, _super);
    function PlayerTableTurnZonesBlock(playerId, scoreSheets, visibleScoring) {
        var _this = _super.call(this, playerId) || this;
        var html = "\n        <div id=\"turn-zones-block-".concat(playerId, "\" data-tooltip=\"[92]\" class=\"turn-zones block\" data-zone=\"6\">");
        for (var i = 1; i <= 5; i++) {
            html += "\n                    <div id=\"player-table-".concat(playerId, "-turn-zones-checkmark").concat(i, "\" class=\"checkmark\" data-number=\"").concat(i, "\"></div>");
        }
        html += "\n                    <div id=\"player-table-".concat(playerId, "-turn-zones-total\" class=\"total\"></div>\n                </div>\n        ");
        dojo.place(html, "player-table-".concat(playerId, "-main"));
        _this.updateScoreSheet(scoreSheets, visibleScoring);
        return _this;
    }
    PlayerTableTurnZonesBlock.prototype.updateScoreSheet = function (scoreSheets, visibleScoring) {
        var current = scoreSheets.current.turnZones;
        var validated = scoreSheets.validated.turnZones;
        for (var i = 1; i <= 5; i++) {
            this.setContentAndValidation("turn-zones-checkmark".concat(i), current.checked >= i ? '✔' : '', current.checked >= i && validated.checked < i);
        }
        if (visibleScoring) {
            this.setContentAndValidation("turn-zones-total", -current.total, current.total !== validated.total);
        }
    };
    return PlayerTableTurnZonesBlock;
}(PlayerTableBlock));
var PlayerTableTrafficJamBlock = /** @class */ (function (_super) {
    __extends(PlayerTableTrafficJamBlock, _super);
    function PlayerTableTrafficJamBlock(playerId, scoreSheets, visibleScoring) {
        var _this = _super.call(this, playerId) || this;
        var html = "\n        <div id=\"traffic-jam-block-".concat(playerId, "\" data-tooltip=\"[93]\" class=\"traffic-jam block\" data-zone=\"7\">");
        for (var i = 1; i <= 19; i++) {
            html += "\n                    <div id=\"player-table-".concat(playerId, "-traffic-jam-checkmark").concat(i, "\" class=\"checkmark\" data-number=\"").concat(i, "\"></div>");
        }
        html += "\n                    <div id=\"player-table-".concat(playerId, "-traffic-jam-total\" class=\"total\"></div>\n                </div>\n        ");
        dojo.place(html, "player-table-".concat(playerId, "-main"));
        _this.updateScoreSheet(scoreSheets, visibleScoring);
        return _this;
    }
    PlayerTableTrafficJamBlock.prototype.updateScoreSheet = function (scoreSheets, visibleScoring) {
        var current = scoreSheets.current.trafficJam;
        var validated = scoreSheets.validated.trafficJam;
        for (var i = 1; i <= 19; i++) {
            this.setContentAndValidation("traffic-jam-checkmark".concat(i), current.checked >= i ? '✔' : '', current.checked >= i && validated.checked < i);
        }
        if (visibleScoring) {
            this.setContentAndValidation("traffic-jam-total", -current.total, current.total !== validated.total);
        }
    };
    return PlayerTableTrafficJamBlock;
}(PlayerTableBlock));
var TableCenter = /** @class */ (function () {
    function TableCenter(game, gamedatas) {
        this.game = game;
        this.gamedatas = gamedatas;
        [1, 2].forEach(function (number) { return document.getElementById("star".concat(number)).dataset.index = '' + gamedatas["star".concat(number)]; });
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
    TableCenter.prototype.addDeparturePawn = function (playerId, position) {
        dojo.place("<div id=\"departure-pawn-".concat(playerId, "\" class=\"departure-pawn\"></div>"), "intersection".concat(position));
        document.getElementById("departure-pawn-".concat(playerId)).style.setProperty('--background', "#".concat(this.game.getPlayerColor(playerId)));
    };
    TableCenter.prototype.addMarker = function (playerId, marker) {
        var _a;
        var min = Math.min(marker.from, marker.to);
        var max = Math.max(marker.from, marker.to);
        dojo.place("<div id=\"marker-".concat(playerId, "-").concat(min, "-").concat(max, "\" class=\"marker ").concat(marker.validated ? '' : 'unvalidated', "\" style=\"background: #").concat(this.game.getPlayerColor(playerId), ";\"></div>"), "route".concat(min, "-").concat(max));
        var ghost = document.getElementById("ghost-marker-".concat(min, "-").concat(max));
        (_a = ghost === null || ghost === void 0 ? void 0 : ghost.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(ghost);
    };
    TableCenter.prototype.setMarkerValidated = function (playerId, marker) {
        var min = Math.min(marker.from, marker.to);
        var max = Math.max(marker.from, marker.to);
        document.getElementById("marker-".concat(playerId, "-").concat(min, "-").concat(max)).classList.remove('unvalidated');
    };
    TableCenter.prototype.removeMarker = function (playerId, marker) {
        var min = Math.min(marker.from, marker.to);
        var max = Math.max(marker.from, marker.to);
        var div = document.getElementById("marker-".concat(playerId, "-").concat(min, "-").concat(max));
        div === null || div === void 0 ? void 0 : div.parentElement.removeChild(div);
    };
    TableCenter.prototype.addGhostMarker = function (route) {
        var min = Math.min(route.from, route.to);
        var max = Math.max(route.from, route.to);
        var ghostClass = '';
        if (route.isElimination) {
            ghostClass = 'elimination';
        }
        else if (route.useTurnZone) {
            ghostClass = 'turn-zone';
        }
        else if (route.trafficJam > 0) {
            ghostClass = 'traffic-jam';
        }
        dojo.place("<div id=\"ghost-marker-".concat(min, "-").concat(max, "\" class=\"ghost marker ").concat(ghostClass, "\"></div>"), "route".concat(min, "-").concat(max));
    };
    TableCenter.prototype.removeGhostMarkers = function () {
        Array.from(document.getElementsByClassName('ghost')).forEach(function (element) { var _a; return (_a = element.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(element); });
    };
    TableCenter.prototype.getCoordinatesFromNumberAndDigit = function (number, digit) {
        if (this.gamedatas.map === 'big') {
            var space = 63.2;
            return [
                38 + space * number,
                179 + space * digit,
            ];
        }
        else if (this.gamedatas.map === 'small') {
            var space = 57.4;
            return [
                213 + space * digit,
                20 + space * number,
            ];
        }
    };
    TableCenter.prototype.getCoordinatesFromPosition = function (position) {
        var number = Math.floor(position / 10) - 1;
        var digit = (position % 10) - 1;
        return this.getCoordinatesFromNumberAndDigit(number, digit);
    };
    TableCenter.prototype.getCoordinatesFromPositions = function (from, to) {
        var fromNumber = Math.floor(from / 10) - 1;
        var fromDigit = (from % 10) - 1;
        var toNumber = Math.floor(to / 10) - 1;
        var toDigit = (to % 10) - 1;
        return this.getCoordinatesFromNumberAndDigit((fromNumber + toNumber) / 2, (fromDigit + toDigit) / 2);
    };
    TableCenter.prototype.getSide = function (position) {
        if (this.gamedatas.map === 'big') {
            return this.getCoordinatesFromPosition(position)[0] > 370 ? 'right' : 'left';
        }
        else if (this.gamedatas.map === 'small') {
            // TODO handle angle
            return this.getCoordinatesFromPosition(position)[0] > 370 ? 'right' : 'left';
        }
    };
    TableCenter.prototype.placeCommonObjective = function (objective, isPlayer) {
        dojo.place("<div id=\"common-objective-".concat(objective.id, "\" class=\"common-objective card-inner\" data-side=\"").concat(objective.completed ? '1' : '0', "\">\n            <div class=\"card-side front\"></div>\n            <div class=\"card-side back\"></div>\n        </div>\n        "), "common-objective-slot-".concat(objective.number));
        var commonObjectiveInfos = COMMON_OBJECTIVES[objective.id];
        this.game.addTooltipHtml("common-objective-slot-".concat(objective.number), "".concat(this.game.getTooltip(90), "<br><br>").concat(_("To complete this objective, you need to check ${number} ${element}").replace('${number}', "<strong>".concat(commonObjectiveInfos[1], "</strong>")).replace('${element}', "<div class=\"map-icon\" data-element=\"".concat(commonObjectiveInfos[0], "\"></div>"))));
        if (isPlayer) { // objective progress counter only if player is not a spectator
            dojo.place("\n            <div class=\"common-objective-counter\"><span id=\"common-objective-".concat(objective.number, "-counter\" data-type=\"").concat(objective.id, "\">0</span>/").concat(commonObjectiveInfos[1], "</div>\n            "), "common-objective-slot-".concat(objective.number));
        }
    };
    TableCenter.prototype.setRound = function (validatedTickets, currentTicket, initialization) {
        if (initialization === void 0) { initialization = false; }
        var roundNumber = Math.min(12, validatedTickets.length + (!currentTicket ? 0 : 1));
        if (initialization) {
            for (var i = 1; i <= 12; i++) {
                var visible = i <= roundNumber;
                dojo.place("<div id=\"ticket-".concat(i, "\" class=\"ticket card-inner\" data-side=\"").concat(visible ? '1' : '0', "\" data-ticket=\"").concat(i === roundNumber ? currentTicket : 0, "\">\n                    <div class=\"card-side front\"></div>\n                    <div class=\"card-side back\"></div>\n                </div>"), "ticket-slot-".concat(visible ? 2 : 1));
            }
        }
        else {
            var roundTicketDiv = document.getElementById("ticket-".concat(roundNumber));
            roundTicketDiv.dataset.ticket = "".concat(currentTicket);
            slideToObjectTicketSlot2(this.game, roundTicketDiv, "ticket-slot-2", "rotateY(180deg)");
            roundTicketDiv.dataset.side = "1";
        }
    };
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
        this.tableCenter = new TableCenter(this, gamedatas);
        this.createPlayerTables(gamedatas, 0); // TODO
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
