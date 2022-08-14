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

    private currentShape: Card;
    private shapeX: number;
    private shapeY: number;
    private shapeRotation: number;
    private possiblePositions: number[][];

    constructor(game: LookAtTheStarsGame, player: LookAtTheStarsPlayer, day: number) {
        this.playerId = Number(player.id);

        let html = `
        <div id="player-table-${this.playerId}" class="player-table " style="box-shadow: 0 0 3px 3px #${player.color};" data-type="${player.sheetType}">
            <div id="player-table-${this.playerId}-main" class="main">
                <div id="player-table-${this.playerId}-svg" class="svg-wrapper">${this.makeSVG()}</div>
                <div id="player-table-${this.playerId}-day" class="day" data-level="${day}">
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
        this.placeLines(player.roundLines, ['round']);

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

    private setCardBorderPosition() {
        const x = SVG_LEFT_MARGIN + (this.shapeX * SVG_LINE_WIDTH);
        const y = SVG_BOTTOM_MARGIN - (this.shapeY * SVG_LINE_HEIGHT);
        const cardBorderDiv = document.getElementById(`player-table-${this.playerId}-card-border`);
        cardBorderDiv.style.left = `${x - 20}px`;
        cardBorderDiv.style.top = `${y - 180}px`;
    }

    private getValid(): boolean {
        return this.possiblePositions[(this.shapeX + 1).toString(16) + (this.shapeY + 1).toString(16)].includes(this.shapeRotation);
    }

    private getValidClass(): string {
        return this.getValid() ? 'valid' : 'invalid';
    }

    public setShapeToPlace(currentShape: Card, possiblePositions: number[][]) {
        if (this.currentShape != null) {
            return;
        }

        this.currentShape = currentShape;
        this.possiblePositions = possiblePositions;
        this.shapeX = 3;
        this.shapeY = 3;
        this.shapeRotation = 0;

        const validClass = this.getValidClass();
        dojo.place(`<div id="player-table-${this.playerId}-card-border" class="card-border" data-validity="${validClass}">
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

    private moveShape() {
        const oldLines = Array.from(document.getElementById(`player-table-${this.playerId}-svg`).getElementsByClassName('temp-line')) as HTMLElement[];
        oldLines.forEach(oldLine => oldLine.parentElement?.removeChild(oldLine));
        const validClass = this.getValidClass();

        let rotatedLines = this.currentShape.lines.map(line => line);
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
        this.placeLines(rotatedAndShiftedLines, ['temp-line', validClass]);

        this.setCardBorderPosition();
        document.getElementById(`player-table-${this.playerId}-card-border`).dataset.validity = validClass;

        document.getElementById('placeShape_button')?.classList.toggle('disabled', !this.getValid());
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

    private moveShapeBottom() {
        if (this.shapeY <= -1) {
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
        this.currentShape = null;
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

}