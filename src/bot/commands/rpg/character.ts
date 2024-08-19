import { Command } from "../../../utilities/interface";
import { commandBuilder } from "../../misc/builders";

const characterCreation: Command = {
	data: commandBuilder(
		"createcharacter",
		"Create a new character. (WIP)",
		{
			dm: true,
			owner: true
		}
	),

	async execute(interaction) {

		await interaction.reply("WIP");
		return;
	}
};