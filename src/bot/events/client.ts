import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChannelType, Client, Events, TextChannel } from "discord.js";
import { I_BotEvent } from "../../utilities/interface";
import { logError, logGeneral } from "../../utilities/utilities";
import { embedBuilder } from "../misc/builders";
import { randomInt } from "crypto";
import { Music, USI } from "../../database/entity/music";
import { AppDataSource } from "../../database/datasource";
import { writeFile } from "fs";
import path from "path";

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

module.exports = [
	ready
]