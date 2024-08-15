import { ChatInputCommandInteraction, Locale } from "discord.js";
import { commandBuilder, embedBuilder } from "../../misc/builders";
import { Command } from "../../../utilities/interface";
import { AppDataSource } from "../../../database/datasource";
import { User } from "../../../database";

/**
 * This function performs database operations for a given user.
 * It initializes the database, finds or creates a user record,
 * and returns the user record.
 *
 * @param {string} userToGet - The Discord ID of the user.
 * @returns {Promise<{msg: any; error?: boolean}>} - A promise that resolves to an object
 * containing the user record and an optional error flag.
 */
async function performDatabaseStuff(userToGet: string) {
	try {
		let reply;

		// Initialize the database connection.
		await AppDataSource.initialize();

		// Find the user record in the database.
		let userCoreRepo = await AppDataSource.manager.findOne(User.Core, {
			where: {
				discord_id: userToGet,
			},
		});

		let userLevelRepo, userMoneyRepo;

		// If the user record doesn't exist, create a new one.
		if (!userCoreRepo) {
			const userCore = new User.Core();
			userCore.discord_id = userToGet;

			userCoreRepo = await AppDataSource.manager.save(userCore);

			const userLevel = new User.Level();
			userLevel.uuid = userCoreRepo.uuid;

			await AppDataSource.manager.save(userLevel);

			const userMoney = new User.Currency();
			userMoney.uuid = userCoreRepo.uuid;

			await AppDataSource.manager.save(userMoney);
		}

		// Find the level and currency records for the user.
		userLevelRepo = await AppDataSource.manager.findOne(User.Level, {
			where: {
				uuid: userCoreRepo.uuid,
			},
		});

		userMoneyRepo = await AppDataSource.manager.findOne(User.Currency, {
			where: {
				uuid: userCoreRepo.uuid,
			},
		});

		// Close the database connection.
		await AppDataSource.destroy();

		// Prepare the reply object.
		reply = {
			core: userCoreRepo,
			level: userLevelRepo,
			currency: userMoneyRepo,
		};

		return {
			msg: reply,
		};
	} catch (e: any) {
		console.error(e);
		return {
			msg: e.msg,
			error: true,
		};
	}
}

// This is still under testing.
// We could totally just do export, but I want to prepare for possible additional stuff.
const user: Command = {
	data: commandBuilder(
		"profile",
		"Get the profile of a user.",
		{
			dm: true
		},
	).addUserOption(option => option
		.setDescription("Input another user here, to get their profile.")
		.setRequired(false)
		.setName("getuser")),
	async execute(interaction: ChatInputCommandInteraction) {

		let userToGet = interaction.options.getUser("getuser")?.id;
		if (!userToGet) { userToGet = interaction.user.id; }

		const reply = await performDatabaseStuff(userToGet);

		const embed = embedBuilder("Profile");
		if (reply.error) {
			console.error(reply.msg);
			interaction.reply({ content: "We have encountered an error. We are sorry." });
			return;
		}

		console.info(reply.msg);

		let constructedString: string = "";
		if (reply.msg.core.display_name) {
			constructedString += `**Display name:** ${reply.msg.core.display_name}\n`;
		}

		constructedString += `**Level:** ${reply.msg.level.level}\n`;
		constructedString += `**Prestige:** ${reply.msg.level.prestige}\n`;
		constructedString += `**XP:** ${reply.msg.level.xp} | **XP to level:** ${reply.msg.level.xp_to_level}\n`;
		constructedString += `**Common money:** ${reply.msg.currency.common} | **Premium money:** ${reply.msg.currency.premium}\n`;

		embed.setDescription(String(constructedString));
		interaction.reply({
			embeds: [embed]
		});
	}
};

module.exports = [
	user,
];
