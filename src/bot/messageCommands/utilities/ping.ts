import { Message } from "discord.js";

const ping = {
	data: {
		name: "ping"
	},
	async execute(message: Message) {
		message.reply("Pong!");
		return;
	}
};

module.exports = [ping];