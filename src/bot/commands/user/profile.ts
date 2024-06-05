import { ChatInputCommandInteraction } from "discord.js";
import { commandBuilder } from "../../misc/commandBuilder";
import { getUser } from "../../../database/dao/user";

// This is still under testing.
// We could totally just do export, but I want to prepare for possible additional stuff.
const user = {
	data: commandBuilder(
		__filename,
		"profile",
		"Get the profile of a user.",
		{
			dm: true
		}
	),
	async execute(interaction: ChatInputCommandInteraction) {
		const user = await getUser(interaction.user.id);
		interaction.reply({ content: String(`This is a skeleton command.\n${user?.model}`) });
	}
};

module.exports = [
	user,
];