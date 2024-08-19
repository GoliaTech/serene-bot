import { Collection, Events, GuildEmoji, Message } from "discord.js";
import { I_BotEvent } from "../../utilities/interface";

interface I_Emojis {
	keywords: string[];
	emojis: string[];
}

async function react(message: Message, def: string[], name: string[]) {
	try {
		if (!message.guild) {
			return;
		}
		const emojis: Collection<string, GuildEmoji> = await message.guild.emojis.fetch();
		const found = Array.from(emojis.filter((e) => e.name != null && name.some((n) => e.name?.includes(n))));
		const emoji = found.length > 0 ? found[Math.floor(Math.random() * found.length)][0] : def[Math.floor(Math.random() * def.length)];
		await message.react(emoji);
	} catch (e) {
		console.error(e);
	}
}

const emojisReact: I_BotEvent = {
	name: Events.MessageCreate,
	async execute(message: Message) {
		if (message.author.bot) {
			return;
		}
		const messageContent = message.content;
		const settingsPath = "../../../settings.json";
		const emojiMap: I_Emojis[] = require(settingsPath)["emojis"];

		for (const map of emojiMap) {
			if (map.keywords.some((keyword: any) => messageContent.includes(keyword))) {
				try {
					await react(message, map.emojis, map.keywords);
				} catch (err) {
					console.error(err);
				}
			}
		}
	},
};

module.exports = [
	emojisReact
];