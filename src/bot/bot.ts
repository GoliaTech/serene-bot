// This is where the actual bot code lives.
import { GatewayIntentBits } from "discord.js";
import { ClientExtended } from "../utilities/interface";
import { loadCommands, loadEvents } from "./misc/loaders";
import { AppDataSource } from "../database/datasource";
import { logError, logInfo } from "../utilities/utilities";

// For quick testing if commands or events load. I don't want to login every time you see.
const login: boolean = true;

/**
 * This will register events that the client will have to handle.
 * Like for example: ready, banAdd, banRemove, etc.
 * @param discordClient Just parse discordClient here.
 * @param botEvents This is temporarily ANY type, but it will have to be a custom interface.
 */
function eventHandlers(discordClient: ClientExtended, events: any) {
	// Here, we will have to parse a whole collection of bot events, then loop through them.
	// This can be achieved in 2 ways: we either do it here, or we separate them into their own files.
	// It depends on how you like doing things.
	for (const event of events) {
		// So this checks if our event has a parameter called .once.
		// If we do, then we will obviously only run this event once.#

		// (...args) means we are passing any and all arguments into the .execute() function in the event file.
		if (event.once) { discordClient.once(event.name, async (...args) => await event.execute(...args)); }
		else { discordClient.on(event.name, async (...args) => await event.execute(...args)); }
	}
}

/**
 * The main bot function. This is where the main logic of the bot is.
 */
async function bot() {
	try {
		// This creates a new Client, used to tell Discord what do we intend (hence intents) to do with it.
		// Bits means-- parts of the intent. 
		const discordClient = new ClientExtended({
			intents: [
				// Guild intents.
				// This lets you interact with guilds.
				GatewayIntentBits.Guilds,
				// This lets you interact with guild messages.
				GatewayIntentBits.GuildMessages,
				// This lets your bot react to guild messages.
				GatewayIntentBits.GuildMessageReactions,
				// This lets you interact with guild members.
				GatewayIntentBits.GuildMembers,
				// This lets your bot handle moderation tasks in a guild.
				GatewayIntentBits.GuildModeration,
				// This lets your bot interact with typing events.
				GatewayIntentBits.GuildMessageTyping,

				// Private messages.
				// This lets your bot directly message users.
				GatewayIntentBits.DirectMessages,
				// This lets your bot react to message with a user.
				GatewayIntentBits.DirectMessageReactions,
				// This lets your bot interact with typing events in a private message.
				GatewayIntentBits.DirectMessageTyping,

				// Others.
				// This will let your bot see the content of messages. Useful if you want more/different commands than what the applicationCommands provides.
				GatewayIntentBits.MessageContent
			]
		});

		// This will load commands.

		// const loaded = loadCommands();
		// console.log(loaded);
		// if (process.env.NODE_ENV === "development") {
		// 	console.log("DISCORDCLIENT.COMMANDS:\n", discordClient.commands);
		// }

		// Here, before starting the bot, we have to define commands and all that stuff.
		// We will have to pass commands into the event handlers, because these will call the commands.
		// There probably is a better way to do this however.
		const loadedEvents = loadEvents();
		if (!loadedEvents) {
			logError("Unable to load events.");
			return;
		}
		if (process.env.NODE_ENV === "development") {
			console.log("Loaded Events:\n", loadedEvents);
		}
		eventHandlers(discordClient, loadedEvents);

		if (login) {
			await AppDataSource.initialize();
			// I don't think we need a try here, but it is probably a smart idea to do it anyway.
			try {
				await discordClient.login(process.env.TOKEN);
				logInfo(`We started the bot for: [ ${process.env.NODE_ENV} ]`);
			} catch (err) {
				logError(`unable to login to client!!!${err}`);
			}
		} else {
			process.exit(1);
		}
	} catch (e: any) {
		console.error(e);
		await AppDataSource.destroy();
		process.exit(1);
	}
}

// This will run the bot.
bot();
