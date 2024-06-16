export default {
    boardHasPlayerUnits: (app) => {
        return Object.values(app.p1.zones)
            .filter(z => z !== null && z !== undefined)
            .length > 0
    },
    boardHasEnemyUnits: (app) => {
        return Object.values(app.p2.zones)
            .filter(z => z !== null && z !== undefined)
            .length > 0
    },
    makeCard: (card_list, card_name, uid) => {
        const card = structuredClone(card_list[card_name])
        card.effs = card.effs ? card.effs : []
        card.uid = uid
        return card
    },
    getCardFromBoard(app, p_key, zone_idx) {
        const target_card = app[p_key].zones[zone_idx]
        return target_card
    },
    getUnitsSortedByAtk(app, p_key) {
        if (!p_key)
            throw new Error("p_key must not be null or undefined.")
        const result = Object.keys(app[p_key].zones)
            .filter(i => app[p_key].zones[i] !== null)
            .map(i => {
                return { card: app[p_key].zones[i], "zone_idx": i, p_key: p_key }
            })
        result.sort((a, b) => a.card.atk > b.card.atk ? 0 : 1)
        return result

    },
    getUnits(app, p_key) {
        if (!p_key)
            throw new Error("p_key must not be null or undefined.")
        return Object.keys(app[p_key].zones)
            .filter(i => app[p_key].zones[i] !== null)
            .map(i => {
                return { card: app[p_key].zones[i], "zone_idx": i, p_key: p_key }
            })
    }
}