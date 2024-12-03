import { Events, ChatInputCommandInteraction, ButtonInteraction, AutocompleteInteraction, ModalSubmitInteraction, StringSelectMenuInteraction } from "discord.js";
import { I_BotEvent, CommandInteractionExtended, EmbedColors } from "../../utilities/interface";
// import { commands } from "../misc/loaders";
import { embedBuilder } from "../misc/builders";
import { AppDataSource } from "../../database/datasource";
import { findOrCreateDiscordServer } from "../../database/dao/guild";
import { loadCommands, loadOtherCommands } from "../misc/loaders";
import { interactionCommands } from "../bot";
const embed = embedBuilder("Error", EmbedColors.error);
const otherCommands = loadOtherCommands();
const errorEmbed = embedBuilder("Error", EmbedColors.error);

/**
 * This will process standard commands used by users, for example: /help, /leaderboard, etc.
 * @param interaction This is a "ChatInputCommandInteraction", the default interaction for commands.
 * @returns void
 */
async function interaction_Command(interaction: ChatInputCommandInteraction) {
	// Now check if the command provided is correct.
	if (!interactionCommands) {
		console.log("commands not loaded???");
		return;
	}
	const command = interactionCommands.get(interaction.commandName);
	// console.log(commands);
	// console.log(command);
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

	if (command.options?.disabled) {
		embed.setDescription("Sorry, but this command has been disabled for the time being.");
		interaction.reply({ embeds: [embed], ephemeral: true });
		return;
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
}

async function interaction_Autocomplete(interaction: AutocompleteInteraction) {
	console.log("Autocomplete interaction");
	return;
}

async function interaction_Button(interaction: ButtonInteraction) {
	// Check if we have even loaded any commands.
	if (!otherCommands) {
		console.log("commands not loaded???");
		errorEmbed.setDescription("Button commands have not been loaded, they will not work at the moment.");
		return;
	}

	// Get the custom ID
	const customID = interaction.customId;
	console.log(customID);
	if (!customID) {
		console.log("No custom ID provided.... bro what did you do.");
		return;
	}

	// Check the command.
	const [action, data] = customID.split("|");
	console.log("data: ", data);
	const command = otherCommands.get(action);

	if (!command) {
		console.log("Command not found");
		return;
	}
	if (process.env.NODE_ENV === "development") {
		console.info(command);
	}

	if (!data) {
		command.execute(interaction);
	} else {
		command.execute(interaction, data);
	}
	return;
}

async function interaction_StringSelectMenu(interaction: StringSelectMenuInteraction) {
	console.log("StringSelectMenu interaction");
	return;
}

async function interaction_ModalSubmit(interaction: ModalSubmitInteraction) {
	if (!otherCommands) {
		console.log("commands not loaded???");
		errorEmbed.setDescription("Modal commands have not been loaded, they will not work at the moment.");
		return;
	}
	const customID = interaction.customId;
	if (!customID) {
		console.log("No custom ID provided.... bro what did you do.");
		return;
	}
	const command = otherCommands.get(customID);
	// console.log(command);
	if (!command) {
		console.log("Command not found");
		return;
	}
	if (process.env.NODE_ENV === "development") {
		console.info(command);
	}

	command.execute(interaction);
	return;
}

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
	async execute(interaction: any) {
		try {
			if (interaction.isChatInputCommand()) {
				await interaction_Command(interaction);
			} else if (interaction.isButton()) {
				await interaction_Button(interaction);
			} else if (interaction.isStringSelectMenu()) {
				await interaction_StringSelectMenu(interaction);
			} else if (interaction.isModalSubmit()) {
				await interaction_ModalSubmit(interaction);
			} else if (interaction.isAutocomplete()) {
				await interaction_Autocomplete(interaction);
			}
			else {
				console.log("Interaction was not a predefined interaction type;");
			}

			return;
		} catch (error) {
			console.error(error);
			embed.setTitle("Error processing interaction.")
				.setDescription("We are sorry, it seems we have encountered an error.")
				.setColor(EmbedColors.error);
			interaction.reply({ embeds: [embed], ephemeral: true });
			return;
		}
	}
};

module.exports = [
	interaction,
];
