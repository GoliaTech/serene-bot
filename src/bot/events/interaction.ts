import { Events } from "discord.js";
import { BotEvent, CommandInteractionExtended } from "../../utilities/interface";
import { commands } from "../misc/loaders";
/**
 * This is the main interaction function.
 */
const interaction: BotEvent = {
	name: Events.InteractionCreate,
	/**
	 * This is the execution for the interaction event.
	 * @param interaction The interaction.
	 * @returns It returns nothing
	 */
	execute(interaction: CommandInteractionExtended) {
		try {
			// If the command is not an interaction, return.
			if (!interaction.isCommand()) {
				// For development purposes, log it.
				if (process.env.NODE_ENV === "development") console.log(`[${new Date().toUTCString()}] - Command was not an interaction`);
				return;
			}

			// Now check if the command provided is correct.
			const command = commands.get(interaction.commandName);
			if (!command) {
				// If the command doesn't exist, return.
				interaction.reply({ content: "Command not found" });
				return;
			}
			// If everything is fine, continue with the logic.
			// console.log("Command was correct.");

			console.info(command);
			command.execute(interaction);
			// interaction.reply({ content: "testing" });]
		} catch (error) {
			console.error(error);
			interaction.reply({ content: "We are sorry, it seems we have encountered an error." });
		}
	}
};

module.exports = [
	interaction,
];
