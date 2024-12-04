import { ChannelType, Client, Events, Guild } from "discord.js";
import { I_BotEvent } from "../../utilities/interface";
import { logError, logGeneral } from "../../utilities/utilities";
import { embedBuilder } from "../misc/builders";
import { randomInt } from "crypto";
import path from "node:path";
import { readFileSync } from "fs";

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

// I dont want to redeclare these when calling the function.
const mainChannel = "792743975273889812";
const devChannel = "1312517585224339517";

interface I_MusicList {
	name: string;
	artist: string;
	ytmusic: string;
	genre?: string;
	spotify?: string;
	year?: number;
	album?: string;
}

async function musicRecommendations(client: Client) {
	// let guild = await client.guilds.fetch(String(process.env.GUILD_ID));
	// if (!guild) {
	// 	guild = await client.guilds.fetch(String(process.env.DEV_GUILD_ID));
	// }
	try {
		let guild: Guild | undefined;
		if (process.env.NODE_ENV === "development") {
			guild = await client.guilds.fetch(String(process.env.DEV_GUILD_ID));
		} else {
			guild = await client.guilds.fetch(String(process.env.GUILD_ID));
		}
		if (!guild) {
			logError("No guild could be found for music recommendations....");
			return;
		}

		console.log("guild:", guild);
		let channel = await guild.channels.fetch(devChannel);
		if (!channel) {
			channel = await guild.channels.fetch(devChannel);
		}
		if (!channel) {
			logError("No channel could be found for music recommendations....");
			return;
		}
		if (channel.type !== ChannelType.GuildText) {
			logError("Music Recommendations channel is not a text channel.");
			return;
		}

		const rootPath = path.join(__dirname, "../../../");
		const songListPath = path.join(rootPath, "songlist.json");

		const songListFile: I_MusicList[] = require(songListPath)["songs"];
		if (!songListFile) {
			console.error("Failed to load file");
			try {
				delete require.cache[require.resolve(songListPath)];
				return;
			} catch (err: any) {
				logError(err.message);
				return;
			}
		}

		for (const song of songListFile) {
			if (!song.name) {
				console.error("Song name is null...");
				console.log(song);
				try {
					delete require.cache[require.resolve(songListPath)];
					return;
				} catch (err: any) {
					logError(err.message);
					return;
				}
			}
			if (!song.artist) {
				console.error("Artist name is null...");
				console.log(song);
				try {
					delete require.cache[require.resolve(songListPath)];
					return;
				} catch (err: any) {
					logError(err.message);
					return;
				}
			}
			if (!song.ytmusic) {
				console.error("YTMusic is null...");
				console.log(song);
				try {
					delete require.cache[require.resolve(songListPath)];
					return;
				} catch (err: any) {
					logError(err.message);
					return;
				}
			}
			if (!song.spotify) {
				console.error(`Spotify is EMPTY for the song: "${song.name}"`);
			}
			if (!song.year) {
				console.error(`Year is EMPTY for the song: "${song.name}"`);
			}
			if (!song.album) {
				console.error(`Album is EMPTY for the song: "${song.name}"`);
			}
		}

		const randomSong = songListFile[Math.floor(Math.random() * songListFile.length)];

		const embed = embedBuilder("Music Suggestion")
			.setDescription("I found this song in my music room, check it out if you want.")
			.setFields(
				{ name: "Name", value: randomSong.name },
				{ name: "Artist", value: randomSong.artist }
				// { name: "Spotify", value: randomSong.spotify }
			);
		// if (randomSong.yt) {
		// 	embed.setDescription(randomSong.yt);
		// }
		if (randomSong.genre) {
			embed.addFields({ name: "Genre", value: randomSong.genre });
		}
		if (randomSong.year) {
			embed.addFields({ name: "Year", value: String(randomSong.year) });
		}
		if (randomSong.album) {
			embed.addFields({ name: "Album", value: randomSong.album });
		}
		embed.addFields({ name: "YouTube Music", value: randomSong.ytmusic });
		if (randomSong.spotify) {
			embed.addFields({ name: "Spotify", value: randomSong.spotify });
		}

		// stop being dumb TS. We are literally checking it on line 72.
		await channel.send({ embeds: [embed] });

		try {
			delete require.cache[require.resolve(songListPath)];
			return;
		} catch (err: any) {
			logError(err.message);
			return;
		}
	} catch (e: any) {
		logError(e);
		return;
	}
}

const musicLinks: I_BotEvent = {
	name: Events.ClientReady,
	/**
	 * This will do things when the bot is ready to launch. Run it once.
	 * @param {Client} client - The client.
	 */
	async execute(client: Client) {
		setInterval(async () => await musicRecommendations(client), 1 * 10 * 1000);
		// for testing
		// setInterval(async () => await musicRecommendations(client), 1 * 10 * 1000);
	},
	once: true,
};

module.exports = [
	ready,
	musicLinks
];
