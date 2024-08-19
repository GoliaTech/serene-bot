import { ChatInputCommandInteraction } from "discord.js";
import { commandBuilder, embedBuilder } from "../../misc/builders";
import { Command, EmbedColors } from "../../../utilities/interface";
import { findOrCreateUser, I_findOrCreateUser } from "../../../database/dao/user";

// This is still under testing.
// We could totally just do export, but I want to prepare for possible additional stuff.
const user: Command = {
	data: commandBuilder(
		"profile",
		"Get the profile of a user.",
		{
			dm: true
		},
	).addUserOption(option => option
		.setDescription("Input another user here, to get their profile.")
		.setRequired(false)
		.setName("getuser")),
	async execute(interaction: ChatInputCommandInteraction) {
		let userToGet = interaction.options.getUser("getuser")?.id;
		if (!userToGet) { userToGet = interaction.user.id; }

		const embed = embedBuilder("Profile");

		const response: I_findOrCreateUser = await findOrCreateUser(userToGet);
		if (response.error) {
			embed
				.setColor(EmbedColors.error)
				.setDescription(String(response.data));
			interaction.reply({ embeds: [embed] });
			return;
		}

		// Sanitize the response.
		let user = "";
		if (typeof (response.data) == "object") {
			if (response.data.displayName) { user = "**Display name:** " + response.data.displayName + "\n"; }
			user += `**${response.data.levelName}**\n`;
			user += `**Level:** ${response.data.level}\n`;
			user += `**${response.data.prestigeName}**\n`;
			user += `**Prestige:** ${response.data.prestige}\n`;
			user += `**XP:** ${response.data.xp} | **XP to level:** ${response.data.xpToLevel}\n`;
			user += `**Common money:** ${response.data.common} | **Premium money:** ${response.data.premium}`;
		}

		embed
			.setDescription(user);

		interaction.reply({ embeds: [embed] });
		return;
	}
};

module.exports = [
	user,
];
