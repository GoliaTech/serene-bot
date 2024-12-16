import { Message } from "discord.js";
import { embedBuilder } from "../../misc/builders";
import { I_MessageCommand } from "../../../utilities/interface";

const ping: I_MessageCommand = {
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