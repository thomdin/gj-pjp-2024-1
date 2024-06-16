import LockedUIState from '../ui-state/locked-ui-state.js'
import MainUIState from '../ui-state/main-ui-state.js'
import CardUI from './card.js'
export default class BoardUI {

  constructor(app) {
    this.app = app
    this.main_node = document.createElement("div")
    this.attacker_card_ui = null
    this.ui_state = null
    this.ui_action = {
      current: "default",
      options: {
        default: "default", selectAttackTarget: "selectAttackTarget"
      }
    }
    this.ui_elem = {
      p1: {
        hand: [],
        zones: { 0: null, 1: null, 2: null, 3: null },
        action: null
      },
      p2: {
        hand: [],
        zones: { 0: null, 1: null, 2: null, 3: null },
        action: null
      }
    },
      this.main_node.innerHTML = `
			<div class="duel-container">
        <div class="objective">
          <p style="border-bottom:1px solid;padding:10px 0;margin-bottom:20px">Wave Nr.: <span id="lv-number"></span></p><p id="objective"></p>
          <p id="objective-additional" style="display:none;font-size:18px;margin-top:14px;text-decoration:underline">Mouseover cards to check for effects.</p>
        </div>
        <div class="desk">
          <div class="board" id="board">
            <div class="row">
              <div class="field" id="field-p2">
                <div><div class="zone" id="zone-p2-3"></div></div>
                <div><div class="zone" id="zone-p2-2"></div></div>
                <div><div class="zone" id="zone-p2-1"></div></div>
                <div><div class="zone" id="zone-p2-0"></div></div>
              </div>
              <div class="spacer"></div>
            </div>
            <hr style="width: 100%; margin: 30px 0"/>

            <div class="row">
              <div class="field" id="field-p1">
                <div><div class="zone" id="zone-p1-0"></div></div>
                <div><div class="zone" id="zone-p1-1"></div></div>
                <div><div class="zone" id="zone-p1-2"></div></div>
                <div><div class="zone" id="zone-p1-3"></div></div>
              </div>
              <div id="action-zone-p1" class="zone action-zone"></div>
            </div>
            <div class="hand" id="hand-p1"></div>
          </div>
          <footer style="text-align:right">
            <button class="btn" id="end-turn">Submit</button>
          </footer>
        </div>
        <div id="win-message">
          <div>
            <header>
              <span id="winning-player"></span> wins
            </header>
            <button onclick="location.reload()">Restart</button>
          </div>
        </div>
      </div>
			`
  }

  /**
   * 
   * @param {HTMLElement} dom_element 
   */
  attachTo(dom_element) {
    dom_element.appendChild(this.main_node)
    this.nodes = {
      p1: {
        hand: document.getElementById('hand-p1'),
        field: document.getElementById('field-p1'),
        zones: {
          0: document.getElementById('zone-p1-0'),
          1: document.getElementById('zone-p1-1'),
          2: document.getElementById('zone-p1-2'),
          3: document.getElementById('zone-p1-3'),
        },
        action: document.getElementById('action-zone-p1'),
      },
      p2: {
        hand: document.getElementById('hand-p2'),
        field: document.getElementById('field-p2'),
        zones: {
          0: document.getElementById('zone-p2-0'),
          1: document.getElementById('zone-p2-1'),
          2: document.getElementById('zone-p2-2'),
          3: document.getElementById('zone-p2-3'),
        },
        action: document.getElementById('action-zone-p2'),
      },
      objective: document.getElementById('objective'),
      lv_number: document.getElementById('lv-number'),
      btn_end_turn: document.getElementById('end-turn')
    }

    // handle click on board
    document.addEventListener("mouseup", e => {
      this.ui_state.clickAny(e)
    })

    // handle click in hand
    this.nodes.p1.hand.addEventListener("click", e => {
      this.ui_state.clickHand(e)
    })

    // handle click on p1 field zone
    Object.keys(this.nodes.p1.zones).forEach(zone_idx => {
      const zone = this.nodes.p1.zones[zone_idx]
      zone.addEventListener('click', e => {
        this.ui_state.clickUnitZone(e, zone_idx)
      })
    })

    // handle click on p2 field zone
    Object.keys(this.nodes.p2.zones).forEach(zone_idx => {
      const zone = this.nodes.p2.zones[zone_idx]
      zone.addEventListener('click', e => {
        this.ui_state.clickOpponentZone(e, zone_idx)
      })
    })

    // render cards on level change
    this.app.on("level_changed", e => {
      const renderZones = (p_key) => {
        Object.keys(this.nodes[p_key].zones).forEach(i => {
          if (!this.app[p_key].zones[i]) {
            this.nodes[p_key].zones[i].innerHTML = ''
            return
          }

          const card_ui = new CardUI(this.app[p_key].zones[i])
          this.ui_elem[p_key].zones[i] = card_ui
          this.nodes[p_key].zones[i].innerHTML = ''
          this.nodes[p_key].zones[i].appendChild(card_ui.main_node)
        })

      }
      renderZones("p1");
      renderZones("p2");

      this.nodes.p1.hand.innerHTML = ''
      this.app.p1.hand.forEach(card => {
        const card_ui = new CardUI(card)
        this.ui_elem.p1.hand[card.uid] = card_ui
        const div = document.createElement("div")
        div.appendChild(card_ui.main_node)
        this.nodes.p1.hand.appendChild(div)
      })

      this.nextUIState(new MainUIState(this, this.app))
      this.nodes.objective.innerHTML = this.app.level.objectiveText
      this.nodes.lv_number.innerText = this.app.level.lv_number
      if(this.app.level.lv_number > 1)
        document.getElementById('objective-additional').style.display = "block"
      if (this.app.level.notice)
        alert(this.app.level.objectiveText)
    })

    this.nodes.btn_end_turn.addEventListener('click', () => {
      this.app.nextTurn()
    })

    this.app.on("card_changed", e => {
      const card_ui = new CardUI(e.card)
      this.ui_elem[e.p_key].zones[e.zone_idx] = card_ui
      this.nodes[e.p_key].zones[e.zone_idx].innerHTML = ''
      this.nodes[e.p_key].zones[e.zone_idx].appendChild(card_ui.main_node)
    })

    this.app.on("level_failed", (e) => {
      window.alert("You failed.\nLevel will be restarted")
      this.app.setLevel(e.lv_number)
      this.ui_state = new MainUIState(this, this.app)
    })

    this.app.on("level_success", e => {

      if (e.lv_number === 5) {
        alert("You cleared all waves!\nThank you for playing.")
        this.app.setLevel(1)
        this.ui_state = new MainUIState(this, this.app)
        return
      }
      window.alert("Correct.")
      this.app.setLevel(e.lv_number += 1)
      this.ui_state = new MainUIState(this, this.app)
    })

    this.app.on("place", e => {
      this.placeFromHand(e.p_key, e.card.uid, e.zone)
    })
  }

