import MainUIState from "./main-ui-state.js"

export default class SelectZoneUIState {
    constructor(board_ui, app, callback, restrictions) {
        this.restrictions = restrictions
        this.board_ui = board_ui
        this.app = app
        this.callback = callback
        if (!callback)
            throw new Error("A callback must be defined.")

        this.allowedActions = {
            p1: {
                hand: [],
                field: [],
                zones: []
            },
            p2: {
                hand: [],
                field: [],
                zones: []
            }
        }

        Object.keys(this.app.p1.zones).forEach(zone_idx => {
            if (!this.app.p1.zones[zone_idx])
                this.allowedActions.p1.zones.push(zone_idx)
        })
    }

    clickAny(e) {
        return
    }

    clickUnitZone(e, zone_idx) {
        this.callback(zone_idx)
    }

    clickOpponentZone(e, zone_idx) {
        return
    }

    clickActionZone(e) {
        return
    }

    clickHand(e) {
        return
    }
}