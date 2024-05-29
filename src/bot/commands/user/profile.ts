import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { commandBuilder } from "../../misc/commandBuilder";

const command = commandBuilder(
	"profile",
	"Check your profile",
	true
);
// just a skeleton.
// We could totally just do export, but I want to prepare for possible additional stuff.
const user = {
	data: command,
	async execute(interaction: ChatInputCommandInteraction) {
		// Your code here
		interaction.reply({
			content: "This is a skeleton command."
		});
	}
};

module.exports = [
	user,
];