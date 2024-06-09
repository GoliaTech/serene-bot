// This is where the actual bot code lives.
import { Client, Collection, GatewayIntentBits } from "discord.js";
import path from "path";
import fs from "fs";
import { ClientExtended, Command } from "../utilities/interface";

// Define commands here.
const commands: Collection<string, any> = new Collection<string, any>();

/**
 * This was just testing, but it seems to work really well, so I shall keep this.
 * This loads event files inside ./src/events folder, file by file.
 * Then, it extracts the events inside each file.
 * Then it loops through them, adds them into an array and then returns that array of events.
 * @returns {any[]} - Well I just put ANY for now, but I will have to make an interface for this, or declaration.
 */
function loadEvents() {
	// The array with events to be returned.
	const events = [];
	// This is the folder PATH where the events are located.
	const eventFolderPath = path.join(__dirname, "events");
	// This is to ensure that during development we are using .ts extension.
	// Because during development we are using tsx.
	const fileExtension = process.env.NODE_ENV === "development" ? "ts" : "js";
	// This reads the event folder where all the event files are located, it then filters out everything that is not a file with the correct extension.
	const eventFolder = fs.readdirSync(eventFolderPath).filter((file) => file.endsWith(`.${fileExtension}`));

	// This will then loop through what we got from the eventFolder.
	for (const file of eventFolder) {
		// This is the path of the file inside the folder.
		const filePath = path.join(eventFolderPath, file);
		// You now have to require the event in order to process it.
		const event = require(filePath);

		// It is possible to load an array of all the events from a file.
		// We just have to loop through them like a normal array.
		for (const e of event) {
			// So you push each event into the array.
			events.push(e);
		}
	}

	// You then return the array.
	return events;
}

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
		// (...args) means we are passing any and all arguments into the .execute() function in the event file.
		if (botEvent.once) discordClient.once(botEvent.name, async (...args) => await botEvent.execute(...args));
		else discordClient.on(botEvent.name, async (...args) => await botEvent.execute(...args));
	}
}

/**
 * This is still testing...
 * What this will do, it will loop through the ./src/commands/ folder.
 * Then it will loop through sub folders.
 * Then it will loop through each sub folder, get the files, and finally do something about it.
 * It should then return the collection of commands.
 */
function loadCommands(discordClient: ClientExtended) {
	// I took ANY, but should actually be a dedicated command interface thing.
	// const commands: Collection<string, any> = new Collection<string, any>();

	// This is the path for the commands folder.
	const commandsFolderPath = path.join(__dirname, "commands");
	// The commands folder.
	const commandFolders = fs.readdirSync(commandsFolderPath);

	// This will loop through all the sub folders inside the commands folder.
	for (const folder of commandFolders) {
		// The path for the subfolder.
		const folderPath = path.join(commandsFolderPath, folder);
		const fileExtension = process.env.NODE_ENV === "development" ? "ts" : "js";
		// Filter just the files we care about inside the subfolder.
		const files = fs.readdirSync(folderPath).filter((file) => file.endsWith(`.${fileExtension}`));
		// This will loop through --- the --- files, inside---- files???? Eh???
		for (const file of files) {
			const filePath = path.join(folderPath, file);
			const command = require(filePath);
			// I am so stupid. I forgot that I allowed multiple commands in a single file.
			// Why? Well because modals or something could perhaps benefit from it, is what I'm thinking.
			try {
				if (discordClient.commands) {
					discordClient.commands.set(command[0].data.name, command[0]);
				} else {
					console.error("DiscordClient.COmmands not set.");
				}
			} catch (problem) { console.error(problem); }
		}
	}

	// Return the commands object, with all the commands in it.
	return commands;
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

		// This is for testing.
		const loadedEvents = loadEvents();

		// This will test command stuff.
		// const loadedCommands = loadCommands();
		// console.log("Loadedd commands: ", loadedCommands);
		loadCommands(discordClient);

		console.log("DiscordClient.commands:", discordClient.commands);
		// Here, before starting the bot, we have to define commands and all that stuff.
		// We will have to pass commands into the event handlers, because these will call the commands.
		// There probably is a better way to do this however.
		eventHandlers(discordClient, loadedEvents);

		// For quick testing if commands or events load. I don't want to login every time you see.
		const login: boolean = false;

		// I don't think we need a try here, but it is probably a smart idea to do it anyway.
		if (login) {
			try {
				await discordClient.login(process.env.TOKEN);
				console.log(`[${new Date().toUTCString()}] We started the bot!`);
			} catch (err) { console.error("unable to login to client!!!", err); }
		} else {
			process.exit(1);
		}
	} catch (e: any) { console.error(e); process.exit(1); }
}

// This will run the bot.
bot();
