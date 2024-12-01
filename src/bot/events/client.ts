import { ChannelType, Client, Events } from "discord.js";
import { I_BotEvent } from "../../utilities/interface";
import { logError, logGeneral } from "../../utilities/utilities";
import { embedBuilder } from "../misc/builders";
import { randomInt } from "crypto";

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
const musicLinkList: {
	name: string;
	artist: string;
	ytmusic: string;
	genre?: string;
	spotify?: string;
	year?: number;
	album?: string;
	yt?: string;
}[] = [
		{
			name: "Where's Your Head At",
			artist: "Basement Jaxx",
			ytmusic: "https://music.youtube.com/watch?v=omwXLXeTR4w&si=zKox8gmIYLt_fgOR",
			spotify: "https://open.spotify.com/track/3cJh89D0za2SW705fNBo3b?si=d8045285e24c4d4e",
			year: 2001,
			album: "Rooty",
			yt: "https://www.youtube.com/watch?v=5rAOyh7YmEc",
			genre: "Dance/Electronic"
		},
		{
			name: "Jerk",
			artist: "Oliver Tree",
			album: "Ugly Is Beautiful",
			year: 2020,
			ytmusic: "https://music.youtube.com/watch?v=CSmH6fSMeHY&si=BFi4gBedO6pIEqLw",
			genre: "Alternative/Indie"
		},
		{
			name: "96 Quite Bitter Beings",
			artist: "CKY",
			year: 1999,
			album: "Volume 1",
			ytmusic: "https://music.youtube.com/watch?v=aVdR6JeEyT8&si=4476TEwK1Kzqam5_",
			genre: "Metal/Rock",
		},
		{
			name: "Flesh Into Gear",
			artist: "CKY",
			year: 2002,
			album: "Jackass The Movie",
			ytmusic: "https://music.youtube.com/watch?v=GpzYqkzBvF8&si=HWFLYMybVRPtELDC",
			genre: "Metal/Rock",
		}
	];

async function musicRecommendations(client: Client) {
	let guild = await client.guilds.fetch(String(process.env.GUILD_ID));
	if (!guild) {
		guild = await client.guilds.fetch(String(process.env.DEV_GUILD_ID));
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

	const randomSong = musicLinkList[Math.floor(Math.random() * musicLinkList.length)];

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
}

const musicLinks: I_BotEvent = {
	name: Events.ClientReady,
	/**
	 * This will do things when the bot is ready to launch. Run it once.
	 * @param {Client} client - The client.
	 */
	async execute(client: Client) {
		// setInterval(async () => await musicRecommendations(client), randomInt(55, 95) * 60 * 1000);
		setInterval(async () => await musicRecommendations(client), 1 * 10 * 1000);
	},
	once: true,
};

module.exports = [
	ready,
	musicLinks
];
