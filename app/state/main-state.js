import CardEffects from "../card-effects/card-effects.js"

export default class MainState {
    constructor(duel) {
        this.duel = duel
    }

    allowedActions() {
        const p_key = this.duel.turn.p_key
        const allowed = {
            p1: {
                hand: [],
                field: []
            },
            p2: {
                hand: [],
                field: []
            }
        }

        // hand        
        this.duel[p_key].hand.forEach(card => {
            if (card.type === "unit") {
                allowed[p_key].hand.push(["place", card])
            } else if (card.type === "action") {
                const has_unallowed = card.actions.some(action => !CardEffects[action.type].isAllowed(this.duel))
                if (has_unallowed)
                    return
                allowed[p_key].hand.push(["activate", card])
            }
            else {
                throw new Error("Unknown type for card. " + card.type)
            }
        })

        // field
        if(this.duel.turn.count === 0)
            return allowed

        Object.values(this.duel[p_key].zones).forEach(card => {
            if (!card)
                return
            if (this.duel.turn.has_attacked.includes(card.uid))
                return
            allowed[p_key].field.push(['attack', card])
        })

        return allowed
    }
}