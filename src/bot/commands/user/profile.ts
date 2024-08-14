import { ChatInputCommandInteraction, Locale } from "discord.js";
import { commandBuilder } from "../../misc/commandBuilder";
import { Command } from "../../../utilities/interface";
import { AppDataSource } from "../../../typeormdb/datasource";
import { User } from "../../../typeormdb";

async function performDatabaseStuff(userToGet: string) {
	try {
		await AppDataSource.initialize();

		let userRepo: any = await AppDataSource.manager.findOne(User.Core, {
			where: {
				discord_id: userToGet
			}
		});
		if (!userRepo) {
			const insertUser = await AppDataSource.manager.insert(User.Core, {
				discord_id: userToGet
			});
			userRepo = insertUser.raw;
		}

		await AppDataSource.destroy();

		return {
			msg: userRepo,
		};
	} catch (e: any) {
		console.error(e);
		return {
			msg: e.msg,
			error: true
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
		if (reply.error) {
			console.error(reply.msg);
			interaction.reply({ content: "We have encountered an error. We are sorry." });
			return;
		}

		console.info(reply.msg);
		interaction.reply({
			content: `**UUID:** ${reply.msg.uuid}
**Discord ID:** ${reply.msg.discord_id}
**Display name:** ${reply.msg.display_name}
**Joined at:** ${reply.msg.joined_at}`
		});
	}
};

module.exports = [
	user,
];
