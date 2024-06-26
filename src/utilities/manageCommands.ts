import { REST } from '@discordjs/rest';
import { Routes as DiscordRoutes } from 'discord-api-types/v10';
import { loadCommands } from '../bot/misc/loaders';
import { getAppId, getDevGuild, getToken, nodeEnv } from './utilities';
import { nodeEnvEnum } from './interface';

/**
 * This will handle deploying the commands to the application (public) and to the development guild (if development)
 * @param development boolean
 */
async function deployCommands(development?: boolean) {
	const commands = loadCommands();
	if (!commands) {
		throw new Error("Failed to load commands. Check 'loadCommands()' function and try again.");
	}
	const token = getToken();
	const clientID = getAppId();
	const guildID = getDevGuild();

	const rest = new REST({ version: '10' }).setToken(token);

	try {
		console.log("Started refreshing application (/) commands.");

		if (development) {
			await rest.put(
				DiscordRoutes.applicationGuildCommands(clientID, guildID),
				{ body: commands },
			);
		} else {
			await rest.put(
				DiscordRoutes.applicationCommands(clientID),
				{ body: commands },
			);
		}

		console.log("Successfully reloaded application (/) commands.");
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
}

/**
 * This will handle deleting the commands from application (global) and from development guild if development boolean is provided.
 * @param development
 */
async function deleteCommands(development?: boolean) {
	const commands = loadCommands();
	if (!commands) {
		throw new Error("Failed to load commands. Check 'loadCommands()' function and try again.");
	}
	const token = getToken();
	const clientID = getAppId();
	const guildID = getDevGuild();

	const rest = new REST({ version: '10' }).setToken(token);

	try {
		console.log("Started refreshing application (/) commands.");

		if (development) {
			await rest.put(
				DiscordRoutes.applicationGuildCommands(clientID, guildID),
				{ body: commands },
			);
		} else {
			await rest.put(
				DiscordRoutes.applicationCommands(clientID),
				{ body: commands },
			);
		}

		console.log("Successfully reloaded application (/) commands.");
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

	const possibleArgs = ["-D", "--deploy", "-P", "--delete"];

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
		} else {
			console.error("You most likely provided both '--deploy' and '--delete'. Try again.");
			process.exit(0);
		}
	}
	// Public.
	else if (args.includes("-P")) {
		process.env.NODE_ENV = nodeEnv(nodeEnvEnum.production);
		if (args.includes("--deploy")) {
			await deployCommands(true);
		} else if (args.includes("--delete")) {
			await deleteCommands(true);
		} else {
			console.error("You most likely provided both '--deploy' and '--delete'. Try again.");
			process.exit(0);
		}
	}
	// If you provided both.
	else {
		console.error("You most likely provided both '-D' and '-P'. Try again.");
		process.exit(0);
	}
}

handleUserInput();