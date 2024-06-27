import { REST } from '@discordjs/rest';
import { Routes as DiscordRoutes } from 'discord-api-types/v10';
import { loadCommands } from '../bot/misc/loaders';
import { getAppId, getGuildId, getToken, nodeEnv } from './utilities';
import { nodeEnvEnum } from './interface';
require("dotenv").config();

/**
 * This will handle deploying the commands to the application (public) and to the development guild (if development)
 * @param development boolean
 * @returns
 */
async function deployCommands(development?: boolean) {
	const commands = loadCommands();
	if (!commands) {
		throw new Error("Failed to load commands. Check 'loadCommands()' function and try again.");
	}

	const commandsSanitized = commands.map((command) => command.data.toJSON());

	const token = getToken();
	const clientID = getAppId();
	const guildID = getGuildId();

	const rest = new REST({ version: '10' }).setToken(token);

	try {
		console.log("Started refreshing application (/) commands.");

		if (development) {
			await rest.put(
				DiscordRoutes.applicationGuildCommands(clientID, guildID),
				{ body: commandsSanitized },
			);
			await rest.put(
				DiscordRoutes.applicationCommands(clientID),
				{ body: commandsSanitized },
			);
		} else {
			await rest.put(
				DiscordRoutes.applicationCommands(clientID),
				{ body: commandsSanitized },
			);
		}

		console.log("Successfully reloaded application (/) commands.");
		return;
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
}

/**
 * This will handle deleting the commands from application (global) and from development guild if development boolean is provided.
 * Normally, you won't need to ever call it, because .put replaces all commands.
 * @param development boolean
 * @returns
 */
async function deleteCommands(development?: boolean) {
	const commands = loadCommands();
	if (!commands) {
		throw new Error("Failed to load commands. Check 'loadCommands()' function and try again.");
	}
	const token = getToken();
	const clientID = getAppId();
	const guildID = getGuildId();

	const rest = new REST({ version: '10' }).setToken(token);

	try {
		console.log("Started refreshing application (/) commands.");

		if (development) {
			// You can't call delete. So you have to put [] empty array to remove all commands.
			// Normally, uou won't have to ever call it, because .put replaces all commands.
			await rest.put(
				DiscordRoutes.applicationGuildCommands(clientID, guildID),
				{ body: [], },
			);
			await rest.put(
				DiscordRoutes.applicationCommands(clientID),
				{ body: [], },
			);
		} else {
			await rest.put(
				DiscordRoutes.applicationCommands(clientID),
				{ body: [], },
			);
		}

		console.log("Successfully reloaded application (/) commands.");
		return;
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
}

/**
 * Check what kind of commands are deployed.
 * @param development boolean
 * @returns 
 */
async function getCommands(development?: boolean) {
	let commands, guildCommands;

	const token = getToken();
	const clientID = getAppId();
	const guildID = getGuildId();

	const rest = new REST({ version: '10' }).setToken(token);

	try {
		console.log("Started refreshing application (/) commands.");

		if (development) {
			guildCommands = await rest.get(
				DiscordRoutes.applicationGuildCommands(clientID, guildID),
			);
			commands = await rest.get(
				DiscordRoutes.applicationCommands(clientID),
			);
		} else {
			commands = await rest.get(
				DiscordRoutes.applicationCommands(clientID),
			);
		}

		console.log("COMMANDS:", commands);
		console.log("GUILD COMMANDS:", guildCommands);
		return;
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
}

/**
 * This is the entry to the file, it handles the args provided and calls the right function.
 */
async function handleUserInput() {
	const args = process.argv.slice(2);

	// Handle if we have provided any args.
	if (!args) {
		console.error("You have not provided any args.");
		process.exit(1);
	}

	const possibleArgs = ["-D", "-P", "--deploy", "--delete", "--get"];

	// Check if the args provided match any valid args.
	if (!args.find(arg => possibleArgs.includes(arg))) {
		console.error(`You have provided invalid args. You should try ${possibleArgs.join(", ")}`);
		process.exit(1);
	}

	// Development.
	if (args.includes("-D")) {
		process.env.NODE_ENV = nodeEnv(nodeEnvEnum.development);
		if (args.includes("--deploy")) {
			await deployCommands(true);
		} else if (args.includes("--delete")) {
			await deleteCommands(true);
		} else if (args.includes("--get")) {
			await getCommands(true);
		} else {
			console.error(`You most likely provided too many argunents. Try again using ${possibleArgs.join(", ")}`);
			process.exit(0);
		}
	}
	// Public.
	else if (args.includes("-P")) {
		process.env.NODE_ENV = nodeEnv(nodeEnvEnum.production);
		if (args.includes("--deploy")) {
			await deployCommands(false);
		} else if (args.includes("--delete")) {
			await deleteCommands(false);
		} else if (args.includes("--get")) {
			await getCommands(true);
		} else {
			console.error(`You most likely provided too many argunents. Try again using ${possibleArgs.join(", ")}`);
			process.exit(0);
		}
	}
	// If you provided both.
	else {
		console.error("You most likely provided both '-D' and '-P'. Try again.");
		process.exit(0);
	}
	process.exit(0);
}

handleUserInput();