import { ChatInputCommandInteraction } from "discord.js";
import { commandBuilder, embedBuilder } from "../../misc/builders";
import { Command, EmbedColors } from "../../../utilities/interface";
import { getUserCoreThings } from "../../../database/dao/user";

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

		const response = await getUserCoreThings(userToGet);
		if (response.error) {
			embed
				.setColor(EmbedColors.error)
				.setDescription(response.msg);
			interaction.reply({ embeds: [embed] });
			return;
		}

		// Sanitize the response.
		let user = "";
		if (response.data?.core.display_name) { user = "**Display name:** " + response.data.core.display_name + "\n"; }
		user += `**Level:** ${response.data?.level.level}\n`;
		user += `**Prestige:** ${response.data?.level.prestige}\n`;
		user += `**XP:** ${response.data?.level.xp} | **XP to level:** ${response.data?.level.xp_to_level}\n`;
		user += `**Common money:** ${response.data?.currency.common} | **Premium money:** ${response.data?.currency.premium}`;

		embed
			.setDescription(user);

		interaction.reply({ embeds: [embed] });
		return;
	}
};

module.exports = [
	user,
];
