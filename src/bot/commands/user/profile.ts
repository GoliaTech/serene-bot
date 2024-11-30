import { ChatInputCommandInteraction } from "discord.js";
import { commandBuilder, embedBuilder } from "../../misc/builders";
import { I_Command, EmbedColors, I_findOrCreateUser } from "../../../utilities/interface";
import { findOrCreateUser } from "../../../database/dao/user";

// This is still under testing.
// We could totally just do export, but I want to prepare for possible additional stuff.
const user: I_Command = {
	data: commandBuilder(
		"profile",
		"Get the profile of a user.",
		{
			dm: true,
		},
	)
		.addUserOption(option => option
			.setDescription("Input another user here, to get their profile.")
			.setRequired(false)
			.setName("getuser")),
	async execute(interaction: ChatInputCommandInteraction) {
		let userToGet = interaction.options.getUser("getuser");
		if (!userToGet) { userToGet = interaction.user; }

		const embed = embedBuilder();

		const response: I_findOrCreateUser = await findOrCreateUser(userToGet.id);
		if (response.error) {
			embed
				.setTitle("Error")
				.setColor(EmbedColors.error)
				.setDescription(String(response.data));
			interaction.reply({ embeds: [embed], ephemeral: true });
			return;
		}

		// Sanitize and format the response.
		let user = "";
		if (typeof (response.data) == "object") {
			if (response.data.displayName) {
				user = `# ${response.data.displayName}\n\n`;
			} else {
				user = `# ${userToGet.displayName}\n\n`;
			}

			// Using emojis/icons to enhance the visual appeal
			user += `🏅 **Rank:** ${response.data.levelName}\n`;
			user += `📈 **Level:** ${response.data.level}\n\n`;

			if (response.data.prestigeName && response.data.prestige) {
				user += `⭐ **Prestige:** ${response.data.prestigeName}\n`;
				user += `🎖️ **Prestige Level:** ${response.data.prestige}\n\n`;
			}

			user += `🔮 **XP:** ${response.data.xp} | **XP to Level:** ${response.data.xpToLevel}\n\n`;
			user += `💰 **Common Money:** ${response.data.common} | 💎 **Premium Money:** ${response.data.premium}`;
		}

		embed
			.setThumbnail(userToGet.displayAvatarURL())
			.setDescription(user);

		interaction.reply({ embeds: [embed], ephemeral: true });
		return;
	}
};

module.exports = [
	user,
];
