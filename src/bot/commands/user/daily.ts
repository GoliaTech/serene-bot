import { ChatInputCommandInteraction } from "discord.js";
import { E_CurrencyTypes, EmbedColors, I_Command, lootboxKeys, rarities, Reward, rewardTypes } from "../../../utilities/interface";
import { commandBuilder, embedBuilder, errorEmbedBuilder } from "../../misc/builders";
import { AppDataSource } from "../../../database/datasource";
import { User } from "../../../database/entity";
import { findOrCreateUser, findOrCreateUserDaily, setNewDaily, userCurrencyIncrease, userItemsDistribute, userLevelXpAdd } from "../../../database/dao/user";
import { capitalizeEachWord, capitalizeFirstLetter, logError } from "../../../utilities/utilities";

/**
 * At one point, we will move the rewardPool into a database.
 */
const rewardPool = {
	"common": {
		"common currency": [100, 150, 200],
		"premium currency": [1, 3, 5],
		"xp": [10, 15, 20],
		"material": [
			{ type: "wood", amount: 5 },
			{ type: "stone", amount: 5 },
			{ type: "metal", amount: 5 }
		],
		"lootbox key": [
			{ type: lootboxKeys.common, amount: 1 },
			{ type: lootboxKeys.common, amount: 2 },
			{ type: lootboxKeys.common, amount: 3 }
		]
	},
	"uncommon": {
		"common currency": [200, 250, 300],
		"premium currency": [5, 7, 10],
		"xp": [20, 25, 30],
		"material": [
			{ type: "wood", amount: 10 },
			{ type: "stone", amount: 10 },
			{ type: "metal", amount: 10 }
		],
		"lootbox key": [
			{ type: lootboxKeys.common, amount: 3 },
			{ type: lootboxKeys.rare, amount: 1 },
			{ type: lootboxKeys.rare, amount: 2 }
		]
	},
	"rare": {
		"common currency": [300, 350, 400],
		"premium currency": [10, 13, 15],
		"xp": [30, 35, 40],
		"material": [
			{ type: "wood", amount: 15 },
			{ type: "stone", amount: 15 },
			{ type: "metal", amount: 15 }
		],
		"lootbox key": [
			{ type: lootboxKeys.epic, amount: 1 },
			{ type: lootboxKeys.rare, amount: 3 },
			{ type: lootboxKeys.rare, amount: 2 }
		]
	},
	"epic": {
		"common currency": [400, 450, 500],
		"premium currency": [15, 18, 20],
		"xp": [40, 45, 50],
		"material": [
			{ type: "wood", amount: 20 },
			{ type: "stone", amount: 20 },
			{ type: "metal", amount: 20 }
		],
		"lootbox key": [
			{ type: lootboxKeys.epic, amount: 1 },
			{ type: lootboxKeys.mythical, amount: 1 },
			{ type: lootboxKeys.epic, amount: 2 }
		]
	},
	"mythical": {
		"common currency": [500, 750, 1000],
		"premium currency": [20, 40, 60],
		"xp": [50, 75, 100],
		"material": [
			{ type: "wood", amount: 40 },
			{ type: "stone", amount: 40 },
			{ type: "metal", amount: 40 }
		],
		"lootbox key": [
			{ type: lootboxKeys.legendary, amount: 1 },
			{ type: lootboxKeys.mythical, amount: 1 },
			{ type: lootboxKeys.mythical, amount: 2 }
		]
	},
	"legendary": {
		"common currency": [1000, 2500, 5000],
		"premium currency": [60, 80, 100],
		"xp": [100, 250, 500],
		"material": [
			{ type: "wood", amount: 80 },
			{ type: "stone", amount: 80 },
			{ type: "metal", amount: 80 }
		],
		"lootbox key": [
			{ type: lootboxKeys.legendary, amount: 1 },
			{ type: lootboxKeys.legendary, amount: 2 },
			{ type: lootboxKeys.legendary, amount: 3 }
		]
	},
	"ancient": {
		"common currency": [5000, 10000, 20000],
		"premium currency": [100, 250, 500],
		"xp": [500, 1000, 2000],
		"material": [
			{ type: "wood", amount: 160 },
			{ type: "stone", amount: 160 },
			{ type: "metal", amount: 160 }
		],
		"lootbox key": [
			{ type: lootboxKeys.ancient, amount: 1 },
			{ type: lootboxKeys.ancient, amount: 2 },
			{ type: lootboxKeys.legendary, amount: 3 }
		]
	}
};

