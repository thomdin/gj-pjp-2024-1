import card_data from './card-data.js'
import App from './app/app.js'
import BoardUI from './ui-modules/board.js'
import CardUI from './ui-modules/card.js'
import MainUIState from './ui-state/main-ui-state.js'
import SelectUnitUIState from './ui-state/select-unit-ui-state.js'
import LockedUIState from './ui-state/locked-ui-state.js'
import Level1 from './level/level-1.js'
import util from './app/util.js'
import Level2 from './level/level-2.js'

const app = new App(
  card_data,
)


window.app = app

app.enableEventDebugMessages()

const board_ui = new BoardUI(app)
board_ui.attachTo(document.getElementById('app'))
app.setLevel(1)

app.on("place_action", e => {
  board_ui.placeFromHand(e.p_key, e.card.uid, e.zone)
})

app.on("card_destroyed", e => {
  board_ui.destroyCard(e.card)
})

app.on("action_resolved", e => {
  board_ui.nextUIState(new MainUIState(board_ui, app))
  board_ui.nodes[e.p_key].action.innerHTML = ''
})

app.on("request_select_unit", e => {
  board_ui.nextUIState(new SelectUnitUIState(board_ui, app, (p_key, zone_idx) => {
    app.selectUnit(p_key, zone_idx)
  }, e))
})

app.on("finished", () => {
  board_ui.nextUIState(new LockedUIState())
})

app.start()
board_ui.nextUIState(new MainUIState(board_ui, app))