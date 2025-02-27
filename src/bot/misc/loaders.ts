import path from "path";
import fs from "fs";
import { ClientExtended, I_BotEvent, I_Command, I_MessageCommand, I_OtherCommand, nodeEnvEnum } from "../../utilities/interface";
import { Collection } from "discord.js";
import { logError } from "../../utilities/utilities";

export const commands = new Collection<string, I_Command>();
export const otherCommands = new Collection<string, I_OtherCommand>();
export const messageCommands = new Collection<string, I_MessageCommand>();

/**
 * This is still testing...
 * What this will do, it will loop through the ./src/commands/ folder.
 * Then it will loop through sub folders.
 * Then it will loop through each sub folder, get the files, and finally do something about it.
 * It should then return the collection of commands.
 * @returns {Collection<string, I_Command>}
 * @param {discordClient} ClientExtended
 */
export function loadCommands(discordClient?: ClientExtended): Collection<string, I_Command> | void {
	// A quick counter.
	let commandsCounter: number = 0;
	// This is the path for the commands folder.
	let commandsFolderPath = "";
	if (process.env.NODE_ENV === nodeEnvEnum.development) {
		commandsFolderPath = path.join(__dirname, "../commands");
	} else {
		commandsFolderPath = path.join(__dirname, "../commands");
	}
	// The commands folder.
	const commandFolders = fs.readdirSync(commandsFolderPath);
	console.log(commandFolders);

	// This will loop through all the sub folders inside the commands folder.
	for (const folder of commandFolders) {
		console.log("we are looping through folder: ", folder);
		// The path for the subfolder.
		const folderPath = path.join(commandsFolderPath, folder);
		// const fileExtension = process.env.NODE_ENV === "development" ? "ts" : "js";
		const fileExtension = "ts";
		// console.log(fileExtension);
		// Filter just the files we care about inside the subfolder.
		const files = fs.readdirSync(folderPath).filter((file) => file.endsWith(`.${fileExtension}`));
		console.log("folderPath: ", folderPath);
		console.log("files: ", files);
		// This will loop through --- the --- files, inside---- files???? Eh???
		for (const file of files) {
			// console.log("we are looping through file: ", file);
			const filePath = path.join(folderPath, file);
			// console.log("Filepath: ", filePath);
			const command: I_Command[] = require(filePath);
			// console.log("command: ", command);

			if (Object.keys(command).length == 0) {
				logError(`WE can't iterate through a command, skipping...\nPath: ${filePath}`);
				console.log("command: ", command);
				return;
			}
			// I am so stupid. I forgot that I allowed multiple commands in a single file.
			// Why? Well because modals or something could perhaps benefit from it, is what I'm thinking.
			// We can loop through them no problem.
			// Remember: in is for index.
			for (const cmd of command) {
				// console.log("cmd: ", cmd);
				// if (!cmd.data.name) {
				// 	console.log("Command has no name set, skipping.");
				// 	return;
				// }
				if (cmd.data.name != undefined || cmd.data.name != null) {
					try {
						commandsCounter++;
						if (discordClient) {
							discordClient.commands.set(cmd.data.name, cmd);
						} else {
							commands.set(cmd.data.name, cmd);
						}
					} catch (problem: any) {
						logError(`There was a problem setting the command:\n${problem}`);
						return;
					}
				}
			}

			// This is for a single command, but we don't know if they have multiple commands or not. WE can check however.
			// If modals will be processed this way, we will have to make a condition in data or something to handle it...
			// try {
			// 	if (discordClient.commands) {
			// 		discordClient.commands.set(command[0].data.name, command[0]);
			// 	} else {
			// 		console.error("DiscordClient.COmmands not set.");
			// 	}
			// } catch (problem) { console.error(problem); }
		}
	}
	console.log("Commands/limit: ", commandsCounter, "/100");
	return commands;
}

/**
 * This was just testing, but it seems to work really well, so I shall keep this.
 * This loads event files inside ./src/events folder, file by file.
 * Then, it extracts the events inside each file.
 * Then it loops through them, adds them into an array and then returns that array of events.
 * @returns {I_BotEvent[]} - Well I just put ANY for now, but I will have to make an interface for this, or declaration.
 */
