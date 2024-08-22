import { ChatInputCommandInteraction } from "discord.js";
import { I_Command } from "../../../utilities/interface";
import { commandBuilder } from "../../misc/builders";
import { AppDataSource } from "../../../database/datasource";
import { User } from "../../../database/entity";
import { findOrCreateUser } from "../../../database/dao/user";

enum rarities {
	common = "common", uncommon = "uncommon", rare = "rare", epic = "epic", mythical = "mythical", legendary = "legendary", ancient = "ancient"
};

enum rewardTypes {
	common_currency = "common_currency", premium_currency = "premium_currency", xp = "xp", materials = "material", lootbox_key = "lootbox_key"
};

enum lootboxKeys {
	common = "common", rare = "rare", epic = "epic", mythical = "mythical", legendary = "legendary", ancient = "ancient"
};

/**
 * At one point, we will move the rewardPool into a database.
 */
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
		return rarities.common;
	} else if (r < thresholds.uncommon) {
		return rarities.uncommon;
	} else if (r < thresholds.rare) {
		return rarities.rare;
	} else if (r < thresholds.epic) {
		return rarities.epic;
	} else if (r < thresholds.mythical) {
		return rarities.mythical;
	} else if (r < thresholds.legendary) {
		return rarities.legendary;
	} else {
		return rarities.ancient;
	}
}

type Reward = {
	tier: rarities;
	rewardType: rewardTypes;
	reward: number | { type: string; amount: number; } | { rarity: lootboxKeys; amount: number; };
};

function generateRewards(count: number, multiplier: number): Reward[] {
	const rewardsList: Reward[] = [];

	for (let i = 0; i < count; i++) {
		// Determine the rarity tier.
		// A little complex, keyof typeof...
		const tier = rarityRandom(multiplier) as keyof typeof rewardPool;

		// Here we are checking which reward tier to randomly pick rewards from.
		if (rewardPool[tier]) {
			// This takes the object keys from that tier, and converts it to an array, as a type of rewardPool.
			const rewardTypes = Object.keys(rewardPool[tier]) as Array<keyof typeof rewardPool[typeof tier]>;
			// Randomly select a reward type
			const selectedRewardType = rewardTypes[Math.floor(Math.random() * rewardTypes.length)];

			// This selects what kind of rewards are possible.
			const rewards = rewardPool[tier][selectedRewardType];

			// If rewards is an array, we can randomly select a reward.
			if (Array.isArray(rewards)) {
				// Randomly select a reward
				const selectedReward = rewards[Math.floor(Math.random() * rewards.length)];

				// Push the reward into the rewardsList array.
				rewardsList.push({
					// Assign this the tier, reward type, and reward.
					tier: tier as rarities,
					rewardType: selectedRewardType as rewardTypes,
					reward: selectedReward
				});
			}
		}
	}

	// Finally return the list.
	return rewardsList;
}

async function distributeRewards(rewardsList: Reward[]) {
	// This will have to communicate with database, so we need to do async/await.
	console.log("Distributing WIP");
	console.info(rewardsList);
	return;
}

const daily: I_Command = {
	data: commandBuilder(
		"daily",
		"Get your daily reward!",
		{
			dm: true
		}
	),
	/**
	 * This is the daily command.
	 * @param interaction Discord interaction with command.
	 * @returns Nothing actually
	 */
	async execute(interaction: ChatInputCommandInteraction) {
		const now = new Date();

		const userInfo = await findOrCreateUser(interaction.user.id);
		// this should never happen, as that thing above finds OR creates a user.
		if (!userInfo) { return; }

		// If we couldnt create a user...
		if (typeof (userInfo.data) == "string") { return; }

		// Fetch user's daily table.
		let userDaily = await AppDataSource.manager.findOne(User.Daily, {
			where: {
				uuid: userInfo.data.uuid,
			},
		});

		// If no found. This should only happen once.
		if (!userDaily) {
			userDaily = new User.Daily();
			// this if should never happen.
			userDaily.uuid = userInfo.data.uuid;
			await AppDataSource.manager.save(User.Daily, userDaily);
			userDaily = await AppDataSource.manager.findOne(User.Daily, {
				where: {
					uuid: userInfo.data.uuid,
				},
			});
		}

		// This should never happen as we already tried to find, then created and found the user again.
		if (!userDaily) { return; }

		// Check if the user can claim their reward;
		const lastClaimed = userDaily?.daily_timestamp ? new Date(userDaily.daily_timestamp) : null;
		const nextClaim = lastClaimed ? new Date(lastClaimed.getTime() + 24 * 60 * 60 * 1000) : null;

		// if (nextClaim && now < nextClaim) {
		// 	return interaction.reply(`You can claim your next daily reward after ${nextClaim.toLocaleString()}.`);
		// }

		// Check if the streak continues or resets.
		if (lastClaimed && now.getTime() - lastClaimed.getTime() > 36 * 60 * 60 * 1000) {
			// This resets the streak if more than 36 hours have passed.
			// That is, 24 to be able to claim, then 12 hours on top so the user has time to actually claim them.
			userDaily.daily_streak = 0;
		}

		userDaily.daily_streak += 1;
		userDaily.daily_timestamp = now;
		await AppDataSource.manager.save(User.Daily, userDaily);

		// Determine reward multipliers.
		// God I love/hate modulo.
		const isWeekly = userDaily.daily_streak % 7 == 0;
		// Not exactly monthly.
		const isMonthly = userDaily.daily_streak % 28 == 0;
		// I love the ? : operand.
		const multiplier = isMonthly ? 3 : isWeekly ? 2 : 1;
		const rewardCount = isMonthly ? 7 : isWeekly ? 5 : 3;

		// Generate rewards to be presented to the user.
		const rewards = await generateRewards(rewardCount, multiplier);

		// Save the reward to database.
		await distributeRewards(rewards);

		return interaction.reply(`Congrats. Here are your rewards:\n${rewards.map((reward: any) => `• ${reward.tier} ${reward.rewardType}: ${typeof (reward.rewards) == "number" ? reward.rewards : reward.rewards.amount}`).join("\n")}\nYour streak: ${userDaily.daily_streak}.`);
	},
};

module.exports = [
	daily
];