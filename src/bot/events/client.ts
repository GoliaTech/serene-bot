import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChannelType, Client, Events, Guild, TextChannel } from "discord.js";
import { I_BotEvent, I_MusicList } from "../../utilities/interface";
import { logError, logGeneral } from "../../utilities/utilities";
import { embedBuilder } from "../misc/builders";
import { randomInt } from "crypto";
import path from "node:path";
import { Music, USI } from "../../database/entity/music";
import { AppDataSource } from "../../database/datasource";

/**
 * This will set a random presence.
 * @param {Client} event - The client. Just parse client here.
 */
function setPresence(event: Client) {
	// At the moment we are getting them from a .json file.
	// The goal is to get them from our database instead.
	const settingsPath = "../../../settings.json";
	const customPresence: string[] = require(settingsPath)["presence"];
	const randomIndex = Math.floor(Math.random() * customPresence.length);
	const randomPresence = customPresence[randomIndex];
	if (!event.user) {
		logError("User is null somehow. Presence not set.");
		return;
	}
	event.user.setPresence({ activities: [{ name: String(randomPresence) }], status: "online" });
	try {
		delete require.cache[require.resolve(settingsPath)];
		return;
	} catch (err: any) {
		logError(err.message);
		return;
	}
}

const ready: I_BotEvent = {
	name: Events.ClientReady,
	/**
	 * This will do things when the bot is ready to launch. Run it once.
	 * @param {Client} client - The client.
	 */
	execute(client: Client) {
		logGeneral(`Client ready as: ${client.user?.tag}`);
		// Set presence, then set interval to do it again in 10 minutes.
		setPresence(client);
		setInterval(() => setPresence(client), randomInt(10, 20) * 60 * 1000);
	},
	once: true,
};

async function musicRecommendations(client: Client): Promise<void> {
	try {
		// Determine guild and channel based on environment
		const isDev = process.env.NODE_ENV === "development";
		const guildId = isDev ? process.env.DEV_GUILD_ID : process.env.GUILD_ID;
		const channelId = isDev ? process.env.DEV_MUSIC_CHANNEL : process.env.MAIN_MUSIC_CHANNEL;

		if (!guildId || !channelId) {
			throw new Error("Missing environment variables for guild or channel.");
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

		// Fetch song list from database.
		const musicManager = AppDataSource.manager;
		const interactionManager = AppDataSource.manager;

		// Load song list
		// const songListPath = path.resolve(__dirname, "../../../songlist.json");
		// const songList = loadSongList(songListPath);

		const songList = await musicManager.find(Music);
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

		// Create a button interaction collector
		const collector = message.createMessageComponentCollector({
			time: 1 * 60 * 1000, // Collect interactions for 1 minute. Adjust the 1.
		});

		collector.on("collect", async (interaction: ButtonInteraction) => {
			if (!interaction.isButton()) return;

			const userId = interaction.user.id;

			const existingInteraction = await interactionManager.findOne(USI, {
				where: {
					user_id: userId,
					song: randomSong,
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
			if (interaction.customId === "like") {
				randomSong.rating += 1;
				interactionType = "like";
			} else if (interaction.customId === "dislike") {
				randomSong.rating -= 1;
				interactionType = "dislike";
			} else {
				return;
			}

			// interactionUsers.add(userId);

			// // Update the embed with the new rating
			// const updatedEmbed = buildMusicEmbed(randomSong);
			// await interaction.update({ embeds: [updatedEmbed] });

			// Save the interaction to the database
			const newInteraction = interactionManager.create(USI, {
				user_id: userId,
				song: randomSong,
				interaction_type: interactionType,
			});
			await interactionManager.save(USI, newInteraction);

			// Update the song rating in the database.
			await musicManager.save(Music, randomSong);

			// Update the embed with the new rating.
			const updatedEmbed = buildMusicEmbed(randomSong);
			await interaction.update({ embeds: [updatedEmbed] });
		});

		collector.on("end", () => {
			// Clean up interaction state
			// No need to clear anything since its in the DB.
		});

		// No longer needed.
		// clearCache(songListPath);
	} catch (error: any) {
		logError(`Music Recommendations Error: ${error.message}`);
	}
}

// Helper to load the song list
// function loadSongList(filePath: string): I_MusicList[] {
// 	try {
// 		return require(filePath)["songs"];
// 	} catch (err: any) {
// 		logError(`Failed to load song list: ${err.message}`);
// 		return [];
// 	}
// }

// Helper to validate songs
function validateSongs(songs: Music[]): void {
	for (const song of songs) {
		if (!song.name) logError("Song name is missing.");
		if (!song.artist) logError(`Artist is missing for song: "${song.name}"`);
		if (!song.ytmusic) logError(`YouTube Music link is missing for song: "${song.name}"`);
		if (!song.spotify) logError(`Spotify link is missing for song: "${song.name}"`);
		if (!song.year) logError(`Year is missing for song: "${song.name}"`);
		if (!song.album) logError(`Album is missing for song: "${song.name}"`);
	}
}

// Helper to build embed
function buildMusicEmbed(song: Music) {
	const embed = embedBuilder("Music Suggestion")
		.setDescription("I found this song in my music room, check it out if you want.")
		.addFields(
			{ name: "Name", value: song.name, inline: true },
			{ name: "Artist", value: song.artist, inline: true }
		);

	// if (song.genre) embed.addFields({ name: "Genre", value: song.genre, inline: true });
	if (song.genres && song.genres.length > 0) {
		embed.addFields({
			name: "Genre",
			value: song.genres.map((genre) => genre.name).join(", "),
			inline: true
		});
	}
	if (song.year) embed.addFields({ name: "Year", value: String(song.year), inline: true });
	if (song.album) embed.addFields({ name: "Album", value: song.album, inline: true });
	embed.addFields({ name: "YouTube Music", value: song.ytmusic });
	if (song.spotify) embed.addFields({ name: "Spotify", value: song.spotify });
	embed.addFields({ name: "Rating", value: String(song.rating), inline: true });

	return embed;
}

// Helper to clear cache
// No longer needed since it happens in the database.
// function clearCache(filePath: string): void {
// 	try {
// 		delete require.cache[require.resolve(filePath)];
// 	} catch (err: any) {
// 		logError(`Failed to clear cache: ${err.message}`);
// 	}
// }

const musicLinks: I_BotEvent = {
	name: Events.ClientReady,
	/**
	 * This will do things when the bot is ready to launch. Run it once.
	 * @param {Client} client - The client.
	 */
	async execute(client: Client) {
		// setInterval(async () => await musicRecommendations(client), randomInt(180, 240) * 60 * 1000);
		// for testing
		setInterval(async () => await musicRecommendations(client), 1 * 60 * 1000);
	},
	once: true,
};

module.exports = [
	ready,
	musicLinks
];
