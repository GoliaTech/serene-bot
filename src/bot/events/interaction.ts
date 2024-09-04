import { Events, ChatInputCommandInteraction } from "discord.js";
import { I_BotEvent, CommandInteractionExtended, EmbedColors } from "../../utilities/interface";
// import { commands } from "../misc/loaders";
import { embedBuilder } from "../misc/builders";
import { AppDataSource } from "../../database/datasource";
import { findOrCreateDiscordServer } from "../../database/dao/guild";
import { loadCommands } from "../misc/loaders";
const embed = embedBuilder("Error", EmbedColors.error);
const commands = loadCommands();
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
	async execute(interaction: ChatInputCommandInteraction) {
		try {
			// If the command is not an interaction, return.
			if (!interaction.isCommand()) {
				// For development purposes, log it.
				if (process.env.NODE_ENV === "development") console.log(`[${new Date().toUTCString()}] - Command was not an interaction`);
				return;
			}

			// Now check if the command provided is correct.
			if (!commands) {
				console.log("commands not loaded???");
				return;
			}
			const command = commands.get(interaction.commandName);
			console.log(commands);
			console.log(command);
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

			// Check if we are the bot owner.
			if (command.options?.botOwner && interaction.user.id !== process.env.OWNER_ID) {
				embed.setDescription("You are not allowed to use this command, only Bot Owner can.");
				interaction.reply({ embeds: [embed], ephemeral: true });
				return;
			}

			// we should check if this is dm or not, then check what role we have the right perms.

			if (!interaction.channel?.isDMBased()) {
				const guild = await interaction.client.guilds.fetch(String(interaction.guildId));
				const serverSettings = await findOrCreateDiscordServer(guild.id);
				const member = await guild.members.fetch(interaction.user.id);
				if (serverSettings.error) {
					embed.setDescription("We are sorry, it seems we have encountered an error whilst trying to get server settings.");
					interaction.reply({ embeds: [embed], ephemeral: true });
					return;
				}
				// This never happens as .data can only be string if error is true. But TS screams otherwise so.
				if (typeof (serverSettings.data) == "string") {
					return;
				}
				if (command.options?.owner && interaction.user.id !== serverSettings.data.ownerId && interaction.user.id !== process.env.OWNER_ID) {
					embed.setDescription("You are not the owner of the server.");
					interaction.reply({ embeds: [embed], ephemeral: true });
					return;
				}
				if (command.options?.staff && !member.roles.resolveId(serverSettings.data.staffRole) && interaction.user.id !== process.env.OWNER_ID) {
					embed.setDescription("You do not have the required role to use the command.");
					interaction.reply({ embeds: [embed], ephemeral: true });
					return;
				}
			}

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
