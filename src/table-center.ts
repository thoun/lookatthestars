class TableCenter {
    public pileCounters: Counter[] = [];

    constructor(private game: LookAtTheStarsGame, private gamedatas: LookAtTheStarsGamedatas) {

        [1, 2, 3].forEach(number => {
            dojo.place(`
            <div id="pile${number}-wrapper" class="pile-wrapper">
             <div id="pile${number}" class="pile"></div>
             <div id="pile${number}-counter" class="pile-counter"></div>
            </div>    
            `, `shapes`);

            this.pileCounters[number] = new ebg.counter();
            this.pileCounters[number].create(`pile${number}-counter`);
            this.pileCounters[number].setValue(gamedatas[`remainingCardsInDiscard${number}`]);
        });

        [1, 2].forEach(number => {
            dojo.place(`
            <div id="star${number}" class="card" data-index="${gamedatas[`star${number}`]}"></div> 
            `, `objectives`);
        });

        let currentPile = 3;
        let currentPileDiv = document.getElementById(`pile${currentPile}`);
        for (let i=0; i<gamedatas.cards.length; i++) {
            if (currentPile == 3 && i >= 6) {
                currentPile = 2;
                currentPileDiv = document.getElementById(`pile${currentPile}`);
            } else if (currentPile == 2 && i >= 12) {
                currentPile = 1;
                currentPileDiv = document.getElementById(`pile${currentPile}`);
            }

            game.cards.createMoveOrUpdateCard(gamedatas.cards[i], currentPileDiv.id, true);
        }

        this.game.setTooltip(`star1`, _('When you reproduce on your board the shape indicated by this card, earn the number of victory points indicated on that card at the end of the game.');
        this.game.setTooltip(`star2`, _('When you reproduce on your board the shape indicated by this card, get an immediate bonus:') + '<br>' + this.getStar2Tooltip(gamedatas.star2));
        this.updateCounters();
    }

    public updateCounters() {
        [1, 2, 3].forEach(number => 
            this.pileCounters[number].setValue(document.getElementById(`pile${number}`).childElementCount)
        );
    }

    public getStar2Tooltip(type: number) {
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
    }
}