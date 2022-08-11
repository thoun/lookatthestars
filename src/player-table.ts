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
        </div>
        `;
        dojo.place(html, document.getElementById('tables'));

        this.placeLines(player.lines);

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

    private getValidClass() {
        // TODO TEMP this.currentShape
        return Math.random() < 0.5 ? 'valid' : 'invalid';
    }

    public setShapeToPlace(currentShape: Card) {
        this.currentShape = currentShape;
        this.shapeX = 0;
        this.shapeY = 0;
        this.shapeRotation = 0;

        const validClass = this.getValidClass();
        dojo.place(`<div id="player-table-${this.playerId}-card-border" class="card-border" data-validity="${validClass}">
            <div id="player-table-${this.playerId}-button-left" type="button" class="arrow left"></div>
            <div id="player-table-${this.playerId}-button-right" type="button" class="arrow right"></div>
            <div id="player-table-${this.playerId}-button-top" type="button" class="arrow top"></div>
            <div id="player-table-${this.playerId}-button-bottom" type="button" class="arrow bottom"></div>
        </div>`,  `player-table-${this.playerId}-main`);
        this.setCardBorderPosition();
        document.getElementById(`player-table-${this.playerId}-button-left`).addEventListener('click', () => this.moveShapeLeft());
        document.getElementById(`player-table-${this.playerId}-button-right`).addEventListener('click', () => this.moveShapeRight());
        document.getElementById(`player-table-${this.playerId}-button-top`).addEventListener('click', () => this.moveShapeTop());
        document.getElementById(`player-table-${this.playerId}-button-bottom`).addEventListener('click', () => this.moveShapeBottom());

        // TODO TEMP
        this.placeLines(currentShape.lines, ['temp-line', validClass]);
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
    }

    public rotateShape() {
        this.shapeRotation = (this.shapeRotation + 1) % 4;
        this.moveShape();
    }

    private moveShapeLeft() {
        if (this.shapeX == 0) {
            return;
        }
        this.shapeX--;
        this.moveShape();
    }

    private moveShapeRight() {
        if (this.shapeX >= 6) {
            return;
        }
        this.shapeX++;
        this.moveShape();
    }

    private moveShapeBottom() {
        if (this.shapeY == 0) {
            return;
        }
        this.shapeY--;
        this.moveShape();
    }

    private moveShapeTop() {
        if (this.shapeY >= 7) {
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
    }

}