import { I_Command } from "../../../utilities/interface";
import { commandBuilder } from "../../misc/builders";

const characterCreation: I_Command = {
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

module.exports = [characterCreation];