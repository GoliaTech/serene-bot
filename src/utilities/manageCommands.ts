import { REST } from '@discordjs/rest';
import { Routes as DiscordRoutes } from 'discord-api-types/v10';
import { loadCommands } from '../bot/misc/loaders';
import { getAppId, getGuildId, getToken, nodeEnv } from './utilities';
import { I_Command, nodeEnvEnum } from './interface';
require("dotenv").config();

/**
 * The possible decisions the user can make.
 */
enum commandDecision {
	deploy,
	delete,
	get
}

/**
 * This will handle the input of the user and do the correct thing, for the correct app.
 * @param {string} development Either true or false
 * @param {string} choice --deploy, --delete, --get
 * @param {string} clientId Client ID
 * @param {string} guildId Guild ID
 * @param {string} rest REST
 * @returns {Promise<void>} nothing.
 */
async function handleCommands(development: string, choice: commandDecision, clientId: string, guildId: string, rest: REST) {
	try {
		let commands: any, sanitizedCommands;
		switch (choice) {
			case commandDecision.get:
				if (development == nodeEnvEnum.development) {
					commands = await rest.get(DiscordRoutes.applicationGuildCommands(clientId, guildId));
					const commandsApp: any = await rest.get(DiscordRoutes.applicationCommands(clientId));
					for (const command of commandsApp) {
						console.log(command);
					}
				}
				else {
					commands = await rest.get(DiscordRoutes.applicationCommands(clientId));
				}
				if (!commands) {
					return console.log("No commands were loaded");
				}
				for (const command of commands) {
					// let reply = `name: ${command.name}\ndescription: ${command.description}`;
					// if (command.guild_id) {
					// 	reply += `\nguild_id: ${command.guild_id}`;
					// }
					// // command.options.map((option: any) => {
					// // 	reply += `\n${option}`;
					// // });
					// // for (const option of command.options) {
					// reply += `\n${command.options}`;
					// // }
					// console.log(reply);
					// console.log("\n");
					console.log(command);
				}
				return;
			case commandDecision.deploy:
				// BEFORE DEPLOYING
				// DISABLE A HTING IN THE SECRET SANTA EVENT COMMAND
				commands = loadCommands();
				console.log(commands);
				if (!commands) {
					throw new Error("Failed to load commands. Check 'loadCommands()' function and try again.");
				}
				sanitizedCommands = commands.map((command: I_Command) => command.data.toJSON());
				if (development == nodeEnvEnum.development) {
					try {
						await rest.put(DiscordRoutes.applicationGuildCommands(clientId, guildId), { body: sanitizedCommands });
						// await rest.put(DiscordRoutes.applicationCommands(clientId), { body: sanitizedCommands });
						console.log("Commands deployed successfully.");
					} catch (e) {
						console.error(e);
						return;
					}
				}
				else {
					try {
						await rest.put(DiscordRoutes.applicationCommands(clientId), { body: sanitizedCommands });
						console.log("Commands deployed successfully.");
					} catch (e) {
						console.error(e);
						return;
					}
				}
				return;
			case commandDecision.delete:
				if (development == nodeEnvEnum.development) {
					await rest.put(DiscordRoutes.applicationGuildCommands(clientId, guildId), { body: [] });
					await rest.put(DiscordRoutes.applicationCommands(clientId), { body: [] });
					console.log("Commands deleted successfully.");
				}
				else {
					await rest.put(DiscordRoutes.applicationCommands(clientId), { body: [] });
					console.log("Commands deleted successfully.");
				}
				return;
			default:
				throw new Error("You have provided invalid args. You should try --deploy, --delete or --get");
		}
	} catch (e: any) {
		console.error(e);
		throw new Error();
	}
}

/**
 * This handles and sanitizes the user input.
 */
async function handleUserInput() {
	// Sanitize the args.
	const args = process.argv.slice(2);

	// Handle if we have provided any args.
	if (!args) {
		throw new Error("You have not provided any args.");
	}

	// List all possible arguments that we can parse.
	const possibleArgs = ["-D", "-P", "--deploy", "--delete", "--get"];

	// Check if the args provided match any valid args.
	if (!args.find(arg => possibleArgs.includes(arg))) {
		throw new Error(`You have provided invalid args. You should try ${possibleArgs.join(", ")}`);
	}

	// Define our little important strings.
	if (args.includes("-D")) { process.env.NODE_ENV = nodeEnv(nodeEnvEnum.development); }
	else if (args.includes("-P")) { process.env.NODE_ENV = nodeEnv(nodeEnvEnum.production); }
	else { throw new Error("You provided both -D and -P. You should only provide one."); }
	const token = getToken();
	const clientID = getAppId();
	const guildID = getGuildId();

	// Define the REST client thingy to be used in the commands. 
	const rest = new REST({ version: "10" }).setToken(token);

	console.log(process.env.NODE_ENV);
	console.log(process.argv);
	if (args.includes("--deploy")) {
		await handleCommands(process.env.NODE_ENV, commandDecision.deploy, clientID, guildID, rest);
	} else if (args.includes("--delete")) {
		await handleCommands(process.env.NODE_ENV, commandDecision.delete, clientID, guildID, rest);
	} else if (args.includes("--get")) {
		await handleCommands(process.env.NODE_ENV, commandDecision.get, clientID, guildID, rest);
	} else {
		throw new Error("You have provided too many args. You should try --deploy, --delete or --get");
	}

	// We're done here.
	process.exit(0);
}

// Run it as async/await.
(async () => {
	await handleUserInput();
})();