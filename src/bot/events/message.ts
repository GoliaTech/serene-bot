import { Collection, Events, GuildEmoji, Message, MessageMentions } from "discord.js";
import { I_BotEvent, I_MessageCommand } from "../../utilities/interface";
import { messageCommandLoader } from "../misc/loaders";

/**
 * This is a simple interface for the emojis.
 */
interface I_Emojis {
	keywords: string[];
	emojis: string[];
}

/**
 * This is the collection of commands for message events.
 */
const messageCommands = messageCommandLoader();

/**
 * This will react to the message with the emoji.
 * @param {Message} message The message discord object.
 * @param {string[]} def The default emojis to react with.
 * @param {string[]}name The name of the emoji to look up.
 * @returns 
 */
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

/**
 * This handles reacting to a message with emojis.
 * You can easily disable it with the disabled property: `disabled: true`.
 */
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
 * You can disable it by adding the `disabled: true` property.
 */
const messageCommandsEvent: I_BotEvent = {
	name: Events.MessageCreate,
	disabled: false,
	async execute(message: Message) {
		if (message.author.bot) {
			return;
		}

		const commandStart = "!Cuck";

		console.log(message.mentions.users.find((u) => u.id == message.client.user.id));

		if (!message.content.startsWith(commandStart) && message.mentions.users.size == 0 || !message.mentions.users.find((u) => u.id == message.client.user.id)) {
			return;
		}
		let commandMessage = message.content.slice(commandStart.length).trim().split(/ +/);
		if (message.mentions.users.size > 0) {
			commandMessage = commandMessage.slice(1);
		}
		const commandName = commandMessage[0];

		if (!commandName) return;

		// TS is an idiot and is screaming at me: "OOOO .get CANNOT BE MADE ON VOID."
		// Okay bro, so why is it working on interaction.ts, the same exact command, you dumb stupid idiot.
		// Ignore this error, TS is a stupid freak.
		const command: I_MessageCommand | undefined = messageCommands.get(commandName);
		console.log(`message content: 
		${message.content}`);

		console.log(`Command: ${command}`);
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