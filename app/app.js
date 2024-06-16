import Level1 from "../level/level-1.js"
import Level2 from "../level/level-2.js"
import Level3 from "../level/level-3.js"
import Level4 from "../level/level-4.js"
import Level5 from "../level/level-5.js"
import CardEffects from "./card-effects/card-effects.js"
import MainState from "./state/main-state.js"
import SelectUnitState from "./state/select-unit-state.js"

/**
 * Duel logic, detached from the UI
 */
export default class App {

  constructor(card_list) {

    this.reset()

    this.event_register = {
      shuffle: [],
      place: [],
      place_action: [],
      action_resolved: [],
      start: [],
      initiate_attack: [],
      attack: [],
      lp_updated: [],
      card_destroyed: [],
      attack_finished: [],
      finished: [],
      select_unit: [],
      request_select_unit: [],
      card_changed: [],
      ward_destroyed: [],
      level_changed: [],
      level_failed: [],
      level_success: []
    }

    this.state = new MainState(this)
  }

  reset() {
    this.level = null
    this.turn = {
      count: 1,
      p_key: "p1",
      card_attacks: null,
      has_attacked: []
    }

    this.p1 = {
      hand: [],
      zones: { 0: null, 1: null, 2: null, 3: null },
      action: null,
      lp: 4000
    }

    this.p2 = {
      hand: [],
      zones: { 0: null, 1: null, 2: null, 3: null },
      action: null,
      lp: 4000
    }

    this.turn_data = {
      turn: this.turn,
      p1: this.p1,
      p2: this.p2
    }
  }

  /**
   * @returns void
   */
  start() {
    this.fireEvent("start")
  }

  /**
   * 
   * @param {string} p_key 
   */
  shuffleDeck(p_key) {
    if (!this[p_key].deck)
      throw new Error("Invalid p_key.")
    this.#shuffleArray(this[p_key].deck)
    this.fireEvent("shuffle", { p_key: p_key })
  }


  /**
   * 
   * @param {string} p_key 
   */
  isTurn(p_key) {
    if (p_key !== "p1" && p_key !== "p2")
      throw new Error(`Invalid value for p_key ${p_key}. Allowed: p1, p2`)
    return this.turn.p_key === p_key
  }

  /**
   * 
   * @param {string} p_key 
   * @param {string} uid 
   * @returns void
   */
  placeCardFromHand(p_key, uid, zone_idx) {
    if (p_key !== this.turn.p_key) {
      throw new Error(`${p_key} cannot place: Not your turn.`)
    }
    const card = this[p_key].hand.filter(c => c.uid == uid).pop()
    if (!card)
      throw new Error(`The card of uid ${uid} is not in the hand of player ${p_key}.`)

    if (card.type !== "unit")
      throw new Error(`Can only place unit cards. Given card type: ${card.type}`)

    if (this[p_key].zones[zone_idx] !== null) {
      throw new Error("Zone is already in use.")
    }

    const hand = this[p_key].hand
    for (let i = 0; i < hand.length; i++) {
      const c = this[p_key].hand[i]
      if (c.uid == uid) {
        const card = this[p_key].hand.splice(i, 1).pop()
        this[p_key].zones[zone_idx] = card
        this.fireEvent("place", { p_key: p_key, card: card, zone: zone_idx })
        return zone_idx
      }
    }
  }

  /**
   * 
   * @param {string} p_key 
   * @param {number} zone_idx 
   */
  initiateAttack(p_key, zone_idx) {
    if (p_key !== this.turn.p_key)
      throw new Error(`${p_key} cannot attack: Not your turn.`)
    const card = this[p_key].zones[zone_idx]
    if (!card)
      throw new Error(`There is no card in the zone ${zone_idx} of ${p_key}.`)

    if (this.turn.has_attacked.includes(card.uid))
      throw new Error("The card has already attacked.")

    if (this.turn.count === 0)
      throw new Error("Not allowed to attack in turn 0")

    this.turn.card_attacks = {
      zone_idx: zone_idx,
      card: card
    }

    const enemy_key = p_key === "p1" ? "p2" : "p1"
    const enemy_unit_zones = Object.keys(this[enemy_key].zones)
      .filter(idx => {
        return (this[enemy_key].zones[idx] !== null && this[enemy_key].zones[idx] !== undefined)
      })

    this.fireEvent("initiate_attack",
      { p_key: p_key, zone: zone_idx, card: card, enemy_unit_zones: enemy_unit_zones })

    if (enemy_unit_zones.length === 0) {
      this.#directAttack()
      return
    }

    this.state = new SelectUnitState(this, { field: "p2" })
  }

