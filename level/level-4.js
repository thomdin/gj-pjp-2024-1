import util from "../app/util.js"
import card_list from "../card-data.js"

export default class Level4 {
    constructor(app) {
        this.app = app
        this.lv_number = 4
        this.objectiveText = 'Destroy all enemy units.'
        this.hint =
            `Place the <span>Kamikaze</span> unit and attack <span>Hobgoblin</span><br/>.
            Attack <span>Orc</span> with Milita.
            Use <span>Sword&Shileld</span> on the first <span>Villager</span>, boosting its ATK to 1400.
            Attack <span>Orc</span> with this <span>Villager</span>`
        app.p2.zones["0"] = util.makeCard(card_list, "goblin", "enemy-card-0")
        app.p2.zones["1"] = util.makeCard(card_list, "troll_cub", "enemy-card-1")
        app.p2.zones["2"] = util.makeCard(card_list, "goblin", "enemy-card-2")
        app.p2.zones["3"] = util.makeCard(card_list, "hobgoblin", "enemy-card-3")

        app.p1.zones["0"] = util.makeCard(card_list, "villager", "player-card-0")
        app.p1.zones["0"].atk = 1400
        app.p1.zones["0"].effs = ["ward"]
        app.p1.zones["1"] = util.makeCard(card_list, "villager", "player-card-1")
        app.p1.zones["2"] = util.makeCard(card_list, "militia", "player-card-2")
            ;
        ["ballista", "sns"]
            .forEach((c, i) => {
                const card = util.makeCard(card_list, c, "player-card-" + i + 5)
                app.p1.hand.push(card)
            })
    }

    evaluateSuccess() {
        return util.getUnits(this.app, "p2").length === 0
    }
}