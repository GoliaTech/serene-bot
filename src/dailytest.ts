enum rarities {
	common = "common", uncommon = "uncommon", rare = "rare", epic = "epic", mythical = "mythical", legendary = "legendary", ancient = "ancient"
};

enum rewardTypes {
	common_currency = "common_currency", premium_currency = "premium_currency", xp = "xp", materials = "material", lootbox_key = "lootbox_key"
};

enum lootboxKeys {
	common = "common", rare = "rare", epic = "epic", mythical = "mythical", legendary = "legendary", ancient = "ancient"
};

const rewardPool = {
	"common": {
		"common_currency": [100, 150, 200],
		"premium_currency": [1, 3, 5],
		"xp": [10, 15, 20],
		"material": [
			{ type: "wood", amount: 5 },
			{ type: "stone", amount: 5 },
			{ type: "metal", amount: 5 }
		],
		"lootbox_key": [
			{ rarity: lootboxKeys.common, amount: 1 },
			{ rarity: lootboxKeys.common, amount: 2 },
			{ rarity: lootboxKeys.common, amount: 3 }
		]
	},
	"uncommon": {
		"common_currency": [200, 250, 300],
		"premium_currency": [5, 7, 10],
		"xp": [20, 25, 30],
		"material": [
			{ type: "wood", amount: 10 },
			{ type: "stone", amount: 10 },
			{ type: "metal", amount: 10 }
		],
		"lootbox_key": [
			{ rarity: lootboxKeys.common, amount: 3 },
			{ rarity: lootboxKeys.rare, amount: 1 },
			{ rarity: lootboxKeys.rare, amount: 2 }
		]
	},
	"rare": {
		"common_currency": [300, 350, 400],
		"premium_currency": [10, 13, 15],
		"xp": [30, 35, 40],
		"material": [
			{ type: "wood", amount: 15 },
			{ type: "stone", amount: 15 },
			{ type: "metal", amount: 15 }
		],
		"lootbox_key": [
			{ rarity: lootboxKeys.epic, amount: 1 },
			{ rarity: lootboxKeys.rare, amount: 3 },
			{ rarity: lootboxKeys.rare, amount: 2 }
		]
	},
	"epic": {
		"common_currency": [400, 450, 500],
		"premium_currency": [15, 18, 20],
		"xp": [40, 45, 50],
		"material": [
			{ type: "wood", amount: 20 },
			{ type: "stone", amount: 20 },
			{ type: "metal", amount: 20 }
		],
		"lootbox_key": [
			{ rarity: lootboxKeys.epic, amount: 1 },
			{ rarity: lootboxKeys.mythical, amount: 1 },
			{ rarity: lootboxKeys.epic, amount: 2 }
		]
	},
	"mythical": {
		"common_currency": [500, 750, 1000],
		"premium_currency": [20, 40, 60],
		"xp": [50, 75, 100],
		"material": [
			{ type: "wood", amount: 40 },
			{ type: "stone", amount: 40 },
			{ type: "metal", amount: 40 }
		],
		"lootbox_key": [
			{ rarity: lootboxKeys.legendary, amount: 1 },
			{ rarity: lootboxKeys.mythical, amount: 1 },
			{ rarity: lootboxKeys.mythical, amount: 2 }
		]
	},
	"legendary": {
		"common_currency": [1000, 2500, 5000],
		"premium_currency": [60, 80, 100],
		"xp": [100, 250, 500],
		"material": [
			{ type: "wood", amount: 80 },
			{ type: "stone", amount: 80 },
			{ type: "metal", amount: 80 }
		],
		"lootbox_key": [
			{ rarity: lootboxKeys.legendary, amount: 1 },
			{ rarity: lootboxKeys.legendary, amount: 2 },
			{ rarity: lootboxKeys.legendary, amount: 3 }
		]
	},
	"ancient": {
		"common_currency": [5000, 10000, 20000],
		"premium_currency": [100, 250, 500],
		"xp": [500, 1000, 2000],
		"material": [
			{ type: "wood", amount: 160 },
			{ type: "stone", amount: 160 },
			{ type: "metal", amount: 160 }
		],
		"lootbox_key": [
			{ rarity: lootboxKeys.ancient, amount: 1 },
			{ rarity: lootboxKeys.ancient, amount: 2 },
			{ rarity: lootboxKeys.legendary, amount: 3 }
		]
	}
};

type Reward = {
	tier: rarities;
	rewardType: rewardTypes;
	reward: number | { type: string; amount: number; } | { rarity: lootboxKeys; amount: number; };
};

