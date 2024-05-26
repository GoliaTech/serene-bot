// This is where the actual bot code lives.
import { Client, Collection, GatewayIntentBits } from "discord.js";
import path from "path";
import fs from "fs";

/**
 * This will register events that the client will have to handle.
 * Like for example: ready, banAdd, banRemove, etc.
 * @param discordClient Just parse discordClient here.
 * @param botEvents This is temporarily ANY type, but it will have to be a custom interface.
 */
function eventHandlers(discordClient: Client, botEvents: any) {
	// Here, we will have to parse a whole collection of bot events, then loop through them.
	// This can be achieved in 2 ways: we either do it here, or we separate them into their own files.
	// It depends on how you like doing things.

	console.log("BOTEVENTS: ", botEvents);
	for (const botEvent of botEvents) {
		// So this checks if our event has a parameter called .once.
		// If we do, then we will obviously only run this event once.
		if (botEvent.once) {
			// (...args) means we are passing any and all arguments into the .execute() function in the event file.
			discordClient.once(botEvent.name, async (...args) => await botEvent.execute(...args));
		} else {
			discordClient.on(botEvent.name, async (...args) => await botEvent.execute(...args));
		}
	}
}

/**
 * The main bot function. This is where the main logic of the bot is.
 */
async function bot() {
	try {
		// This creates a new Client, used to tell Discord what do we intend (hence intents) to do with it.
		// Bits means-- parts of the intent. 
		const discordClient = new Client({
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

		// This is for testing.
		const loadedEvents = loadEvents();
		console.log(loadedEvents);

		// This will test command stuff.
		const loadedCommands = "ass";

		// Here, before starting the bot, we have to define commands and all that stuff.
		// We will have to pass commands into the event handlers, because these will call the commands.
		// There probably is a better way to do this however.
		eventHandlers(discordClient, loadedEvents);

		// This code will login (aka: launch) the bot.
		// The token is provided during start.ts, process.env.TOKEN is assigned when checking what environment is being used.
		const login = false;
		// This login stuff is just temporary for testing.
		if (login) {
			await discordClient.login(process.env.TOKEN)
				.then(() => console.log(`[${new Date().toUTCString()}] We started the bot!`));
		} else {
			return;
		}
	} catch (e: any) { console.error(e); }
}

/**
 * This is just testing if it possible to have an array of module.exports and have this thing work.
 * @returns 
 */
function loadEvents() {
	const events = [];
	const eventFolderPath = path.join(__dirname, "events");
	const eventFolder = fs.readdirSync(eventFolderPath).filter((file) => file.endsWith(".js"));
	console.log(eventFolder);
	for (const file of eventFolder) {
		const filePath = path.join(eventFolderPath, file);
		const event = require(filePath);
		// It is possible to load an array of all the events from a file.
		console.log(event);
		for (const e of event) {
			// We just have to loop through them like a normal array.
			console.log(e);
			events.push(e);
		}
	}
	return events;
}

function loadCommands() {
	const commands = {
		commands: new Collection<string, any>(),
		JSON: [],
	};

	const commandsFolderPath = path.join(__dirname, "./commands");
	const commandFolders = fs.readdirSync(commandsFolderPath);
	for (const folder of commandFolders) {
		const folderPath = path.join(commandsFolderPath, folder);
		const files = fs.readdirSync(folderPath).filter((file) => file.endsWith(".js"));
		for (const file of files) {
			const filePath = path.join(folderPath, file);
			const command = require(filePath);
		}
	}
}

// This will run the bot.
bot();