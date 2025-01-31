import { Message } from "discord.js";
import { embedBuilder } from "../../misc/builders";
import { I_MessageCommand } from "../../../utilities/interface";

const ping: I_MessageCommand = {
	data: {
		name: "ping",
		description: "This will ping the bot to test if it's working."
	},
	async execute(message: Message) {
		const embed = embedBuilder("Pong!")
			.setDescription("This is a pong message.");
		message.reply({ embeds: [embed] });
		return;
	}
};

module.exports = [
	ping
];