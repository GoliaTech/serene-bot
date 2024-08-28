import { SlashCommandBuilder } from "discord.js";
import { I_Command } from "../../../utilities/interface";
import { commandBuilder } from "../../misc/builders";

const viewAllRaces: I_Command = {
	data: new SlashCommandBuilder(),
	async execute(interaction) {
		await interaction.reply({ content: "WIP", ephemeral: true });
		return;
		// const embed = embedBuilder("View all races");
		// const response = await findAllRaces();
		// if (response.error) {
		// 	embed
		// 		.setColor(EmbedColors.error)
		// 		.setDescription(String(response.data));
		// 	return interaction.reply({ embeds: [embed] });
		// }
	}
};

module.exports = [
	viewAllRaces
];