  /**
   * 
   * @param {string} p_key 
   * @param {Array<CardUI>} card_ui 
   */
  draw(p_key, card_ui_list) {
    card_ui_list.forEach(card_ui => {
      this.ui_elem[p_key].hand[card_ui.uid] = card_ui
      const wrap = document.createElement("div")
      wrap.appendChild(card_ui.main_node)
      this.nodes[p_key].hand.appendChild(wrap)
    })

    if (p_key === "p1") {
      this.nextUIState(new MainUIState(this, this.app))
    }
  }

  /**
   * 
   * @param {string} p_key 
   * @param {string} card_uid 
   * @param {number} zone_idx 
   */
  placeFromHand(p_key, card_uid, zone_idx) {
    const card_ui = this.ui_elem[p_key].hand[card_uid]
    if (!card_ui)
      throw new Error("Card is not in hand")

    const node = document.getElementById(card_uid)
    const parent = node.parentNode
    if (card_ui.card.type === "action") {
      this.nodes[p_key].action.appendChild(node)
      parent.remove()
      this.ui_elem[p_key].action = card_ui
    }
    else {
      this.nodes[p_key].zones[zone_idx].appendChild(node)
      parent.remove()
      this.ui_elem[p_key].zones[zone_idx] = card_ui
    }
  }

  /**
   * 
   * @param {card} card 
   */
  destroyCard(card) {
    const card_node = document.getElementById(card.uid)
    card_node.remove()
  }


  nextUIState(state) {
    if (!state)
      throw new Error("state must not be null.")
    this.ui_state = state
    console.log(`switched state ${state.constructor.name}`)
    this.highlightAllowedActions(this.ui_state.allowedActions)
  }

  highlightAllowedActions(actions) {
    document.querySelectorAll('.highlight').forEach(node => node.classList.remove('highlight'))
    if (this.ui_state instanceof LockedUIState) {
      return
    }
    actions.p1.hand
      .concat(actions.p1.field)
      .concat(actions.p2.field)
      .forEach(([action, card]) => {
        const node = document.getElementById(card.uid)
        if (!node)
          throw new Error(`Node for card ${card.title}:${card.uid} does not exist.`)
        node.classList.add("highlight")
      })

    if (actions.p1.zones)
      actions.p1.zones.forEach(zone_idx => this.nodes.p1.zones[zone_idx].classList.add('highlight'))
    if (actions.p2.zones)
      actions.p2.zones.forEach(zone_idx => this.nodes.p2.zones[zone_idx].classList.add('highlight'))
  }
}
