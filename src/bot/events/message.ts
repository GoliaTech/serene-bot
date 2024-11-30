import { Collection, Events, GuildEmoji, Message } from "discord.js";
import { I_BotEvent, I_MessageCommand } from "../../utilities/interface";
import { messageCommandLoader } from "../misc/loaders";

interface I_Emojis {
	keywords: string[];
	emojis: string[];
}

const messageCommands = messageCommandLoader();

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

/**
 * This will handle message commands.
 * One caveat: they cannot handle ephemeral messages.
 */
const messageCommandsEvent: I_BotEvent = {
	name: Events.MessageCreate,
	disabled: true,
	async execute(message: Message) {
		if (message.author.bot) {
			return;
		}

		// first determine what the message is starting with
		const commandStart = "!Cuck";

		if (!message.content.startsWith(commandStart)) {
			return;
		}
		const commandMessage = message.content.slice(commandStart.length).trim().split(/ +/);
		const commandName = commandMessage[0];

		if (!commandName) return;

		// TS is an idiot and is screaming at me: "OOOO .get CANNOT BE MADE ON VOID."
		// Okay bro, so why is it working on interaction.ts, the same exact command, you dumb stupid idiot.
		// Ignore this error, TS is a stupid freak.
		const command: I_MessageCommand | undefined = messageCommands.get(commandName);
		if (!command) {
			message.reply(`Command not found: ${commandName}`);
			return;
		}

		command.execute(message);
		return;
	}
};

module.exports = [
	emojisReact,
	messageCommandsEvent
];