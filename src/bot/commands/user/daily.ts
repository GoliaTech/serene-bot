import { ChatInputCommandInteraction } from "discord.js";
import { I_Command } from "../../../utilities/interface";
import { commandBuilder } from "../../misc/builders";
import { AppDataSource } from "../../../database/datasource";
import { User } from "../../../database/entity";
import { findOrCreateUser } from "../../../database/dao/user";

/**
 * The card rarities.
 */
enum rarities {
	"Common",
	"Uncommon",
	"Rare",
	"Epic",
	"Mythical",
	"Legendary",
	"Ancient",
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

		const rewards = await generateRewards(rewardCount, multiplier);

		await distributeRewards();

		return interaction.reply(`Congrats. Here are your rewards:\n${rewards.map((reward: any) => `• ${reward}`).join("\n")}\nYour streak: ${userDaily.daily_streak}.`);
	},
};

async function generateRewards(count: number, multiplier: number) {
	// This is just a skeleton of how it will look like.
	// We obviously need to give a little more randomness to it.

	// What has to happen, is that we have to find which type of reward we are getting. Higher reward tiers have are more likely to be chosen.

	// So for example, a premium currency lowest reward one can get is 10, up to 100.
	const rewardPool = [
		{
			type: "premium_currency", baseAmount: 10
		},
		{
			type: "common_currency", baseAmount: 100
		},
		{
			type: "xp", baseAmount: 10
		},
		{
			type: "materials", baseAmount: 3
		},
		{
			type: "lootbox_key", rarity: "common", baseAmount: 1,
		}
	];

	const rewards = [];
	// This will loop through teh rewards pool.
	for (let i = 0; i < count; i++) {
		// This will randomly choose a reward from the pool.
		const reward = rewardPool[Math.floor(Math.random() * rewardPool.length)];

		if (reward.type == "lootbox_key") {
			// Upgrade to higher tier based on the streak.
			reward.rarity = multiplier > 1 ? (Math.random() < 0.5 ? "premium" : "common") : "common";
			rewards.push(`${reward.rarity} ${reward.type.replace('_', ' ')}`);
		} else {
			const amount = reward.baseAmount * multiplier;
			rewards.push(`${amount} ${reward.type.replace('_', ' ')}`);
		}
	}

	return rewards;
}

async function distributeRewards() {
	// TODO.
	console.log("we are distributing rewards :)");
}

/**
 * This will generate a random number between 0 and 9999.
 * It will then see what number you got and get the appropriate rarity.
 * @param {number} multiplier - The multiplier to adjust the random value.
 * @returns {rarities}
 */
function rarityRandom(multiplier: number) {
	let r = Math.floor(Math.random() * 10000);  // Generates a random number between 0 and 9999

	// Adjust the thresholds based on the multiplier.
	if (multiplier > 1) {
		// The multiplier adjusts the random value.
		// Do some math stuff basically.
		r -= Math.floor(r * (0.1 * (multiplier - 1)));
		// Ensure we don't go below 0.
		r = Math.max(0, r);
	}

	if (r < 6000) {
		// 60% chance
		return rarities.Common;
	} else if (r < 8000) {
		// 20% chance
		return rarities.Uncommon;
	} else if (r < 9000) {
		// 10% chance
		return rarities.Rare;
	} else if (r < 9500) {
		// 5% chance
		return rarities.Epic;
	} else if (r < 9800) {
		// 3% chance
		return rarities.Mythical;
	} else if (r < 9990) {
		// 1.9% chance
		return rarities.Legendary;
	} else {
		// 0.1% chance
		return rarities.Ancient;
	}
}

function customRandom() {
	const r = Math.random();

	let result = 0;
	if (r < 0.7) {
		// 70% chance to get a value between 0-51
		result = Math.floor(Math.random() * 51);
	} else if (r < 0.9) {
		// 20% chance to get a value between 51-70
		result = 51 + Math.floor(Math.random() * 20);
	} else if (r < 0.98) {
		// 8% chance to get a value between 71-90
		result = 71 + Math.floor(Math.random() * 20);
	} else {
		// 2% chance to get a value between 91-100
		result = 91 + Math.floor(Math.random() * 10);
	}

	return result;
}

module.exports = [
	daily
];

const rewardsPool = [
	{
		rarity: "common",
		{

	}
	}
{ type: "common_currency", baseAmount: 100; },
];