  #directAttack() {
    const p_key = this.turn.p_key === "p1" ? "p2" : "p1"
    this.turn.has_attacked.push(this.turn.card_attacks.card.uid)
    this.turn.card_attacks = null
  }

  /**
   * 
   * @param {string} p_key 
   * @param {number} zone_idx 
   * @returns 
   */
  attack(p_key, zone_idx) {
    if (p_key === this.turn.p_key)
      throw new Error(`Cannot attack ${p_key}.`)

    const atk_data = this.turn.card_attacks
    atk_data.p_key = this.turn.p_key
    const card = this[p_key].zones[zone_idx]
    if (!card)
      throw new Error(`No unit to attack on zone ${p_key}.${zone_idx} `)

    atk_data.card = this[atk_data.p_key].zones[atk_data.zone_idx]
    const def_data = {
      p_key: p_key,
      card: card,
      zone_idx: zone_idx
    }

    if (this.turn.has_attacked.includes(atk_data.card.uid))
      throw new Error("The card has already attacked.")

    this.fireEvent("attack", { atk_data: atk_data, def_data: def_data })
    this.turn.has_attacked.push(atk_data.card.uid)
    let battle_data = { atk_data: atk_data, def_data: def_data }
    this.turn.card_attacks = null

    if (atk_data.card.effs.includes("kamikaze")) {
      this.destroy(atk_data.p_key, atk_data.zone_idx)
      this.destroy(def_data.p_key, def_data.zone_idx)
      this.fireEvent("attack_finished", battle_data)
      this.state = new MainState(this)
      return battle_data
    }

    const diff = atk_data.card.atk - def_data.card.atk
    if (diff === 0) {
      // draw
      this.destroy(atk_data.p_key, atk_data.zone_idx)
      this.destroy(def_data.p_key, def_data.zone_idx)
      this.fireEvent("attack_finished", battle_data)
      this.state = new MainState(this)
      return battle_data
    }

    else if (diff < 0) {
      // Win defender
      this.destroy(atk_data.p_key, atk_data.zone_idx)
      this.fireEvent("attack_finished", battle_data)
      this.state = new MainState(this)
      return battle_data
    }
    else {
      // Win attacker
      this.destroy(def_data.p_key, def_data.zone_idx)
      this.fireEvent("attack_finished", battle_data)
      this.state = new MainState(this)
      return battle_data
    }
  }


  /**
   * 
   * @param {string} p_key 
   * @param {number} zone_idx
   */
  destroy(p_key, zone_idx) {
    const card = this[p_key].zones[zone_idx]
    if (!card)
      throw new Error(`No card on field ${p_key}.${zone_idx}.`)


    if (card.effs.includes("ward")) {
      const i = card.effs.indexOf("ward")
      card.effs.splice(i, 1)
      this.fireEvent("ward_destroyed", { p_key: p_key, zone_idx: zone_idx, card: card })
      this.fireEvent("card_changed", { p_key: p_key, zone_idx: zone_idx, card: card })
      return
    }

    this[p_key].zones[zone_idx] = null
    this.fireEvent("card_destroyed", { p_key: p_key, zone_idx: zone_idx, card: card })
  }

  playAction(p_key, card) {
    if (p_key !== "p1" && p_key !== "p2")
      throw new Error("Invalid p_key")
    if (card.type !== "action")
      throw new Error(`Can only play cards of type action. Given type: ${card.type}`)

    this[p_key].hand = this[p_key].hand.filter(c => c.uid !== card.uid)
    this[p_key].action = card;
    this.fireEvent("place_action", { p_key: p_key, card: card })

    let resolved_actions = 0
    card.actions.forEach(action => {
      if (!(action.type in CardEffects))
        throw new Error(`Unknown action ${action.type}`)

      const action_obj = CardEffects[action.type]
      if (!action_obj.isAllowed(this))
        throw new Error(`Action ${action.type} is not allowed.`)

      action_obj.execute(this, p_key, action.value)
        .then(() => {
          resolved_actions++
          if (resolved_actions < card.actions.length)
            return

          this.fireEvent("action_resolved", { p_key: p_key, card: card })
          this.action = null
        })
    })
  }

  /**
   * @returns void
   */
  nextTurn() {
    if (this.level.evaluateSuccess()) {
      this.fireEvent("level_success", { lv_number: this.level.lv_number })
      return
    }

    this.fireEvent("level_failed", { lv_number: this.level.lv_number })
  }

  requestSelectUnit(p_requestfrom, field) {
    this.state = new SelectUnitState(this, { p_requestfrom: p_requestfrom, field: field })
    this.fireEvent("request_select_unit", { p_requestfrom: p_requestfrom, field: field })
    return new Promise((resolve, reject) => {
      this.on("select_unit", (e) => {
        resolve(e);
      })
    })
  }

  setLevel(lv_number) {
    if (!parseInt(lv_number))
      throw new Error("Level number must be greater than 0")
    this.reset()
    if (lv_number === 1) {
      this.level = new Level1(this)
    } else if (lv_number === 2) {
      this.level = new Level2(this)
    } else if (lv_number === 3) {
      this.level = new Level3(this)
    } else if (lv_number === 4) {
      this.level = new Level4(this)
    } else if (lv_number === 5) {
      this.level = new Level5(this)
    } else {
      throw new Error(`There is no level ${lv_number}`)
    }
    this.fireEvent("level_changed")
  }


  /**
   * 
   * @param {string}} p_key 
   * @param {number} zone_idx 
   */
  selectUnit(p_key, zone_idx) {
    this.state.selectUnit(p_key, zone_idx)
  }

  /**
   * 
   * @param {string} event_key 
   * @param {any} event_args 
   * @returns void
   */
  fireEvent(event_key, event_args) {
    const subscribers = this.event_register[event_key]
    if (subscribers === undefined) {
      throw new Error(`Event "${event_key}" does not exist.`)
    }
    subscribers.map(sub => {
      sub(event_args)
    })
  }

  /**
   * 
   * @param {string} event_key 
   * @param {function} callback 
   */
  on(event_key, callback, identifier = null) {
    if (!this.event_register[event_key]) {
      throw new Error(`Event "${event_key}" does not exist.`)
    }

    if (identifier)
      this.event_register[event_key][identifier] = callback
    else
      this.event_register[event_key].push(callback)
  }

  offEvent(event_key, callback) {
    if (!event_key in this.event_register)
      throw new Error(`Event "${event_key}" does not exist.`)
    if (!callback in this.event_register[event_key])
      throw new Error(`Listener ${callback} for event "${event_key}" does not exist.`)

    const array = this.event_register[event_key]
    const index = array.indexOf(5);
    if (index > -1) { // only splice array when item is found
      array.splice(index, 1); // 2nd parameter means remove one item only
    }
  }

  allowedActions() {
    return this.state.allowedActions(this)
  }

  /**
   * @returns void
   */
  enableEventDebugMessages() {
    this.on("start",
      e => console.log(`Duel started.`))
    this.on("place",
      e => console.log(`${e.card.title} placed on zone ${e.zone}.`))
    this.on("place_action",
      e => console.log(`${e.p_key} placed action card ${e.card.title}`))
    this.on("action_resolved",
      e => console.log(`${e.p_key} resolved action ${e.card.title}.`))
    this.on("initiate_attack",
      e => console.log(`${e.card.title} on zone ${e.p_key} ${e.zone} initates an attack. Enemy units: [${e.enemy_unit_zones.join(',')}]`))
    this.on("request_select_unit",
      e => console.log(`${e.p_requestfrom} has to select a unit. Field restriction: ${e.field ? e.field : 'none'}`))
    this.on("attack",
      e => console.log(`${e.atk_data.card.title} attacks ${e.def_data.card.title}`))
    this.on("card_destroyed",
      e => console.log(`${e.card.title} destroyed on zone ${e.p_key}.${e.zone_idx}`))
    this.on("select_unit",
      e => console.log(`${e.card.title} selected on zone ${e.p_key}.${e.zone_idx}`))
    this.on("ward_destroyed",
      e => console.log("Ward was destroyed."))
    this.on("attack_finished", e => {
      if (e.result === "draw")
        console.log("It's a draw.")
      else if (e.result === "win_defender")
        console.log("Defender wins.")
      else if (e.result === "win_attacker")
        console.log("Attacker wins.")
      this.on("level_changed",
        () => console.log("Level changed."))
    })

    this.on("card_changed",
      e => console.log(`Card changed ${JSON.stringify(e)}`))

    this.on("finished",
      e => console.log(`${e.winner} is the winner.`))
  }

  #shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  }
}

