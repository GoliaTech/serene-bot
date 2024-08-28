import { ChatInputCommandInteraction } from "discord.js";
import { commandBuilder, embedBuilder } from "../../misc/builders";
import { I_Command } from "../../../utilities/interface";
import { Card } from "../../../database/entity/index";
import { AppDataSource } from "../../../database/datasource";

async function performDatabase() {
	try {
		await AppDataSource.initialize();
		const cardRepo = await AppDataSource.manager.find(Card.Core);
		const setRepo = await AppDataSource.manager.find(Card.Set);
		console.info(cardRepo);
		console.info(setRepo);
		await AppDataSource.destroy();
		return {
			msg: "Worked",
		};
	} catch (error: any) {
		await AppDataSource.destroy();
		console.error(error);
		return {
			msg: "it didn't work, check logs",
			error: true
		};
	}
}

const allCards: I_Command = {
	data: commandBuilder(
		"cards",
		"Get all the cards.",
		{
			dm: true,
			owner: true
		},
	),
	async execute(interaction: ChatInputCommandInteraction) {
		const embed = embedBuilder("Profile");

		const reply = await performDatabase();

		if (reply.error) {
			embed.setDescription("oh man, something didn't work.");
			interaction.reply({
				embeds: [embed],
				ephemeral: true,
			});
			return;
		}

		embed.setDescription(String(reply.msg));
		interaction.reply({
			embeds: [embed],
			ephemeral: true
		});
		return;
	}
};

module.exports = [
	allCards,
];
