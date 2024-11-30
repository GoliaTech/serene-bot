import { ButtonInteraction } from "discord.js";
import { I_OtherCommand } from "../../../utilities/interface";

const shite: I_OtherCommand = {
	customID: "shite",
	execute(interaction: ButtonInteraction) {
		console.log("SHITE");
		interaction.reply({ content: "you are shite bro", ephemeral: true });
		return;
	}
};

module.exports = [
	shite
];