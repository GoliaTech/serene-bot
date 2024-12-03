import { I_Command } from "../../../utilities/interface";
import { commandBuilder, embedBuilder } from "../../misc/builders";

const helpCommand: I_Command = {
	data: commandBuilder("help", "Display bot's help."),
	async execute(interaction) {
		const messageCommandPrefix = "!";
		const embed = embedBuilder("Help");
		embed.setDescription(`You can use / commands, or use ${messageCommandPrefix} to use message commands.
			For example: ${messageCommandPrefix} help`);
		await interaction.reply({ embeds: [embed], ephemeral: true });
		return;
	}
};

module.exports = [
	helpCommand
];