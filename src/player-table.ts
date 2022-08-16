const isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;;
const log = isDebug ? console.log.bind(window.console) : function () { };

const SVG_LEFT_MARGIN = 37.5;
const SVG_BOTTOM_MARGIN = 577;
const SVG_LINE_WIDTH = 52.3;
const SVG_LINE_HEIGHT = 53.5;

function isSafari() {
    return !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);
}

class PlayerTable {
    public playerId: number;

    private currentCard: Card;
    private shapeX: number;
    private shapeY: number;
    private shapeRotation: number;
    private possiblePositions: number[][];
    private shootingStarPossiblePositions: number[][][];
    private shootingStarSize: number;
    private linePossiblePositions: string[];

    constructor(private game: LookAtTheStarsGame, player: LookAtTheStarsPlayer) {
        this.playerId = Number(player.id);

        let html = `
        <div id="player-table-${this.playerId}" class="player-table " style="box-shadow: 0 0 3px 3px #${player.color};" data-type="${player.sheetType}">
            <div id="player-table-${this.playerId}-main" class="main">
                <div id="player-table-${this.playerId}-svg" class="svg-wrapper">${this.makeSVG()}</div>
                <div id="player-table-${this.playerId}-day" class="day" data-level="${this.game.day}">
                </div>
            </div>
            <div class="name" style="color: #${player.color};">
                <span>${player.name}</span>
            </div>

            <div class="checkedConstellations">`;
            for (let i = 3; i <= 8; i++) {
                html += `<div id="player-table-${this.playerId}-constellation${i}" class="constellation score" data-number="${i}"></div>`;
            }
            html += `    </div>
            <div id="player-table-${this.playerId}-constellations" class="constellations score"></div>
            <div id="player-table-${this.playerId}-planets" class="planets score"></div>
            <div id="player-table-${this.playerId}-shooting-stars" class="shooting-stars score"></div>
            <div id="player-table-${this.playerId}-star1" class="star1 score"></div>
            <div id="player-table-${this.playerId}-star2" class="star2 score"></div>
            <div id="player-table-${this.playerId}-total" class="total score"></div>
        </div>
        `;
        dojo.place(html, document.getElementById('tables'));

        this.placeLines(player.lines);
        this.placeInitialObjects(player.objects);

        if (player.roundLines) {
            this.placeLines(player.roundLines, ['round']);
        }
        if (player.roundObjects) {
            this.placeInitialObjects(player.roundObjects, ['round']);
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

    private placeInitialObjects(objects: Objects, classes: string[] = []) {
        objects.shootingStars?.forEach(shootingStar => {
            this.placeLines(shootingStar.lines, classes);
            this.placeShootingStarHead(shootingStar.head, classes);
        });

        objects.planets?.forEach(planet => this.placeObject(planet, 'planet', classes));
    }

    public setDay(day: number) {
        document.getElementById(`player-table-${this.playerId}-day`).dataset.level = ''+day;
    }

    private makeSVG() {
      return `
        <svg viewBox="0 0 546 612" preserveAspectRatio="none"> 
            <defs>
                <filter x="-2%" y="-2%" width="104%" height="104%" filterUnits="objectBoundingBox" id="PencilTexture">
                <feTurbulence type="fractalNoise" baseFrequency="3.4" numOctaves="2" result="noise">
                </feTurbulence>
                <feDisplacementMap xChannelSelector="R" yChannelSelector="G" scale="4" in="SourceGraphic" result="newSource">
                </feDisplacementMap>
                </filter>
            </defs>
            <g id="lats-svg-${this.playerId}" ${isSafari() ? '' : 'filter="url(#PencilTexture)"'}>
                <line x1="0" y1="0" x2="0" y2="0"  stroke="red" stroke-width="1" stroke-opacity="1"></line>
            </g>
        </svg>`;
    }
    public placeLines(lines: string[], additionalClass: string[] = []) {
        lines.forEach(line => this.placeLine(
            line,
            parseInt(line[0], 16),
            parseInt(line[1], 16),
            parseInt(line[2], 16),
            parseInt(line[3], 16), 
            additionalClass
        ));
    }

    placeShootingStarHead(head: string, additionalClass: string[] = []) {
        const lineid = `shooting-star-head-${this.playerId}-${head}`;
        const headLinesLength = 13;

        const x = SVG_LEFT_MARGIN + parseInt(head[0], 16) * SVG_LINE_WIDTH;
        const y = SVG_BOTTOM_MARGIN - parseInt(head[1], 16) * SVG_LINE_HEIGHT;

        let newLine = document.createElementNS('http://www.w3.org/2000/svg','path');
        newLine.setAttribute('id', lineid+'1');
        newLine.setAttribute('d', `M${x-headLinesLength} ${y} L${x+headLinesLength} ${y} Z`);
        newLine.classList.add('line', ...additionalClass);
        $('lats-svg-'+this.playerId).append(newLine);

        newLine = document.createElementNS('http://www.w3.org/2000/svg','path');
        newLine.setAttribute('id', lineid+'1');
        newLine.setAttribute('d', `M${x} ${y-headLinesLength} L${x} ${y+headLinesLength} Z`);
        newLine.classList.add('line', ...additionalClass);
        $('lats-svg-'+this.playerId).append(newLine);

        newLine = document.createElementNS('http://www.w3.org/2000/svg','path');
        newLine.setAttribute('id', lineid+'1');
        newLine.setAttribute('d', `M${x-headLinesLength} ${y-headLinesLength} L${x+headLinesLength} ${y+headLinesLength} Z`);
        newLine.classList.add('line', ...additionalClass);
        $('lats-svg-'+this.playerId).append(newLine);

        newLine = document.createElementNS('http://www.w3.org/2000/svg','path');
        newLine.setAttribute('id', lineid+'1');
        newLine.setAttribute('d', `M${x+headLinesLength} ${y-headLinesLength} L${x-headLinesLength} ${y+headLinesLength} Z`);
        newLine.classList.add('line', ...additionalClass);
        $('lats-svg-'+this.playerId).append(newLine);
    }

    placeObject(coordinates: string, type: 'planet', additionalClass: string[] = []) {
        const newObject = document.createElementNS('http://www.w3.org/2000/svg', 'image');

        const xCoordinate = parseInt(coordinates[0], 16);
        const yCoordinate = parseInt(coordinates[1], 16);
        const x = SVG_LEFT_MARGIN + xCoordinate * SVG_LINE_WIDTH;
        const y = SVG_BOTTOM_MARGIN - yCoordinate * SVG_LINE_HEIGHT;

        newObject.setAttribute('id', type+coordinates);
        newObject.setAttribute('x', `${x - 20}`);
        newObject.setAttribute('y', `${y - 20}`);
        newObject.setAttribute('width', `40`);
        newObject.setAttribute('height', `40`);
        newObject.setAttribute('href', `${g_gamethemeurl}img/objects.png`);
        newObject.classList.add('object', ...additionalClass);
        document.getElementById('lats-svg-'+this.playerId).after(newObject);
    }

    private placeLine(line: string, xfrom: number, yfrom: number, xto: number, yto: number, additionalClass: string[] = []) {
        const lineid = `line-${this.playerId}-${line}`;

        const c1 = {
            x: SVG_LEFT_MARGIN + (xfrom * SVG_LINE_WIDTH),
            y: SVG_BOTTOM_MARGIN - (yfrom * SVG_LINE_HEIGHT),
        };
        const c2 = {
            x: SVG_LEFT_MARGIN + (xto * SVG_LINE_WIDTH),
            y: SVG_BOTTOM_MARGIN - (yto * SVG_LINE_HEIGHT),
        };

        let newLine = document.createElementNS('http://www.w3.org/2000/svg','path');
        newLine.setAttribute('id',lineid);
        newLine.setAttribute('d', `M${c1.x} ${c1.y} L${c2.x} ${c2.y} Z`);
        newLine.classList.add('line', ...additionalClass);
        //newLine.setAttribute('vector-effect','non-scaling-stroke');

        $('lats-svg-'+this.playerId).append(newLine);

        // TODO ? newLine.setAttribute('style', 'stroke-dasharray:'+newLine.getTotalLength()+';stroke-dashoffset:'+newLine.getTotalLength());

        //force refresh hack
        setTimeout(() => {
            newLine?.setAttribute('style', '');

            const svgDiv = document.getElementById(`player-table-${this.playerId}-svg`);

            if (svgDiv) {
                if (svgDiv.getAttribute('style')=='opacity:0.9999;') {
                    svgDiv.setAttribute('style', 'opacity:1');
                } else {
                    svgDiv.setAttribute('style', 'opacity:0.9999;');
                }
            }
        }, 1500);
    }

    public getShapeInformations() {
        return {
            x: this.shapeX,
            y: this.shapeY,
            rotation: this.shapeRotation,
        };
    }
    public getShootingStarInformations() {
        return {
            ...this.getShapeInformations(),
            size: this.shootingStarSize,
        };
    }
    
    public getLineInformations() {
        return {
            xFrom: this.shapeX,
            yFrom: this.shapeY,
            xTo: [1, 2, 3].includes(this.shapeRotation) ? this.shapeX + 1 : ([5, 6, 7].includes(this.shapeRotation) ? this.shapeX - 1 : this.shapeX),
            yTo: [7, 0, 1].includes(this.shapeRotation) ? this.shapeY + 1 : ([3, 4, 5].includes(this.shapeRotation) ? this.shapeY - 1 : this.shapeX),
        };
    }

    private setCardBorderPosition() {
        const x = SVG_LEFT_MARGIN + (this.shapeX * SVG_LINE_WIDTH);
        const y = SVG_BOTTOM_MARGIN - (this.shapeY * SVG_LINE_HEIGHT);
        const cardBorderDiv = document.getElementById(`player-table-${this.playerId}-card-border`);
        cardBorderDiv.style.left = `${x - 20}px`;
        cardBorderDiv.style.top = `${y - 180}px`;
    }

    private setLineBorderPosition() {
        const x = SVG_LEFT_MARGIN + (this.shapeX * SVG_LINE_WIDTH);
        const y = SVG_BOTTOM_MARGIN - (this.shapeY * SVG_LINE_HEIGHT);
        const cardBorderDiv = document.getElementById(`player-table-${this.playerId}-line-border`);
        cardBorderDiv.style.left = `${x - 70}px`;
        cardBorderDiv.style.top = `${y - 70}px`;
    }

    private getValid(): boolean {
        let possiblePositions;
        if (this.currentCard.type == 1) {
            possiblePositions = this.shootingStarPossiblePositions[this.shootingStarSize];
        } else if (this.currentCard.type == 2) {
            possiblePositions = this.possiblePositions;
        }
        return possiblePositions[(this.shapeX + 1).toString(16) + (this.shapeY + 1).toString(16)].includes(this.shapeRotation);
    }

    private getValidClass(): string {
        return this.getValid() ? 'valid' : 'invalid';
    }

    private getValidForLine(): boolean {
        const infos = this.getLineInformations();
        const fromStr = infos.xFrom.toString(16) + infos.yFrom.toString(16);
        const toStr = infos.xTo.toString(16) + infos.yTo.toString(16);
        return this.linePossiblePositions.includes(fromStr + toStr) || this.linePossiblePositions.includes(toStr + fromStr);
    }

    private getValidClassForLine(): string {
        return this.getValidForLine() ? 'valid' : 'invalid';
    }

    public setShapeToPlace(currentShape: Card, possiblePositions: number[][] | number[][][]) {
        if (this.currentCard != null) {
            return;
        }

        this.currentCard = currentShape;
        this.shapeX = 3;
        this.shapeY = 3 + this.game.day;
        this.shapeRotation = 0;
        if (this.currentCard.type == 1) {
            this.shootingStarPossiblePositions = possiblePositions as number[][][];
            this.shootingStarSize = 3;
        } else if (this.currentCard.type == 2) {
            this.possiblePositions = possiblePositions as number[][];
        }

        const validClass = this.getValidClass();
        dojo.place(`<div id="player-table-${this.playerId}-card-border" class="card border" data-validity="${validClass}">
            <div id="player-table-${this.playerId}-button-left" type="button" class="arrow left"></div>
            <div id="player-table-${this.playerId}-button-right" type="button" class="arrow right"></div>
            <div id="player-table-${this.playerId}-button-top" type="button" class="arrow top"></div>
            <div id="player-table-${this.playerId}-button-bottom" type="button" class="arrow bottom"></div>
            <div id="player-table-${this.playerId}-button-rotate" type="button" class="arrow rotate"></div>
        </div>`,  `player-table-${this.playerId}-main`);
        this.setCardBorderPosition();
        document.getElementById(`player-table-${this.playerId}-button-left`).addEventListener('click', () => this.moveShapeLeft());
        document.getElementById(`player-table-${this.playerId}-button-right`).addEventListener('click', () => this.moveShapeRight());
        document.getElementById(`player-table-${this.playerId}-button-top`).addEventListener('click', () => this.moveShapeTop());
        document.getElementById(`player-table-${this.playerId}-button-bottom`).addEventListener('click', () => this.moveShapeBottom());
        document.getElementById(`player-table-${this.playerId}-button-rotate`).addEventListener('click', () => this.rotateShape());

        this.moveShape();
    }

    public setLineToPlace(possiblePositions: string[]) {
        this.linePossiblePositions = possiblePositions;
        this.shapeX = 5;
        this.shapeY = 5 + this.game.day;
        this.shapeRotation = 0;

        const validClass = this.getValidClassForLine();
        dojo.place(`<div id="player-table-${this.playerId}-line-border" class="line border" data-validity="${validClass}">
            <div id="player-table-${this.playerId}-button-left" type="button" class="arrow left"></div>
            <div id="player-table-${this.playerId}-button-right" type="button" class="arrow right"></div>
            <div id="player-table-${this.playerId}-button-top" type="button" class="arrow top"></div>
            <div id="player-table-${this.playerId}-button-bottom" type="button" class="arrow bottom"></div>
            <div id="player-table-${this.playerId}-button-rotate" type="button" class="arrow rotate"></div>
        </div>`,  `player-table-${this.playerId}-main`);
        this.setLineBorderPosition();
        document.getElementById(`player-table-${this.playerId}-button-left`).addEventListener('click', () => this.moveLineLeft());
        document.getElementById(`player-table-${this.playerId}-button-right`).addEventListener('click', () => this.moveLineRight());
        document.getElementById(`player-table-${this.playerId}-button-top`).addEventListener('click', () => this.moveLineTop());
        document.getElementById(`player-table-${this.playerId}-button-bottom`).addEventListener('click', () => this.moveLineBottom());
        document.getElementById(`player-table-${this.playerId}-button-rotate`).addEventListener('click', () => this.rotateLine());

        this.moveLine();
    }

    private getRotatedAndShiftedLines(lines: string[]): string[] {
        let rotatedLines = lines.map(line => line);
        if (this.shapeRotation == 1 || this.shapeRotation == 3) {
            // rotate 90°
            rotatedLines = rotatedLines.map(line => 
                (Number.parseInt(line[1], 16)).toString(16) + 
                (3 - Number.parseInt(line[0], 16)).toString(16) +
                (Number.parseInt(line[3], 16)).toString(16) + 
                (3 - Number.parseInt(line[2], 16)).toString(16) 
            );
        }
        if (this.shapeRotation == 2 || this.shapeRotation == 3) {
            // rotate 180°
            rotatedLines = rotatedLines.map(line => 
                (3 - Number.parseInt(line[0], 16)).toString(16) + 
                (3 - Number.parseInt(line[1], 16)).toString(16) +
                (3 - Number.parseInt(line[2], 16)).toString(16) + 
                (3 - Number.parseInt(line[3], 16)).toString(16) 
            );
        }

        let rotatedAndShiftedLines = rotatedLines.map(line => 
            (Number.parseInt(line[0], 16) + this.shapeX).toString(16) + 
            (Number.parseInt(line[1], 16) + this.shapeY).toString(16) +
            (Number.parseInt(line[2], 16) + this.shapeX).toString(16) + 
            (Number.parseInt(line[3], 16) + this.shapeY).toString(16) 
        );

        return rotatedAndShiftedLines;
    };

    private getRotatedAndShiftedCoordinates(coordinates: string): string {
        let rotatedCoordinates = ''+coordinates;
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

        let rotatedAndShiftedCoordinates = 
            (Number.parseInt(rotatedCoordinates[0], 16) + this.shapeX).toString(16) + 
            (Number.parseInt(rotatedCoordinates[1], 16) + this.shapeY).toString(16);

        return rotatedAndShiftedCoordinates;
    };

    private moveShape() {
        const oldLines = Array.from(document.getElementById(`player-table-${this.playerId}-svg`).getElementsByClassName('temp-line')) as HTMLElement[];
        oldLines.forEach(oldLine => oldLine.parentElement?.removeChild(oldLine));
        const validClass = this.getValidClass();

        let lines = [];
        if (this.currentCard.type == 1) {
            lines = (this.game as any).gamedatas.SHOOTING_STAR_SIZES[this.shootingStarSize].lines;
        } else if (this.currentCard.type == 2) {
            lines = this.currentCard.lines;
        }
        let rotatedAndShiftedLines = this.getRotatedAndShiftedLines(lines);
        this.placeLines(rotatedAndShiftedLines, ['temp-line', validClass]);

        if (this.currentCard.type == 1) {     
            const head = (this.game as any).gamedatas.SHOOTING_STAR_SIZES[this.shootingStarSize].head;       
            const rotatedAndShiftedHead = this.getRotatedAndShiftedCoordinates(head);
            this.placeShootingStarHead(rotatedAndShiftedHead, ['temp-line', validClass]);
        }

        this.setCardBorderPosition();
        document.getElementById(`player-table-${this.playerId}-card-border`).dataset.validity = validClass;

        document.getElementById('placeShape_button')?.classList.toggle('disabled', !this.getValid());
    }

    private moveLine() {
        const oldLines = Array.from(document.getElementById(`player-table-${this.playerId}-svg`).getElementsByClassName('temp-line')) as HTMLElement[];
        oldLines.forEach(oldLine => oldLine.parentElement?.removeChild(oldLine));
        const validClass = this.getValidClassForLine();

        const infos = this.getLineInformations();
        let lines = [
            infos.xFrom.toString(16) + infos.yFrom.toString(16) + infos.xTo.toString(16) + infos.yTo.toString(16)
        ];
        this.placeLines(lines, ['temp-line', validClass]);

        this.setLineBorderPosition();
        document.getElementById(`player-table-${this.playerId}-line-border`).dataset.validity = validClass;

        document.getElementById('placeLine_button')?.classList.toggle('disabled', !this.getValidForLine());
    }

    private rotateShape() {
        this.shapeRotation = (this.shapeRotation + 1) % 4;
        this.moveShape();
    }

    private moveShapeLeft() {
        if (this.shapeX <= -1) {
            return;
        }
        this.shapeX--;
        this.moveShape();
    }

    private moveShapeRight() {
        if (this.shapeX >= 7) {
            return;
        }
        this.shapeX++;
        this.moveShape();
    }

    private rotateLine() {
        this.shapeRotation = (this.shapeRotation + 1) % 8;
        // TODO 
        this.moveLine();
    }

    private moveLineBottom() {
        if (this.shapeY <= (this.game.day * 2)) {
            return;
        }
        this.shapeY--;
        this.moveLine();
    }

    private moveLineTop() {
        if (this.shapeY >= 10) {
            return;
        }
        this.shapeY++;
        this.moveLine();
    }

    private moveLineLeft() {
        if (this.shapeX <= 0) {
            return;
        }
        this.shapeX--;
        this.moveLine();
    }

    private moveLineRight() {
        if (this.shapeX >= 9) {
            return;
        }
        this.shapeX++;
        this.moveLine();
    }

    private moveShapeBottom() {
        if (this.shapeY <= -1 + (this.game.day * 2)) {
            return;
        }
        this.shapeY--;
        this.moveShape();
    }

    private moveShapeTop() {
        if (this.shapeY >= 8) {
            return;
        }
        this.shapeY++;
        this.moveShape();
    }
    
    public removeShapeToPlace() {
        const cardBorderDiv = document.getElementById(`player-table-${this.playerId}-card-border`);
        cardBorderDiv?.parentElement?.removeChild(cardBorderDiv);

        const oldLines = Array.from(document.getElementById(`player-table-${this.playerId}-svg`).getElementsByClassName('temp-line')) as HTMLElement[];
        oldLines.forEach(oldLine => oldLine.parentElement?.removeChild(oldLine));
        this.currentCard = null;
    }
    
    public removeLineToPlace() {
        const cardBorderDiv = document.getElementById(`player-table-${this.playerId}-line-border`);
        cardBorderDiv?.parentElement?.removeChild(cardBorderDiv);

        const oldLines = Array.from(document.getElementById(`player-table-${this.playerId}-svg`).getElementsByClassName('temp-line')) as HTMLElement[];
        oldLines.forEach(oldLine => oldLine.parentElement?.removeChild(oldLine));
    }
    
    public cancelPlacedLines() {
        const oldLines = Array.from(document.getElementById(`player-table-${this.playerId}-svg`).getElementsByClassName('round')) as HTMLElement[];
        oldLines.forEach(oldLine => oldLine.parentElement?.removeChild(oldLine));
    }

    public setConstellationsScore(checkedConstellations: number[], score: number) {
        for (let i = 3; i <= 8; i++) {
            if (checkedConstellations.includes(i)) {
                document.getElementById(`player-table-${this.playerId}-constellation${i}`).innerHTML = '.';
            }
        }

        document.getElementById(`player-table-${this.playerId}-constellations`).innerHTML = ''+score;
    }

    public setPlanetScore(score: number) {
        document.getElementById(`player-table-${this.playerId}-planets`).innerHTML = ''+score;
    }

    public setShootingStarsScore(score: number) {
        document.getElementById(`player-table-${this.playerId}-shooting-stars`).innerHTML = ''+score;
    }

    public setStar1Score(score: number) {
        document.getElementById(`player-table-${this.playerId}-star1`).innerHTML = ''+score;
    }

    public setStar2Score(score: number) {
        document.getElementById(`player-table-${this.playerId}-star2`).innerHTML = ''+score;
    }

    public setFinalScore(score: number) {
        document.getElementById(`player-table-${this.playerId}-total`).innerHTML = ''+score;
    }

    public nextShape(): void {
        // validate round lines
        const oldLines = Array.from(document.getElementById(`player-table-${this.playerId}-svg`).getElementsByClassName('round')) as HTMLElement[];
        oldLines.forEach(oldLine => oldLine.classList.remove('round'));
    }

    public setShootingStarSize(size: number) {
        this.shootingStarSize = size;
        this.moveShape();

        const buttons = Array.from(document.getElementsByClassName('setShootingStarSizeButton')) as HTMLElement[];
        buttons.forEach(button => button.classList.toggle('current-size', button.dataset.shootingStarSize == ''+size));
    }
    
    public setStarSelection(possibleCoordinates: string[], placeFunction: (x: number, y: number) => void) {
        possibleCoordinates.forEach(possibleCoordinate => {
            const xCoordinate = parseInt(possibleCoordinate[0], 16);
            const yCoordinate = parseInt(possibleCoordinate[1], 16);
            const x = SVG_LEFT_MARGIN + xCoordinate * SVG_LINE_WIDTH;
            const y = SVG_BOTTOM_MARGIN - yCoordinate * SVG_LINE_HEIGHT;

            let newLine = document.createElementNS('http://www.w3.org/2000/svg','circle');
            newLine.setAttribute('id', 'possible-coordinates-'+possibleCoordinates);
            newLine.setAttribute('cx', `${x}`);
            newLine.setAttribute('cy', `${y}`);
            newLine.setAttribute('r', `10`);
            newLine.classList.add('coordinates-selector');
            $('lats-svg-'+this.playerId).append(newLine);

            newLine.addEventListener('click', () => placeFunction(xCoordinate, yCoordinate));
        });
    }

    public removeStarSelection() {
        const oldLines = Array.from(document.getElementById(`player-table-${this.playerId}-svg`).getElementsByClassName('coordinates-selector')) as HTMLElement[];
        oldLines.forEach(oldLine => oldLine.parentElement?.removeChild(oldLine));
    }

}