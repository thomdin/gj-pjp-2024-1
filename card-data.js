export default {
	"goblin": {
		"title": "Goblin",
		"type": "unit",
		"atk": 1000
	},
	"orc": {
		"title": "Orc",
		"type": "unit",
		"atk": 1200
	},
	"troll_cub": {
		"title": "Troll Cub",
		"type": "unit",
		"atk": 1400
	},
	"hobgoblin": {
		"title": "Hobgoblin",
		"type": "unit",
		"atk": 2000,
	},
	"villager": {
		"title": "Villager",
		"type": "unit",
		"atk": 600,
	},
	"militia": {
		"title": "Militia",
		"type": "unit",
		"atk": 1300,
	},
	"kamikaze": {
		title: "Kamikaze",
		type: "unit",
		"atk": 100,
		description: "When this unit attacks an enemy unit, destroy this unit and the enemy unit.",
		effs: ["kamikaze"]
	},
	"ballista": {
		"title": "Ballista",
		"type": "action",
		"description": "Destroy 1 unit.",
		"actions": [{
			"type": "pop_unit",
		}]
	},
	"gs": {
		"title": "Great Sword",
		"type": "action",
		"description": "Select 1 unit. It gains 700 ATK",
		"actions": [{
			"type": "raise_atk",
			"value": 700
		}]
	},
	"sns": {
		"title": "Sword",
		"type": "action",
		"description": "Select 1 unit. It gains 400 ATK",
		"actions": [{
			"type": "raise_atk",
			"value": 400
		}],
	},
	"ward": {
		"title": "Ward 2X",
		"type": "action",
		"description": "Select 1 unit, it gains 2 wards. if the selected unit would be destroyed destroy a ward instad.",
		"actions": [{
			"type": "ward"
		}, {
			"type": "ward"
		}]
	},
	"provoke": {
		"title": "Provoke",
		"description": "Select 1 of your units. All opponents wil attack this unit next turn.",
		"type": "action",
		"actions": [{
			"type": "provoke"
		}]
	}
}
