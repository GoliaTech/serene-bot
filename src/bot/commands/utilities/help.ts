import { EmbedColors, I_Command } from "../../../utilities/interface";
import { commandBuilder, embedBuilder } from "../../misc/builders";
import { messageCommandLoader } from "../../misc/loaders";

const helpCommand: I_Command = {
	data: commandBuilder("help", "Display bot's help."),
	async execute(interaction) {
		const messageCommandPrefix = "!!";
		const embed = embedBuilder("Help");
		const messageCommands = messageCommandLoader();
		if (!messageCommands) {
			embed.setColor(EmbedColors.error).setDescription("No message commands found.");
			return interaction.reply({ embeds: [embed], ephemeral: true });
		}

		// messageCommands.forEach((c) => {
		// 	c.data
		// })

		let displayCommands = messageCommands.map((c) => {
			if (c.options?.disabled) return;
			if (c.options?.botOwner && interaction.user.id !== process.env.BOT_OWNER) return;
			const command = c.data;
			let display = `\`${messageCommandPrefix}${command.name}`
			switch (command.usage) {
				case undefined:
					break;
				default:
					display += ` ${command.usage}`
			}
			switch (c.options?.cooldown) {
				case undefined:
					break;
				default:
					display += ` - Cooldown: ${c.options!.cooldown} seconds.`
			}
			switch (command.description) {
				case undefined:
					break;
				default:
					display += `\` - ${command.description}`;
			}
			return display;
			// return `\`${messageCommandPrefix}${command.name}\` - ${command.description}`
		})

		embed.setDescription(`You can use / commands, or use ${messageCommandPrefix} to use message commands.` +
			`For example: ${messageCommandPrefix}help.\n` +
			displayCommands.join("\n")
		);

		await interaction.reply({ embeds: [embed], ephemeral: true });
		return;
	}
};

module.exports = [
	helpCommand
];