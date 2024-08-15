import { ChatInputCommandInteraction, Locale } from "discord.js";
import { commandBuilder, embedBuilder } from "../../misc/builders";
import { Command } from "../../../utilities/interface";
import { AppDataSource } from "../../../database/datasource";
import { User } from "../../../database";

async function performDatabaseStuff(userToGet: string) {
	try {
		await AppDataSource.initialize();

		let userRepo: any = await AppDataSource.manager.findOne(User.Core, {
			where: {
				discord_id: userToGet
			}
		});
		if (!userRepo) {
			const user = new User.Core();
			user.discord_id = userToGet;

			userRepo = await AppDataSource.manager.save(user);

			const userLevel = new User.Level();
			userLevel.uuid = userRepo.uuid;

			await AppDataSource.manager.save(userLevel);

			const userMoney = new User.Currency();
			userMoney.uuid = userRepo.uuid;

			await AppDataSource.manager.save(userMoney);
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

		const embed = embedBuilder("Profile");
		if (reply.error) {
			console.error(reply.msg);
			interaction.reply({ content: "We have encountered an error. We are sorry." });
			return;
		}

		console.info(reply.msg);
		interaction.reply({
			content: `
**UUID:** ${reply.msg.uuid}
**Discord ID:** ${reply.msg.discord_id}
**Display name:** ${reply.msg.display_name}
**Joined at:** ${reply.msg.joined_at}
`});
	}
};

module.exports = [
	user,
];