export function loadEvents(): I_BotEvent[] | void {
	// The array with events to be returned.
	const events: I_BotEvent[] = [];
	let eventsLoaded = 0, eventsTotal = 0, eventsDisabled = 0;
	// This is the folder PATH where the events are located.
	let eventFolderPath = "";
	if (process.env.NODE_ENV === nodeEnvEnum.development) {
		eventFolderPath = path.join(__dirname, "../events");
	} else if (process.env.NODE_ENV === nodeEnvEnum.production) {
		eventFolderPath = path.join(__dirname, "../events");
	}
	// This is to ensure that during development we are using .ts extension.
	// Because during development we are using tsx.
	// const fileExtension = process.env.NODE_ENV === "development" ? "ts" : "js";
	const fileExtension = "ts";
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
			// New feature: load only enabled commands.
			try {
				eventsTotal++;
				if (!e.disabled) {
					// So you push each event into the array.
					eventsLoaded++;
					events.push(e);
				} else {
					eventsDisabled++;
					console.log(`Event ${e.name} is disabled.`);
				}
			} catch (err) {
				logError(`there was a problem loading event: ${err}`);
				return;
			}
		}
	}

	// You then return the array.
	console.log(`Loaded: ${eventsLoaded} out of ${eventsTotal} events. (${eventsDisabled} disabled)`);
	return events;
}

/**
 * Modals, etc.
 * @returns {Collection<string, I_OtherCommand>}
 */
export function loadOtherCommands(): Collection<string, I_OtherCommand> | void {
	const commandsFolderPath = path.join(__dirname, "../otherCommands");
	const commandsFolders = fs.readdirSync(commandsFolderPath);
	console.log(commandsFolderPath);
	for (const folders of commandsFolders) {
		const foldersPath = path.join(commandsFolderPath, folders);
		// const innerFolders = fs.readdirSync(foldersPath);
		// console.log(foldersPath);
		// for (const innerFolder of innerFolders) {
		// 	const folderPath = path.join(foldersPath, innerFolder);
		// 	console.log(folderPath);
		const fileExtension = "ts";
		const files = fs.readdirSync(foldersPath).filter((file) => file.endsWith(`.${fileExtension}`));
		for (const file of files) {
			const filePath = path.join(foldersPath, file);
			const command: I_OtherCommand[] = require(filePath);
			if (Object.keys(command).length == 0) {
				logError(`WE can't iterate through a command, skipping...\nPath: ${filePath}`);
				return;
			}
			for (const cmd of command) {
				if (cmd.customID != undefined || cmd.customID != null) {
					try {
						console.log(`Logged other command: ${cmd.customID}`);
						otherCommands.set(cmd.customID, cmd);
					} catch (e) {
						return;
					}
				}
			}
		}
	}
	// }
	return otherCommands;
}

/**
 * This will load messageCommands for your messaging pleasures.
 * @returns {Collection<string, I_MessageCommand>}
 */
export function messageCommandLoader(): Collection<string, I_MessageCommand> | void {
	const commandsFolderPath = path.join(__dirname, "../messageCommands");
	const commandsFolders = fs.readdirSync(commandsFolderPath);
	console.log(commandsFolderPath);
	for (const folders of commandsFolders) {
		const foldersPath = path.join(commandsFolderPath, folders);
		const fileExtension = "ts";
		const files = fs.readdirSync(foldersPath).filter((file) => file.endsWith(`.${fileExtension}`));
		for (const file of files) {
			const filePath = path.join(foldersPath, file);
			const command: I_MessageCommand[] = require(filePath);
			if (Object.keys(command).length == 0) {
				logError(`WE can't iterate through a command, skipping...\nPath: ${filePath}`);
				return;
			}
			for (const cmd of command) {
				if (cmd.data.name != undefined || cmd.data.name != null) {
					try {
						console.log(`Logged message command: ${cmd.data.name}`);
						messageCommands.set(cmd.data.name, cmd);
					} catch (e) {
						return;
					}
				}
			}
		}
	}
	return messageCommands;
}