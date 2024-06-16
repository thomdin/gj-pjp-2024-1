import Duel from "../app.js"
import util from "../util.js"

export default {
    pop_unit: {
        isAllowed: (app) => {
            return util.boardHasEnemyUnits(app) || util.boardHasPlayerUnits(app)
        },
        execute: (app, p_key) => {
            if (!app)
                throw new Error(`app must not be null.`)

            if (p_key !== "p1" && p_key !== "p2")
                throw new Error("Invalid value for p_key")

            return new Promise((resolve, reject) => {
                app.requestSelectUnit(app.turn.p_key)
                    .then(e => {
                        const card = app[e.p_key].zones[e.zone_idx]
                        if (!card)
                            throw new Error(`No card on field ${e.p_key}.${e.zone_idx}.`)

                        app.destroy(e.p_key, e.zone_idx)
                        resolve()
                    })
            })
        },
    },
    raise_atk: {
        isAllowed: (app) => {
            return util.boardHasEnemyUnits(app) || util.boardHasPlayerUnits(app)
        },
        execute: (app, p_key, value) => {
            if (!app)
                throw new Error(`app must not be null.`)
            if (p_key !== "p1" && p_key !== "p2")
                throw new Error("Invalid value for p_key")

            return new Promise((resolve, reject) => {
                app.requestSelectUnit(app.turn.p_key)
                    .then(e => {
                        const target_card = app[e.p_key].zones[e.zone_idx]
                        if (!target_card)
                            throw new Error(`No card on field ${e.p_key}.${e.zone_idx}.`)
                        target_card.atk += parseInt(value)
                        app.fireEvent("card_changed", { p_key: e.p_key, zone_idx: e.zone_idx, card: target_card })
                        resolve()
                    })
            })

        }
    },
    ward: {
        isAllowed: (app) => {
            return util.boardHasEnemyUnits(app) || util.boardHasPlayerUnits(app)
        },
        execute: (app, p_key, value) => {
            if (!app)
                throw new Error(`app must not be null.`)
            if (p_key !== "p1" && p_key !== "p2")
                throw new Error("Invalid value for p_key")

            return new Promise((resolve, reject) => {
                app.requestSelectUnit(app.turn.p_key)
                    .then(e => {
                        const target_card = util.getCardFromBoard(app, e.p_key, e.zone_idx)
                        if (!target_card)
                            throw new Error(`No card on field ${e.p_key}.${e.zone_idx}.`)
                        target_card.effs.push("ward")
                        app.fireEvent("card_changed", { p_key: e.p_key, zone_idx: e.zone_idx, card: target_card })
                        resolve()
                    })
            })

        }

    },
    provoke: {
        isAllowed: () => {
            return util.boardHasPlayerUnits(app)
        },
        execute: (app, p_key) => {
            return new Promise((resolve, reject) => {
                app.requestSelectUnit(app.turn.p_key, p_key)
                    .then(e => {
                        const target_card = util.getCardFromBoard(app, e.p_key, e.zone_idx)
                        if (!target_card)
                            throw new Error(`No card on field ${e.p_key}.${e.zone_idx}.`)
                        target_card.effs.push("provoke")
                        app.fireEvent("card_changed", { p_key: e.p_key, zone_idx: e.zone_idx, card: target_card })
                        resolve()
                    })
            })

        }
    },
}