import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Message, MessageActionRowComponentBuilder } from "discord.js";
import { DAO_GetSongs } from "../../../database/dao/music";
import { AppDataSource } from "../../../database/datasource";
import { Music } from "../../../database/entity/music";
import { I_MessageCommand } from "../../../utilities/interface";
import { embedBuilder } from "../../misc/builders";

const getMusic: I_MessageCommand = {
	data: {
		name: "getmusic"
	},
	async execute(interaction) {
		let currentPage = 1;
		const limit = 10;

		// Fetch songs and total pages
		const { songs, feedback } = await DAO_GetSongs(currentPage, limit);

		if (!songs.length) {
			return interaction.reply({ content: "No songs found.", options: { ephemeral: true } });
		}

		const totalSongs = await AppDataSource.manager.count(Music);
		const totalPages = Math.ceil(totalSongs / limit);

		// Create the embed
		const embed = createMusicEmbed(songs, currentPage, totalPages);

		// Action Row for buttons
		const row = createActionRow(currentPage, totalPages);

		// Send the initial message
		const message = await interaction.reply({ embeds: [embed], components: [row], options: { fetchReply: true } }) as Message;

		// Set up collector for button interactions
		const collector = message.createMessageComponentCollector({
			time: 10 * 60 * 1000, // 10 minutes
		});

		collector.on("collect", async (btnInteraction) => {
			if (btnInteraction.user.id !== interaction.author.id) {
				return btnInteraction.reply({ content: "This button is not for you.", ephemeral: true });
			}

			if (btnInteraction.customId === "cancel") {
				collector.stop("User canceled");
				await message.delete();
				return btnInteraction.reply({ content: "Canceled the interaction.", ephemeral: true });
			}

			if (btnInteraction.customId === "next") {
				currentPage++;
			} else if (btnInteraction.customId === "previous") {
				currentPage--;
			}

			// Fetch updated songs
			const { songs } = await DAO_GetSongs(currentPage, limit);
			const updatedEmbed = createMusicEmbed(songs, currentPage, totalPages);
			const updatedRow = createActionRow(currentPage, totalPages);

			await btnInteraction.update({ embeds: [updatedEmbed], components: [updatedRow] });
		});

		collector.on("end", async (_, reason) => {
			if (reason !== "User canceled") {
				await message.edit({ components: [] });
				await message.delete();
				return;
			}
		});
	},
};

// Helper to create the embed
function createMusicEmbed(songs: Music[], currentPage: number, totalPages: number) {
	const embed = embedBuilder("Music List")
		.setDescription(
			songs.map((song, index) => {
				let description = `**${index + 1}: ${song.name}**\n`;
				if (song.artist) description += `Artist: ${song.artist.name}\n`;
				if (song.album) description += `Album: ${song.album.name}\n`;
				description += `YouTube Music: ${song.ytmusic}\n`;
				return description;
			}).join("\n")
		)
		.setFooter({ text: `Page ${currentPage} of ${totalPages}` });

	return embed;
}

// Helper to create action row
function createActionRow(currentPage: number, totalPages: number) {
	const row = new ActionRowBuilder<MessageActionRowComponentBuilder>();

	row.addComponents(
		new ButtonBuilder()
			.setCustomId("previous")
			.setLabel("◀️ Previous Page")
			.setStyle(ButtonStyle.Primary)
			.setDisabled(currentPage <= 1),
		new ButtonBuilder()
			.setCustomId("cancel")
			.setLabel("❌ Cancel")
			.setStyle(ButtonStyle.Danger),
		new ButtonBuilder()
			.setCustomId("next")
			.setLabel("▶️ Next Page")
			.setStyle(ButtonStyle.Primary)
			.setDisabled(currentPage >= totalPages)
	);

	return row;
}

module.exports = [
	getMusic
];