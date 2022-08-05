const isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;;
const log = isDebug ? console.log.bind(window.console) : function () { };

class PlayerTable {
    public playerId: number;
    
    private oldLadies: PlayerTableOldLadiesBlock;
    private students: PlayerTableStudentsBlock;
    private tourists: PlayerTableTouristsBlock;
    private businessmen: PlayerTableBusinessmenBlock;
    private commonObjectives: PlayerTableCommonObjectivesBlock;
    private personalObjective: PlayerTablePersonalObjectiveBlock;
    private turnZones: PlayerTableTurnZonesBlock;
    private trafficJam: PlayerTableTrafficJamBlock;

    constructor(game: LookAtTheStarsGame, player: LookAtTheStarsPlayer, day: number) {
        this.playerId = Number(player.id);

        let html = `
        <div id="player-table-${this.playerId}" class="player-table " style="box-shadow: 0 0 3px 3px #${player.color};" data-type="${player.sheetType}">
            <div id="player-table-${this.playerId}-main" class="main">
                <div id="player-table-${this.playerId}-day" class="day" data-level="${day}">
                </div>
            </div>
            <div class="name" style="color: #${player.color};">
                <span>${player.name}</span>
            </div>
        </div>
        `;
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

    public setDay(day: number) {
        document.getElementById(`player-table-${this.playerId}-day`).dataset.level = ''+day;
    }

    public updateScoreSheet(scoreSheets: ScoreSheets, visibleScoring: boolean) {
        this.oldLadies.updateScoreSheet(scoreSheets, visibleScoring);
        this.students.updateScoreSheet(scoreSheets, visibleScoring);
        this.tourists.updateScoreSheet(scoreSheets, visibleScoring);
        this.businessmen.updateScoreSheet(scoreSheets, visibleScoring);
        this.commonObjectives.updateScoreSheet(scoreSheets, visibleScoring);
        this.personalObjective.updateScoreSheet(scoreSheets, visibleScoring);
        this.turnZones.updateScoreSheet(scoreSheets, visibleScoring);
        this.trafficJam.updateScoreSheet(scoreSheets, visibleScoring);

        if (visibleScoring) {
            this.setContentAndValidation(`total-score`, scoreSheets.current.total, scoreSheets.current.total != scoreSheets.validated.total);
        }
    }

    private setContentAndValidation(id: string, content: string | number | undefined | null, unvalidated: boolean) {
        const div = document.getElementById(`player-table-${this.playerId}-${id}`);
        let contentStr = '';
        if (typeof content === 'string') {
            contentStr = content;
        } else if (typeof content === 'number') {
            contentStr = ''+content;
        }
        div.innerHTML = contentStr;
        div.dataset.unvalidated = unvalidated.toString();
    }

}