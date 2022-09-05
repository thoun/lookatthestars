class Cards {
    constructor(private game: LookAtTheStarsGame) {}  

    // gameui.cards.debugSeeAllCards()
    private debugSeeAllCards() {
        document.querySelectorAll('.card').forEach(card => card.remove());
        
        let html = `<div id="all-cards">`;
        html += `</div>`;
        dojo.place(html, 'full-table', 'before');

        [1, 2, 3, 4, 5, 6].forEach(subType => {
            const card = {
                id: 10+subType,
                type: 1,
                subType,
            } as any as Card;
            this.createMoveOrUpdateCard(card, `all-cards`);
        });

        [2, 3, 4, 5, 6].forEach(type => 
            [1, 2, 3].forEach(subType => {
                const card = {
                    id: 10*type+subType,
                    type,
                    subType,
                } as any as Card;
                this.createMoveOrUpdateCard(card, `all-cards`);
            })
        );
    }

    public createMoveOrUpdateCard(card: Card, destinationId?: string, init: boolean = false, from: string = null) {
        const existingDiv = document.getElementById(`card-${card.id}`);
        const side = card.type ? 'front' : 'back';
        if (existingDiv) {
            const oldType = Number(existingDiv.dataset.category);

            existingDiv.dataset.side = ''+side;
            if (!oldType && card.type) {
                this.setVisibleInformations(existingDiv, card);
            } else if (oldType && !card.type) {
                setTimeout(() => this.removeVisibleInformations(existingDiv), 500); // so we don't change face while it is still visible
            }
            
            if (!destinationId || existingDiv.parentElement.id == destinationId) {
                return;
            }

            if (init) {
                document.getElementById(destinationId).appendChild(existingDiv);
            } else {
                slideToObjectAndAttach(this.game, existingDiv, destinationId);
            }
        } else {
            const div = document.createElement('div');
            div.id = `card-${card.id}`;
            div.classList.add('card');
            div.dataset.id = ''+card.id;
            div.dataset.side = ''+side;

            div.innerHTML = `
                <div class="card-sides">
                    <div class="card-side front">
                    </div>
                    <div class="card-side back">
                    </div>
                </div>
            `;
            document.getElementById(destinationId).appendChild(div);

            if (from) {
                const fromCardId = document.getElementById(from).id;
                slideFromObject(this.game, div, fromCardId);
            }

            if (card.type) {
                this.setVisibleInformations(div, card);
            }
        }
    }

    private setVisibleInformations(div: HTMLElement, card: Card) {
        div.dataset.type = ''+card.type;
        div.dataset.typeArg = ''+card.typeArg;
    }

    private removeVisibleInformations(div: HTMLElement) {
        div.removeAttribute('data-type');
        div.removeAttribute('data-type-arg');
    }
}