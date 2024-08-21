import { I_Command } from "../../../utilities/interface";
import { commandBuilder } from "../../misc/builders";

const viewAllRaces: I_Command = {
	data: commandBuilder(
		"viewallraces",
		"View all the races.",
		{
			dm: true
		}
	),

	async execute(interaction) {
		await interaction.reply({ content: "WIP" });
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