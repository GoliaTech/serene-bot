import { Events, ChatInputCommandInteraction } from "discord.js";
import { I_BotEvent, CommandInteractionExtended, EmbedColors } from "../../utilities/interface";
import { commands } from "../misc/loaders";
import { embedBuilder } from "../misc/builders";
const embed = embedBuilder("Error", EmbedColors.error);
/**
 * This is the main interaction function.
 */
const interaction: I_BotEvent = {
	name: Events.InteractionCreate,
	/**
	 * This is the execution for the interaction event.
	 * @param interaction The interaction.
	 * @returns It returns nothing
	 */
	execute(interaction: ChatInputCommandInteraction) {
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
				// If the command doesn't exist, don't do anything.
				embed.setDescription("Command was not found.");
				interaction.reply({ embeds: [embed], ephemeral: true });
				return;
			}

			// I want to know in development what we are getting, this is not necessary, but its fun to know.
			if (process.env.NODE_ENV === "development") {
				console.info(command);
			}

			if (command.options?.botOwner && interaction.user.id !== process.env.OWNER_ID) {
				embed.setDescription("You are not allowed to use this command, only Bot Owner can.");
				interaction.reply({ embeds: [embed], ephemeral: true });
				return;
			}
			// We need uhhh, what are they called... cooldowns. Because otherwise poeple will spam commands.
			if(command.options?.)
			command.execute(interaction);
			return;
		} catch (error) {
			console.error(error);
			embed.setDescription("We are sorry, it seems we have encountered an error.");
			interaction.reply({ embeds: [embed], ephemeral: true });
			return;
		}
	}
};

module.exports = [
	interaction,
];
