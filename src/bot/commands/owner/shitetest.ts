import { ActionRow, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { I_Command } from "../../../utilities/interface";
import { commandBuilder } from "../../misc/builders";

const viewAllRaces: I_Command = {
	data: commandBuilder(
		"shitetest",
		"This is a thing",
	),
	options: {
		botOwner: true,
	},
	async execute(interaction: any) {
		const button = new ButtonBuilder()
			.setCustomId("shite")
			.setLabel("OK")
			.setStyle(ButtonStyle.Primary);

		const actionRow = new ActionRowBuilder().addComponents(button);

		await interaction.reply({
			components: [actionRow],
			content: "Shite",
			ephemeral: true,
		});
	}
};

module.exports = [
	viewAllRaces
];