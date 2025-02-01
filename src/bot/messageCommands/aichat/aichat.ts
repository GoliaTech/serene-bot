import { ChannelType, Message } from "discord.js";
import { embedBuilder } from "../../misc/builders";
import { I_MessageCommand } from "../../../utilities/interface";
import { aiconfig as config, chatService } from "../../misc/openai";

const aichat: I_MessageCommand = {
	data: {
		name: "chat",
		description: "This will let you caht with the AI bot."
	},
	options: {
		cooldown: 30,
	},
	async execute(message: Message, content: string) {


		// prefix is no longer needed here.
		const { maxInputLength } = config;
		// const botMention = `<@${message.client.user?.id}>`;

		// let content = '';

		// // Check for mention in guild channels
		// if (message.mentions.has(message.client.user!) && message.content.startsWith(botMention)) {
		// 	content = message.content.replace(botMention, '').trim();
		// }
		// // Check for prefix in DMs
		// else if (message.channel.type == ChannelType.DM && message.content.startsWith(prefix)) {
		// 	content = message.content.slice(prefix.length).trim();
		// }

		// if (content) {
		if (content.length > maxInputLength) {
			return message.reply(`Input exceeds ${maxInputLength} characters!`);
		}

		const massage = await message.reply(`Processing...`);
		try {
			const response = await chatService.generateResponse(content);
			massage.edit(response);
		} catch (error) {
			console.error("Error generating response:", error);
			massage.edit("Sorry, I encountered an error processing your request.");
		}
		// }
		return;
	}

};

module.exports = [
	aichat
];