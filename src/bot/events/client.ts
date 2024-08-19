import { Client, Events } from "discord.js";
import { I_BotEvent } from "../../utilities/interface";

function setPresence(event: Client) {
	const settingsPath = "../../../settings.json";
	const customPresence: string[] = require(settingsPath)["presence"];
	const randomIndex = Math.floor(Math.random() * customPresence.length);
	const randomPresence = customPresence[randomIndex];
	if (!event.user) {
		throw new Error("User is null somehow. Presence not set.");
	}
	event.user.setPresence({ activities: [{ name: String(randomPresence) }], status: "online" });
	try { delete require.cache[require.resolve(settingsPath)]; } catch (err: any) { console.error(err.message); }
}

const ready: I_BotEvent = {
	name: Events.ClientReady,
	execute(client: Client) {
		console.log(`[${new Date().toUTCString()}] - Client ready`);
		setPresence(client);
	},
	once: true,
};

const presence: I_BotEvent = {
	name: Events.ClientReady,
	execute(client: Client) {
		// 10 * 60 * 1000 = 10 minutes.
		// 60 * 1000 = 1 minute.
		// As this is in milliseconds, 1000 = 1 second.
		setInterval(() => setPresence(client), 10 * 60 * 1000);
	},
};

module.exports = [
	ready, presence
];
