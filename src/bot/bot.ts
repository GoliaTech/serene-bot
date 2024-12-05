// This is where the actual bot code lives.
import { Collection, GatewayIntentBits } from "discord.js";
import { ClientExtended, MusicGenres, I_MusicList, I_secretsanta, MusicStyles } from "../utilities/interface";
import { loadCommands, loadEvents } from "./misc/loaders";
import { AppDataSource } from "../database/datasource";
import { logError, logInfo } from "../utilities/utilities";
import { DAO_AddMusic, DAO_GetSongs } from "../database/dao/music";

// For quick testing if commands or events load. I don't want to login every time you see.
const login: boolean = true;
export const loadedEvents = loadEvents();
export const interactionCommands = loadCommands();


export const overwriteSanta = new Collection<string, I_secretsanta>();

async function uploadSongs() {
	const songs: I_MusicList[] = [
		{
			"name": "Jerk",
			"artist": "Oliver Tree",
			"album": "Ugly Is Beautiful",
			"year": 2020,
			"ytmusic": "https://music.youtube.com/watch?v=CSmH6fSMeHY&si=BFi4gBedO6pIEqLw",
			"genre": [MusicGenres.Electronic, MusicGenres.HipHop, MusicGenres.Pop],
			"styles": [MusicStyles.HipHop, MusicStyles.Trap, MusicStyles.DancePop]
		}, {
			"name": "96 Quite Bitter Beings",
			"artist": "CKY",
			"year": 1999,
			"album": "Volume 1",
			"ytmusic": "https://music.youtube.com/watch?v=aVdR6JeEyT8&si=4476TEwK1Kzqam5_",
			"genre": [MusicGenres.Rock],
			styles: [MusicStyles.AlternativeRock, MusicStyles.Punk, MusicStyles.Metal]
		}, {
			"name": "Flesh Into Gear",
			"artist": "CKY",
			"year": 2002,
			"album": "Jackass The Movie",
			"ytmusic": "https://music.youtube.com/watch?v=GpzYqkzBvF8&si=HWFLYMybVRPtELDC",
			"genre": [MusicGenres.Rock],
			"styles": [MusicStyles.Rock, MusicStyles.HardRock]
		}, {
			"name": "Jodellavitanonhocapitouncazzo",
			"artist": "Caparezza",
			"year": 2003,
			"album": "Verità supposte",
			"genre": [MusicGenres.Electronic, MusicGenres.HipHop],
			styles: [MusicStyles.Pop, MusicStyles.HipHop, MusicStyles.Ragga],
			"spotify": "https://open.spotify.com/track/05kv07AcsAQ0HnLsdb4NUA",
			"ytmusic": "https://music.youtube.com/watch?v=Gkxy54639og&si=YN2slMO0oaEWyYFC",
		}, {
			"name": "We Used To Wait",
			"artist": "Arcade Fire",
			"album": "The Suburbs",
			"year": 2010,
			"genre": [MusicGenres.Rock],
			"styles": [MusicStyles.IndieRock],
			"spotify": "https://open.spotify.com/track/37EmPMVwdBaKs7UhJOkHUU",
			"ytmusic": "https://music.youtube.com/watch?v=wRFkxOM90UA&si=i5mJO6SY5A5i9onh",
		}, {
			"name": "Spitting Off the Edge of the World",
			"year": 2022,
			"album": "Cool It Down",
			"artist": "Yeah Yeah Yeahs",
			"ytmusic": "https://music.youtube.com/watch?v=15m_iQaKHVg&si=JD0jQYJOk5cl56aZ",
			"genre": [MusicGenres.IndieRock, MusicGenres.Rock],
			styles: [MusicStyles.IndieRock, MusicStyles.AlternativeRock]
		}, {
			"name": "Now or Never Now",
			"album": "Art of Doubt",
			"year": 2018,
			"artist": "Metric",
			"ytmusic": "https://music.youtube.com/watch?v=bbkAKfmWjsE&si=wVVVZH5A1K4RbIKb",
			"genre": [MusicGenres.Rock, MusicGenres.Alternative],
			styles: [MusicStyles.AlternativeRock, MusicStyles.IndieRock]
		}, {
			"artist": "Ceasars",
			"year": 2002,
			"name": "Jerk It Out",
			"album": "Love For The Streets",
			"ytmusic": "https://music.youtube.com/watch?v=QPXQyks5d2Q&si=kA27FW-xz3tVgFRA",
			"genre": [MusicGenres.Rock],
			styles: [MusicStyles.IndiePop, MusicStyles.AlternativeRock]
		}, {
			"artist": "Discotronic",
			"year": 2022,
			"name": "Tricky Disco (Single Edit)",
			"album": "Hard Dance Mania 9",
			"ytmusic": "https://music.youtube.com/watch?v=zVxhuk-rVfs&si=WAITB1nebLU0BkKX",
			"genre": [MusicGenres.Electronic],
			styles: [MusicStyles.HardHouse, MusicStyles.HardTrance, MusicStyles.Eurodance]
		}, {
			"name": "Where's Your Head At",
			"artist": "Basement Jaxx",
			"ytmusic": "https://music.youtube.com/watch?v=omwXLXeTR4w&si=zKox8gmIYLt_fgOR",
			"spotify": "https://open.spotify.com/track/3cJh89D0za2SW705fNBo3b?si=d8045285e24c4d4e",
			"year": 2001,
			"album": "Rooty",
			"genre": [MusicGenres.Electronic, MusicGenres.Dance],
			styles: [MusicStyles.House, MusicStyles.Breaks]
		}, {
			"ytmusic": "https://music.youtube.com/watch?v=_HRyW5AngTo&si=g5g6IpHLmqPD7KbA",
			"artist": "Yeah Yeah Yeahs",
			"year": 2022,
			"album": "Cool It Down",
			"name": "Wolf",
			"rating": 0,
			"genre": [MusicGenres.IndieRock, MusicGenres.Rock],
			styles: [MusicStyles.IndieRock, MusicStyles.AlternativeRock]
		}, {
			artist: "Modest Mouse",
			album: "Good News For People Who Love Bad News (20th Anniversary Expanded Edition)",
			year: 2024,
			name: "Float On (Dan the Automator Remix)",
			genre: [MusicGenres.Electronic, MusicGenres.Rock, MusicGenres.Pop],
			styles: [MusicStyles.IndieRock, MusicStyles.AlternativeRock],
			ytmusic: "https://music.youtube.com/watch?v=snNuQZ1UnQY&si=Szd6283eXmV2vW3Y"
		}, {
			ytmusic: "https://music.youtube.com/watch?v=crpRvkYzrtE&si=PuoviDSO-OaIooHn",
			name: "Can I Kick It?",
			artist: "A Tribe Called Quest",
			year: 1990,
			album: "People's Instinctive Travels and the Paths of Rhythm (25th Anniversary Edition)",
			genre: [MusicGenres.HipHop]
		}
	];
	// songs.push(song);
	const feedback = await DAO_AddMusic(songs);
	feedback.map((f) => {
		console.log(f);
	});
}

