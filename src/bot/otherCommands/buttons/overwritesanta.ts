import { ButtonInteraction } from "discord.js";
import { EmbedColors, I_OtherCommand, I_secretsanta } from "../../../utilities/interface";
import { writeFileSync } from "fs";
import path from "path";
import { overwriteSanta } from "../../bot";
import { embedBuilder } from "../../misc/builders";
const embed = embedBuilder("Secret Santa").setColor(EmbedColors.error);

async function handleOverwriteSanta(interaction: ButtonInteraction, santaData: I_secretsanta) {
	try {
		// Load the secretsanta list.
		const secretsantapath = path.resolve(__dirname, "../../../../secretsanta.json");
		delete require.cache[require.resolve(secretsantapath)];
		const fileData = require(secretsantapath);
		let secretSantaList: I_secretsanta[] = fileData["secretsanta"];

		const index = secretSantaList.findIndex(santa => santa.id === santaData.id);

		if (index !== -1) {
			secretSantaList[index] = santaData;

			writeFileSync(
				secretsantapath,
				JSON.stringify({ secretsanta: secretSantaList }, null, 4),
				'utf8'
			);

			embed.setDescription("Your entry has been successfully updated!")
				.setColor(EmbedColors.success);
			await interaction.reply({
				embeds: [embed],
				ephemeral: true
			});
		} else {
			embed.setDescription("Your entry could not be found for overwriting.");
			await interaction.reply({
				embeds: [embed],
				ephemeral: true
			});
		}
	} catch (error) {
		console.error("Error overwriting Secret Santa entry: ", error);
		embed.setDescription("An error occurred while trying to overwrite your entry. Please try again later, or contact the developer.");
		await interaction.reply({
			embeds: [embed],
			ephemeral: true
		});
	}

}

const santaOverwrite: I_OtherCommand = {
	customID: "overwrite_santa",
	async execute(interaction: ButtonInteraction) {
		console.log(overwriteSanta);
		const data = overwriteSanta.get(interaction.user.id);
		console.log("DATA: ", data);
		if (data) {
			await handleOverwriteSanta(interaction, data);
		} else {
			embed.setDescription("The data for this action is no longer available.");
			await interaction.reply({
				embeds: [embed],
				ephemeral: true
			});
		}
	}
};

const cancelOverwrite: I_OtherCommand = {
	customID: "santa_cancel_overwrite",
	async execute(interaction: ButtonInteraction) {
		overwriteSanta.delete(interaction.user.id); // Clean up the data
		embed.setDescription("Action canceled. No changes have been made.").setColor(EmbedColors.success);
		await interaction.reply({
			embeds: [embed],
			ephemeral: true
		});
	}
};

module.exports = [
	cancelOverwrite,
	santaOverwrite
];