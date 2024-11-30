import { Message } from "discord.js";
import { embedBuilder } from "../../misc/builders";

const ping = {
	data: {
		name: "ping"
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