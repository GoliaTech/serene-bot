import { ChatInputCommandInteraction, Locale } from "discord.js";
import { commandBuilder } from "../../misc/commandBuilder";
import { getUser } from "../../../database/dao/user";
import { Command } from "../../../utilities/interface";

// This is still under testing.
// We could totally just do export, but I want to prepare for possible additional stuff.
const user: Command = {
	data: commandBuilder(
		"profile",
		"Get the profile of a user.",
		{
			dm: true
		}
	),
	async execute(interaction: ChatInputCommandInteraction) {
		const user = await getUser(interaction.user.id);
		console.log(user?.model);
		interaction.reply({ content: String("This is a skeleton command.") });
	}
};

module.exports = [
	user,
];