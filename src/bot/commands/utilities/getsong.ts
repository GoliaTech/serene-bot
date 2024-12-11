import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, TextChannel } from "discord.js";
import { DAO_GetSong } from "../../../database/dao/music";
import { EmbedColors, I_Command, MusicGenres } from "../../../utilities/interface";
import { commandBuilder, embedBuilder } from "../../misc/builders";
import { buildMusicEmbed } from "../../misc/utilities";
import { AppDataSource } from "../../../database/datasource";
import { Music, USI } from "../../../database/entity/music";

const getSong: I_Command = {
	data: commandBuilder(
		"getsong",
		"Get a random music, or provide a genre to get one.")
		.addStringOption(option => option
			.setName("genre")
			.setDescription("Provide a genre to get a random music from that genre.")
			.setRequired(false)
			.setChoices(
				Object.values(MusicGenres).map((genre) => { return { name: genre, value: genre }; }),
			)
		),
	async execute(interaction) {
		const genre = interaction.options.getString("genre");

		const embed = embedBuilder("Get Song", EmbedColors.error);

		let song;
		if (genre) {
			song = await DAO_GetSong(genre);
		} else {
			song = await DAO_GetSong();
		}

		if (!song) {
			embed.setDescription("No music found. This genre probably has no music yet.");
			interaction.reply({ embeds: [embed], ephemeral: true });
			return;
		}
		const songEmbed = buildMusicEmbed(song, "Get Song");

		const textChannel = interaction.channel as TextChannel;
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder().setCustomId("like").setLabel("👍 Like").setStyle(ButtonStyle.Success),
			new ButtonBuilder().setCustomId("dislike").setLabel("👎 Dislike").setStyle(ButtonStyle.Danger)
		);
		const message = await textChannel.send({ embeds: [songEmbed], components: [row] });
		// Create a button interaction collector
		const collector = message.createMessageComponentCollector({
			time: 10 * 60 * 1000, // Adjust collection time by adjusting the first number. 60 * 1000 = 1 minute;
		});

		const musicManager = AppDataSource.manager;

		collector.on("collect", async (interaction: ButtonInteraction) => {
			if (!interaction.isButton()) return;

			const userId = interaction.user.id;

			const existingInteraction = await musicManager.findOne(USI, {
				where: {
					user_id: userId,
					song: { id: song.id },
				},
			});

			if (existingInteraction) {
				embed.setDescription("You've already rated this song!");
				await interaction.reply({ embeds: [embed], ephemeral: true });
				return;
			}

			// Handle Like and Dislike interactions
			let interactionType: "like" | "dislike";
			let responseMessage = "";
			if (interaction.customId === "like") {
				song.rating += 1;
				interactionType = "like";
				responseMessage = "You have liked this song.";
			} else if (interaction.customId === "dislike") {
				song.rating -= 1;
				interactionType = "dislike";
				responseMessage = "You have disliked this song.";
			} else {
				return;
			}

			// Save the interaction to the database
			const newInteraction = musicManager.create(USI, {
				user_id: userId,
				song: song,
				interaction_type: interactionType,
			});
			await musicManager.save(USI, newInteraction);

			// Update the song rating in the database
			await musicManager.save(Music, song);

			// Reply to the user
			embed.setDescription(responseMessage).setColor(EmbedColors.success);
			await interaction.reply({ embeds: [embed], ephemeral: true });

			// Update the embed with the new rating
			const updatedEmbed = buildMusicEmbed(song);
			await interaction.message.edit({ embeds: [updatedEmbed] });
		});

		collector.on("end", async () => {
			try {
				// Remove buttons from the original message
				await message.edit({ components: [] });
			} catch (error) {
				console.error("Failed to update message to remove buttons:", error);
			}
		});
		return;
	},
};

module.exports = [
	getSong
];