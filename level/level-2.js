import util from "../app/util.js"
import card_list from "../card-data.js"

export default class Level2 {
    constructor(app) {
        this.app = app
        this.lv_number = 2
        this.objectiveText = 'Destroy all enemy units.'
        this.hint =
            `Attack <span>Orc</span> with <span>Milita</span>.<br/>
            Use one <span>Sword&Shield</span> on each <span>Villager</span>.
            `;
        app.p2.zones["0"] = util.makeCard(card_list, "orc", "enemy-card-0")
        app.p2.zones["1"] = util.makeCard(card_list, "orc", "enemy-card-1")
        app.p2.zones["2"] = util.makeCard(card_list, "goblin", "enemy-card-2")

        app.p1.zones["0"] = util.makeCard(card_list, "villager", "player-card-0")
        app.p1.zones["1"] = util.makeCard(card_list, "villager", "player-card-1")
        app.p1.zones["2"] = util.makeCard(card_list, "militia", "player-card-2")
            ;
        ["sns", "ballista"]
            .forEach((c, i) => {
                const card = util.makeCard(card_list, c, "player-card-" + i + 5)
                app.p1.hand.push(card)
            })
    }

    evaluateSuccess() {
        return util.getUnits(this.app, "p2").length === 0
    }
}