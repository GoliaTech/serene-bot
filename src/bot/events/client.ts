import { Client, Events } from "discord.js";
import { I_BotEvent } from "../../utilities/interface";
import { logError, logGeneral } from "../../utilities/utilities";
import { embedBuilder } from "../misc/builders";

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
		setInterval(() => setPresence(client), 10 * 60 * 1000);
	},
	once: true,
};

// I dont want to redeclare these when calling the function.
const mainChannel = "792743975273889812";
const devChannel = "1312517585224339517";
const musicLinkList: {
	name: string;
	artist: string;
	yt: string;
	spotify?: string;
	year?: string;
	album?: string;
}[] = [
		{
			name: "Where's Your Head At",
			artist: "Basement Jaxx",
			yt: "https://music.youtube.com/watch?v=omwXLXeTR4w&si=zKox8gmIYLt_fgOR",
			spotify: "https://open.spotify.com/track/3cJh89D0za2SW705fNBo3b?si=d8045285e24c4d4e",
			year: "2001",
			album: "Rooty"
		}
	];

function musicRecommendations(client: Client) {
	let channel = client.channels.fetch(mainChannel);
	if (!channel) {
		channel = client.channels.fetch(devChannel);
	}
	if (!channel) {
		logError("No channel could be found for music recommendations....");
		return;
	}

	const randomSong = musicLinkList[Math.floor(Math.random() * musicLinkList.length)];

	const embed = embedBuilder("Music Recommendations")
		.setDescription("I found this song in my music room, check it out.")
		.setFields(
			{ name: "Name", value: randomSong.name },
			{ name: "Artist", value: randomSong.artist }
			// { name: "Spotify", value: randomSong.spotify }
		);
	if (randomSong.year) {
		embed.addFields({ name: "Year", value: randomSong.year });
	}
	if (randomSong.album) {
		embed.addFields({ name: "Album", value: randomSong.album });
	}
	embed.addFields({ name: "YouTube Music", value: randomSong.yt });
	if (randomSong.spotify) {
		embed.addFields({ name: "Spotify", value: randomSong.spotify });
	}

	// stop being dumb TS. We are literally checking it on line 72.
	channel.send({ embeds: [embed] });
}

const musicLinks: I_BotEvent = {
	name: Events.ClientReady,
	/**
	 * This will do things when the bot is ready to launch. Run it once.
	 * @param {Client} client - The client.
	 */
	execute(client: Client) {
		setInterval(() => musicRecommendations(client), 1 * 60 * 1000);
	},
	once: true,
};

module.exports = [
	ready,
	musicLinks
];