function generateRewards(count: number, multiplier: number): Reward[] {
	const rewardsList: Reward[] = [];

	for (let i = 0; i < count; i++) {
		const tier = rarityRandom(multiplier) as keyof typeof rewardPool; // Determine the rarity tier

		if (rewardPool[tier]) {
			const rewardTypes = Object.keys(rewardPool[tier]) as Array<keyof typeof rewardPool[typeof tier]>;
			const selectedRewardType = rewardTypes[Math.floor(Math.random() * rewardTypes.length)]; // Randomly select a reward type

			const rewards = rewardPool[tier][selectedRewardType];

			if (Array.isArray(rewards)) {
				const selectedReward = rewards[Math.floor(Math.random() * rewards.length)]; // Randomly select a reward

				// Push the reward into the rewardsList array
				rewardsList.push({
					tier: tier as rarities,
					rewardType: selectedRewardType as rewardTypes,
					reward: selectedReward
				});
			}
		}
	}

	return rewardsList;
}

function rarityRandom(multiplier: number) {
	let r = Math.floor(Math.random() * 10000);  // Generates a random number between 0 and 9999

	// Adjust thresholds based on the multiplier. This ensures that the increase is proportional.
	let thresholds = {
		common: 6000 - multiplier * 500,   	// Slightly reduce the threshold for common as the multiplier increases.
		uncommon: 8000 - multiplier * 400, 	// Reduce the threshold for uncommon.
		rare: 9000 - multiplier * 200,     	// Similarly, reduce for rare.
		epic: 9500 - multiplier * 100,     	// Slightly reduce for epic.
		mythical: 9800 - multiplier * 50,  	// Smaller reduction for mythical.
		legendary: 9990 - multiplier * 10, 	// Minimal reduction for legendary.
		ancient: 10000                    	// No change for ancient since it's the highest tier.
	};

	// Ensure the thresholds do not overlap or go below 0.
	thresholds.common = Math.max(0, thresholds.common);
	thresholds.uncommon = Math.max(thresholds.common + 1, thresholds.uncommon);
	thresholds.rare = Math.max(thresholds.uncommon + 1, thresholds.rare);
	thresholds.epic = Math.max(thresholds.rare + 1, thresholds.epic);
	thresholds.mythical = Math.max(thresholds.epic + 1, thresholds.mythical);
	thresholds.legendary = Math.max(thresholds.mythical + 1, thresholds.legendary);

	// Determine the reward based on adjusted thresholds.
	if (r < thresholds.common) {
		counters.common++;
		return rarities.common;
	} else if (r < thresholds.uncommon) {
		counters.uncommon++;
		return rarities.uncommon;
	} else if (r < thresholds.rare) {
		counters.rare++;
		return rarities.rare;
	} else if (r < thresholds.epic) {
		counters.epic++;
		return rarities.epic;
	} else if (r < thresholds.mythical) {
		counters.mythical++;
		return rarities.mythical;
	} else if (r < thresholds.legendary) {
		counters.legendary++;
		return rarities.legendary;
	} else {
		counters.ancient++;
		return rarities.ancient;
	}
}

enum loopType {
	daily,
	weekly,
	monthly,
}

let counters = {
	common: 0, uncommon: 0, rare: 0, epic: 0, mythical: 0, legendary: 0, ancient: 0
};

function loopDaily(loops: number, type: loopType) {
	let chances: number = 0, multiplier: number = 0;
	if (type == loopType.daily) {
		chances = 3;
		multiplier = 1;
	} else if (type == loopType.weekly) {
		chances = 5;
		multiplier = 2;
	} else if (type == loopType.monthly) {
		chances = 7;
		multiplier = 10;
	}

	const rewards = [];
	for (let i = 0; i < loops; i++) {
		rewards.push(generateRewards(chances, multiplier));
	}

	return rewards;
}

function getRewards(loops: number, type: loopType) {
	const reply = loopDaily(loops, type);

	const rewards = reply[0];

	return rewards;
}

export function testDaily() {
	// Daily
	const loops = 1;
	console.log("DAILY");
	const daily = getRewards(loops, loopType.daily);
	console.log(counters);
	console.log(daily);
	counters = {
		common: 0, uncommon: 0, rare: 0, epic: 0, mythical: 0, legendary: 0, ancient: 0
	};
	console.log("WEEKLY");
	const weekly = getRewards(loops, loopType.weekly);
	console.log(counters);
	console.log(weekly);
	counters = {
		common: 0, uncommon: 0, rare: 0, epic: 0, mythical: 0, legendary: 0, ancient: 0
	};
	console.log("MONTHLY");
	const monthly = getRewards(loops, loopType.monthly);
	console.log(counters);
	console.log(monthly);
};