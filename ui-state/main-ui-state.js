import CardEffects from '../app/card-effects/card-effects.js'
import ContextMenuUIState from './context-menu-ui-state.js'
import SelectUnitUIState from './select-unit-ui-state.js'
import SelectZoneUIState from './select-zone-ui-state.js'

export default class MainUIState {
    constructor(board_ui, app) {
        if (app.turn.p_key !== "p1")
            throw new Error("State not be callable in this player turn")

        this.board_ui = board_ui
        this.app = app
        this.allowedActions = this.app.allowedActions()
    }

    clickAny(e) {
        return
    }

    clickUnitZone(e, zone_idx) {
        const zone_node = e.target.closest('.zone')
        if (!zone_node)
            return
        const card = this.app.p1.zones[zone_idx]

        if (!card)
            return

        const card_node = zone_node.querySelector('.card');
        if (!card_node)
            throw new Error("Card exists in duel but not as HTMLElement.")

        const card_ui = this.board_ui.ui_elem.p1.zones[zone_idx]
        if (!card_ui)
            throw new Error("Card exists in duel but not as UI Element.")

        if (!this.allowedActions.p1.field.some(([action, card]) => card.uid === card_ui.card.uid))
            return

        card_ui.openContextMenu({
            initiateAttack: () => {
                this.app.initiateAttack("p1", zone_idx)
                const opponent_units = Object.keys(this.app.p2.zones)
                    .filter(i => this.app.p2.zones[i] !== null && this.app.p2.zones[i] !== undefined)
                if (opponent_units.length === 0) {
                    this.board_ui.nextUIState(new MainUIState(this.board_ui, this.app))
                    return
                }
                this.board_ui.nextUIState(new SelectUnitUIState(this.board_ui, this.app, (p_key, zone_idx) => {
                    this.app.attack("p2", zone_idx)
                    this.board_ui.nextUIState(new MainUIState(this.board_ui, this.app))
                }, { field: "p2" }))
            }
        })

        this.board_ui.nextUIState(new ContextMenuUIState(this.board_ui, this.app, this, card_ui))
    }

    clickOpponentZone(e, zone_idx) {
        return
    }

    clickActionZone(e) {
        return
    }

    clickHand(e) {
        const card_node = e.target.closest(".card")
        if (!card_node)
            return

        const card_ui = this.board_ui.ui_elem.p1.hand[card_node.id]
        if (!card_ui)
            throw new Error("Card UI Element is not in hand.")

        //not allowed
        if (!this.allowedActions.p1.hand.some(([action, card]) => card.uid === card_ui.card.uid))
            return

        if (card_ui.card.type === "action") {
            this.#clickHandActionCard(card_ui)
        } else if (card_ui.card.type === "unit") {
            this.#clickHandUnitCard(card_ui)
        } else {
            throw new Error(`Unkown type of card. ${card_ui.card.type}`)
        }
    }

    #clickHandUnitCard(card_ui) {
        card_ui.openContextMenu({
            place: () => {
                card_ui.closeContextMenu()
                this.board_ui.nextUIState(new SelectZoneUIState(this, this.app, (zone_idx) => {
                    this.app.placeCardFromHand("p1", card_ui.uid, zone_idx)
                    this.board_ui.nextUIState(new MainUIState(this.board_ui, this.app))
                }, { p_key: "p1" }))
            }
        })

        this.board_ui.nextUIState(new ContextMenuUIState(this.board_ui, this.app, this, card_ui))
    }

    #clickHandActionCard(card_ui) {
        const [action, card] = this.allowedActions.p1.hand.filter(([action, card]) => card.uid === card_ui.uid).pop()
        if (!action || !card)
            throw new Error("Card action is not allowed.")

        if (!action in CardEffects)
            throw new Error(`Unknown action ${action}.`)

        card_ui.openContextMenu({
            activate: () => {
                this.app.playAction("p1", card_ui.card)
                card_ui.closeContextMenu()
            }
        })

        this.board_ui.nextUIState(new ContextMenuUIState(this.board_ui, this.app, this, card_ui))
    }
}