function rarityRandom(multiplier: number) {
	let r = Math.floor(Math.random() * 10000);  // Generates a random number between 0 and 9999

	// Adjust thresholds based on the multiplier. This ensures that the increase is proportional.
	let thresholds = {
		common: 6000 - multiplier * 600,	// Slightly reduce the threshold for common as the multiplier increases.
		uncommon: 8000 - multiplier * 500,	// Reduce the threshold for uncommon.
		rare: 9000 - multiplier * 400,		// Similarly, reduce for rare.
		epic: 9500 - multiplier * 300,		// Slightly reduce for epic.
		mythical: 9800 - multiplier * 100,	// Smaller reduction for mythical.
		legendary: 9990 - multiplier * 50,	// Minimal reduction for legendary.
		ancient: 10000						// No change for ancient since it's the highest tier.
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
				let selectedReward = rewards[Math.floor(Math.random() * rewards.length)];

				// Ensure people get higher rewards if the multiplier is higher than 1.
				if (multiplier > 1 && tier != rarities.ancient) {
					if (typeof (selectedReward) == "object") {
						selectedReward.amount *= multiplier;
					} else {
						selectedReward *= multiplier;
					}
				}

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

// Group rewards by their tier
function groupRewardsByTier(rewards: any[]): Record<string, any[]> {
	return rewards.reduce((acc: Record<string, any[]>, reward) => {
		if (!acc[reward.tier]) {
			acc[reward.tier] = [];
		}
		acc[reward.tier].push(reward);
		return acc;
	}, {});
}

// Format rewards for display
function formatGroupedRewards(groupedRewards: Record<string, any[]>): string {
	return Object.keys(groupedRewards).map(tier => {
		const formattedRewards = groupedRewards[tier].map(reward => {
			const formattedReward = formatReward(reward.reward);
			return `**${capitalizeFirstLetter(reward.rewardType)}**: ${formattedReward}`;
		}).join("\n");
		return `**[${capitalizeFirstLetter(tier)}]**\n${formattedRewards}`;
	}).join("\n\n");
}

// Function to handle the reward display
function formatReward(reward: number | { type: string, amount: number; }): string {
	if (typeof reward === 'number') {
		// If reward is a number, simply return it
		return `${reward}`;
	} else if (typeof reward === 'object' && reward !== null) {
		// If reward is an object, format it using type and amount
		return `${capitalizeFirstLetter(reward.type)} + ${reward.amount}`;
	} else {
		// Fallback for unexpected cases
		return '';
	}
}

/**
 * This will distribute the rewards to the user.
 * @param rewardsList The list of rewards.
 * @param user Discord ID
 * @returns Well, nothing
 */
async function distributeRewards(rewardsList: Reward[], user: string) {

	try {
		// This will have to communicate with database, so we need to do async/await.
		console.log("Distributing WIP");

		// The rewards.
		console.info(rewardsList);

		let common_currency: number = 0,
			premium_currency: number = 0,
			xp: number = 0,
			items: Reward[] = [];

		rewardsList.map((r) => {
			if (typeof (r.reward) == "number") {
				if (r.rewardType == rewardTypes.common_currency) {
					common_currency += r.reward;
				} else if (r.rewardType == rewardTypes.premium_currency) {
					premium_currency += r.reward;
				} else if (r.rewardType == rewardTypes.xp) {
					xp += r.reward;
				}
			} else {
				items.push(r);
			}
		});

		console.log(`${common_currency} common_currency, ${premium_currency} premium_currency, ${xp} xp`);


		if (common_currency > 0) {
			const currencyIncrease = await userCurrencyIncrease(user, E_CurrencyTypes.common, common_currency);
			if (currencyIncrease.error) {
				return {
					data: currencyIncrease.data,
					error: currencyIncrease.error,
				};
			}
		}
		if (premium_currency > 0) {
			const currencyIncrease = await userCurrencyIncrease(user, E_CurrencyTypes.premium, premium_currency);
			if (currencyIncrease.error) {
				return {
					data: currencyIncrease.data,
					error: currencyIncrease.error,
				};
			}
		}
		if (xp > 0) {
			const xpIncrease = await userLevelXpAdd(user, xp);
			if (xpIncrease.error) {
				return {
					data: xpIncrease.data,
					error: xpIncrease.error,
				};
			}
		}
		if (items.length > 0) {
			console.log("Distributing items");
			const distribution = await userItemsDistribute(user, items);
			if (distribution.error) {
				return {
					data: distribution.data,
					error: distribution.error,
				};
			}
		}
		// this was testing.
		// await userLevelXpAdd(user, 310);
		return {
			data: {
				common_currency: common_currency,
				premium_currency: premium_currency,
				xp: xp,
			}
		};
	} catch (e: any) {
		logError(e);
		return {
			data: "Something went wrong whilst trying to distribute rewards. Contact the developer.",
			error: true,
		};
	}
}

const daily: I_Command = {
	data: commandBuilder(
		"daily",
		"Get your daily reward!",
		{
			dm: true,
		}
	),
	/**
	 * This is the daily command.
	 * @param interaction Discord interaction with command.
	 * @returns Nothing actually
	 */
	async execute(interaction: ChatInputCommandInteraction) {
		const now = new Date();
		const embed = embedBuilder();

		const userInfo = await findOrCreateUser(interaction.user.id);
		// this should never happen, as that thing above finds OR creates a user.
		if (userInfo.error || typeof (userInfo.data) == "string") {
			const errorEmbed = errorEmbedBuilder(userInfo.data);
			return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
		}

		// Fetch user's daily table.
		const getUserDaily = await findOrCreateUserDaily(userInfo.data.discordID);

		// This should never happen as we already tried to find, then created and found the user again.
		if (getUserDaily.error || typeof (getUserDaily.data) == "string") {
			const errorEmbed = errorEmbedBuilder(getUserDaily.data);
			return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
		}

		// Check if the user can claim their reward;
		const lastClaimed = getUserDaily.data.daily_timestamp ? new Date(getUserDaily.data.daily_timestamp) : null;
		const nextClaim = lastClaimed ? new Date(lastClaimed.getTime() + 24 * 60 * 60 * 1000) : null;
		const claimDeadline = lastClaimed ? new Date(lastClaimed.getTime() + 36 * 60 * 60 * 1000) : null;

		if (nextClaim && now < nextClaim) {
			// Calculate time left until rewards are ready
			const timeUntilReady = nextClaim.getTime() - now.getTime();
			const hoursUntilReady = Math.floor(timeUntilReady / (1000 * 60 * 60));
			const minutesUntilReady = Math.floor((timeUntilReady % (1000 * 60 * 60)) / (1000 * 60));

			// Calculate time left to claim the current reward
			const timeUntilDeadline = claimDeadline ? claimDeadline.getTime() - now.getTime() : 0;
			const hoursUntilDeadline = Math.floor(timeUntilDeadline / (1000 * 60 * 60));
			const minutesUntilDeadline = Math.floor((timeUntilDeadline % (1000 * 60 * 60)) / (1000 * 60));

			embed
				.setTitle("You have to wait.")
				.setColor(EmbedColors.pending)
				.setDescription(`You can claim your next daily reward after **${nextClaim.toLocaleString()}**.\n\n` +
					`**Time left until rewards are ready:** ${hoursUntilReady}h ${minutesUntilReady}m\n` +
					`**Time left to claim your reward:** ${hoursUntilDeadline}h ${minutesUntilDeadline}m\n` +
					`**Claim deadline:** ${claimDeadline?.toLocaleString()}`);
			return interaction.reply({ embeds: [embed], ephemeral: true });
		}

		// Check if the streak continues or resets.
		if (lastClaimed && now.getTime() - lastClaimed.getTime() > 36 * 60 * 60 * 1000) {
			// This resets the streak if more than 36 hours have passed.
			// That is, 24 to be able to claim, then 12 hours on top so the user has time to actually claim them.
			getUserDaily.data.daily_streak = 0;
		}

		getUserDaily.data.daily_streak += 1;
		getUserDaily.data.daily_timestamp = now;
		await setNewDaily(getUserDaily.data.uuid, getUserDaily.data.daily_streak, getUserDaily.data.daily_timestamp);

		// Determine reward multipliers.
		// God I love/hate modulo.
		const isWeekly = getUserDaily.data.daily_streak % 7 == 0;
		// Not exactly monthly.
		const isMonthly = getUserDaily.data.daily_streak % 28 == 0;
		// I love the ? : operand.
		const multiplier = isMonthly ? 3 : isWeekly ? 2 : 1;
		const rewardCount = isMonthly ? 7 : isWeekly ? 5 : 3;

		// Generate rewards to be presented to the user.
		const rewards = generateRewards(rewardCount, multiplier);

		// Save the reward to database.
		const distribution = await distributeRewards(rewards, userInfo.data.discordID);
		if (distribution.error || typeof (distribution.data) == "string") {
			const errorEmbed = errorEmbedBuilder(distribution.data);
			return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
		}

		const groupRewards = groupRewardsByTier(rewards);
		const formatRewards = formatGroupedRewards(groupRewards);

		embed
			.setColor(EmbedColors.success)
			.setDescription(`## Congratulations!\nHere are your rewards:\n\n${formatRewards}\n\n**Your streak:** ${getUserDaily.data.daily_streak}.`);
		return interaction.reply({ embeds: [embed], ephemeral: true });
	},
};

module.exports = [
	daily
];