/**
 * This will register events that the client will have to handle.
 * Like for example: ready, banAdd, banRemove, etc.
 * @param discordClient Just parse discordClient here.
 * @param botEvents This is temporarily ANY type, but it will have to be a custom interface.
 */
function eventHandlers(discordClient: ClientExtended, events: any) {
	// Here, we will have to parse a whole collection of bot events, then loop through them.
	// This can be achieved in 2 ways: we either do it here, or we separate them into their own files.
	// It depends on how you like doing things.
	for (const event of events) {
		// So this checks if our event has a parameter called .once.
		// If we do, then we will obviously only run this event once.#

		// (...args) means we are passing any and all arguments into the .execute() function in the event file.
		if (event.once) { discordClient.once(event.name, async (...args) => await event.execute(...args)); }
		else { discordClient.on(event.name, async (...args) => await event.execute(...args)); }
	}
}

/**
 * The main bot function. This is where the main logic of the bot is.
 */
async function bot() {
	try {
		// This creates a new Client, used to tell Discord what do we intend (hence intents) to do with it.
		// Bits means-- parts of the intent. 
		const discordClient = new ClientExtended({
			intents: [
				// Guild intents.
				// This lets you interact with guilds.
				GatewayIntentBits.Guilds,
				// This lets you interact with guild messages.
				GatewayIntentBits.GuildMessages,
				// This lets your bot react to guild messages.
				GatewayIntentBits.GuildMessageReactions,
				// This lets you interact with guild members.
				GatewayIntentBits.GuildMembers,
				// This lets your bot handle moderation tasks in a guild.
				GatewayIntentBits.GuildModeration,
				// This lets your bot interact with typing events.
				GatewayIntentBits.GuildMessageTyping,

				// Private messages.
				// This lets your bot directly message users.
				GatewayIntentBits.DirectMessages,
				// This lets your bot react to message with a user.
				GatewayIntentBits.DirectMessageReactions,
				// This lets your bot interact with typing events in a private message.
				GatewayIntentBits.DirectMessageTyping,

				// Others.
				// This will let your bot see the content of messages. Useful if you want more/different commands than what the applicationCommands provides.
				GatewayIntentBits.MessageContent
			]
		});

		// This will load commands.

		// const loaded = loadCommands();
		// console.log(loaded);
		// if (process.env.NODE_ENV === "development") {
		// 	console.log("DISCORDCLIENT.COMMANDS:\n", discordClient.commands);
		// }

		// Here, before starting the bot, we have to define commands and all that stuff.
		// We will have to pass commands into the event handlers, because these will call the commands.
		// There probably is a better way to do this however.
		if (!loadedEvents) {
			logError("Unable to load events.");
			return;
		}
		if (process.env.NODE_ENV === "development") {
			console.log("Loaded Events:\n", loadedEvents);
		}
		eventHandlers(discordClient, loadedEvents);

		await AppDataSource.initialize();
		await uploadSongs();
		// await DAO_GetSongs();
		if (login) {
			// I don't think we need a try here, but it is probably a smart idea to do it anyway.
			try {
				await discordClient.login(process.env.TOKEN);
				logInfo(`We started the bot for: [ ${process.env.NODE_ENV} ]`);
			} catch (err) {
				logError(`unable to login to client!!!${err}`);
			}
		} else {
			process.exit(1);
		}
	} catch (e: any) {
		console.error(e);
		await AppDataSource.destroy();
		process.exit(1);
	}
}

// This will run the bot.
bot();
