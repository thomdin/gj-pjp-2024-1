import util from "../app/util.js"
import card_list from "../card-data.js"

export default class Level1 {
    constructor(app) {
        this.app = app
        this.lv_number = 1
        this.objectiveText = "Build up your defenses.<br/>Place your units and destroy all enemy units."
        this.hint = 'Use <span>Provoke</span> on <span>Militia</span>.'
        app.p2.zones["0"] = util.makeCard(card_list, "goblin", "enemy-card-0")
        app.p2.zones["1"] = util.makeCard(card_list, "goblin", "enemy-card-1")
        app.p2.zones["2"] = util.makeCard(card_list, "goblin", "enemy-card-2")
            ;
        ["militia", "militia", "militia"]
            .forEach((c, i) => {
                const card = util.makeCard(card_list, c, "player-card-" + i)
                app.p1.hand.push(card)
            })
    }

    evaluateSuccess() {
        return util.getUnits(this.app, "p2").length === 0
    }
}