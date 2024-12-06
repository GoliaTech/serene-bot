import { Client, ChannelType, TextChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction, Events } from "discord.js";
import { AppDataSource } from "../../database/datasource";
import { USI, Music } from "../../database/entity/music";
import { I_BotEvent } from "../../utilities/interface";
import { logError } from "../../utilities/utilities";
import { embedBuilder } from "../misc/builders";

async function musicRecommendations(client: Client): Promise<void> {
	try {
		// Determine guild and channel based on environment
		const isDev = process.env.NODE_ENV === "development";
		const guildId = isDev ? process.env.DEV_GUILD_ID : process.env.GUILD_ID;
		const channelId = isDev ? process.env.DEV_MUSIC_CHANNEL : process.env.MAIN_MUSIC_CHANNEL;

		// This shit doesnt work.
		// // Check when we sent the music recommendation last, to ensure we are sending within the 4 hour window.
		// const timethingpath = path.resolve(__dirname, "../../../timething.json");
		// const settings = require(timethingpath);
		// const musicRec = settings["musicRec"];
		// const lastTimeSent = Number(musicRec["lastSent"]);

		// console.log(`lastTimeSent: ${lastTimeSent}`);

		// // Calculate time to wait until being allowed to send it.
		// let timeToWaitUntil = lastTimeSent + (4 * 60 * 60 * 1000); // 4 hours in milliseconds
		// if (process.env.NODE_ENV === "development") {
		// 	timeToWaitUntil = lastTimeSent + (1 * 60 * 1000);
		// }

		// console.log(`timeToWaitUntil: ${timeToWaitUntil}`);

		// // If the time to wait is bigger than now, we are not allowed to send it.
		// const now = Date.now();
		// console.log(`${now}\n${timeToWaitUntil}\n${lastTimeSent}`);
		// if (now < timeToWaitUntil) {
		// 	console.log(`MUSIC RECOMMNEDATION\n4 hours have to pass. They have not passed yet.`);
		// 	try {
		// 		delete require.cache[require.resolve("../../../timething.json")];
		// 	}
		// 	catch (err: any) {
		// 		logError(err.message);
		// 		return;
		// 	}
		// 	return;
		// }

		if (!guildId || !channelId) {
			logError("Missing environment variables for guild or channel.");
			return;
		}

		const guild = await client.guilds.fetch(guildId);
		if (!guild) {
			logError("No guild found for music recommendations.");
			return;
		}

		const channel = await guild.channels.fetch(channelId);
		if (!channel || channel.type !== ChannelType.GuildText) {
			logError("Music Recommendations channel is invalid or not a text channel.");
			return;
		}

		const musicChannel = channel as TextChannel;

		// Fetch song list from database
		const musicManager = AppDataSource.manager;

		const songList = await musicManager.find(Music, {
			relations: ["artist", "album", "genres", "styles"], // Include all necessary relations
		});
		if (!songList || songList.length === 0) {
			logError("Song list is empty or failed to load.");
			return;
		}

		// Validate song entries
		validateSongs(songList);

		// Pick a random song and build the embed
		const randomSong = songList[Math.floor(Math.random() * songList.length)];
		if (!randomSong) {
			logError("Random song is null.");
			return;
		}
		const embed = buildMusicEmbed(randomSong);

		// Add Like and Dislike buttons
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder().setCustomId("like").setLabel("👍 Like").setStyle(ButtonStyle.Success),
			new ButtonBuilder().setCustomId("dislike").setLabel("👎 Dislike").setStyle(ButtonStyle.Danger)
		);

		const message = await musicChannel.send({ embeds: [embed], components: [row] });

		// const newTime = Date.now();
		// writeFile(timethingpath, JSON.stringify({ musicRec: { lastSent: newTime } }), "utf8", (err) => {
		// 	if (err) {
		// 		logError(`Error writing to timething.json: ${err.message}`);
		// 	}
		// });

		// Create a button interaction collector
		const collector = message.createMessageComponentCollector({
			time: 30 * 60 * 1000, // Adjust collection time by adjusting the first number. 60 * 1000 = 1 minute;
		});

		collector.on("collect", async (interaction: ButtonInteraction) => {
			if (!interaction.isButton()) return;

			const userId = interaction.user.id;

			const existingInteraction = await musicManager.findOne(USI, {
				where: {
					user_id: userId,
					song: { id: randomSong.id },
				},
			});

			if (existingInteraction) {
				await interaction.reply({
					content: "You've already rated this song!",
					ephemeral: true,
				});
				return;
			}

			// Handle Like and Dislike interactions
			let interactionType: "like" | "dislike";
			let responseMessage = "";
			if (interaction.customId === "like") {
				randomSong.rating += 1;
				interactionType = "like";
				responseMessage = "You have liked this song.";
			} else if (interaction.customId === "dislike") {
				randomSong.rating -= 1;
				interactionType = "dislike";
				responseMessage = "You have disliked this song.";
			} else {
				return;
			}

			// Save the interaction to the database
			const newInteraction = musicManager.create(USI, {
				user_id: userId,
				song: randomSong,
				interaction_type: interactionType,
			});
			await musicManager.save(USI, newInteraction);

			// Update the song rating in the database
			await musicManager.save(Music, randomSong);

			// Reply to the user
			await interaction.reply({
				content: responseMessage,
				ephemeral: true,
			});

			// Update the embed with the new rating
			const updatedEmbed = buildMusicEmbed(randomSong);
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

	} catch (error: any) {
		logError(`Music Recommendations Error: ${error.message}`);
	}
}


// Helper to validate songs
function validateSongs(songs: Music[]): void {
	for (const song of songs) {
		if (!song.name) console.log("Song name is missing.");
		if (!song.spotify) console.log(`Spotify link is missing for song: "${song.name}"`);
		if (!song.year) console.log(`Year is missing for song: "${song.name}"`);
		if (!song.album || !song.album.name) console.log(`Album is missing for song: "${song.name}"`);
	}
}

function convertYouTubeMusicLinkToThumbnail(link: string) {
	// Extract the video ID from the YouTube Music URL
	const url = new URL(link); // Parse the URL
	const videoId = url.searchParams.get('v'); // Get the value of the 'v' parameter

	if (!videoId) {
		throw new Error("Invalid YouTube Music link");
	}

	// Construct the thumbnail URL
	const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

	return thumbnailUrl;
}

// Helper to build embed
function buildMusicEmbed(song: Music) {
	const embed = embedBuilder("Music Suggestion")
		.setDescription("Check out this song I found in my music collection!\nGenres and styles from: https://discogs.com/ and https://musicbrainz.org/")
		.addFields(
			{ name: "Name", value: song.name, inline: true },
			{ name: "Artist", value: song.artist.name, inline: true }
		)
		.setImage(convertYouTubeMusicLinkToThumbnail(song.ytmusic));

	if (song.genres && song.genres.length > 0) {
		embed.addFields({
			name: "Genre",
			value: song.genres.map((genre) => genre.name).join(", "),
			inline: true,
		});
	}
	if (song.styles && song.styles.length > 0) {
		embed.addFields({
			name: "Style",
			value: song.styles.map((style) => style.name).join(", "),
			inline: true,
		});
	}
	if (song.year) embed.addFields({ name: "Year", value: String(song.year), inline: true });
	if (song.album) embed.addFields({ name: "Album", value: song.album.name, inline: true });
	embed.addFields({ name: "YouTube Music", value: song.ytmusic });
	if (song.spotify) embed.addFields({ name: "Spotify", value: song.spotify });
	embed.addFields({ name: "User Rating", value: String(song.rating) });

	return embed;
}

const musicLinks: I_BotEvent = {
	name: Events.ClientReady,
	/**
	 * This will do things when the bot is ready to launch. Run it once.
	 * @param {Client} client - The client.
	 */
	async execute(client: Client) {
		if (process.env.NODE_ENV === "production") {
			setInterval(async () => await musicRecommendations(client), 4 * 60 * 60 * 1000);
		} else {
			setInterval(async () => await musicRecommendations(client), 2 * 60 * 1000);
		}
	},
	once: true,
};

module.exports = [
	musicLinks
];
