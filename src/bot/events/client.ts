import { Events } from "discord.js";
import { BotEvent } from "../../utilities/interface";

const ready: BotEvent = {
	name: Events.ClientReady,
	execute() {
		console.log(`[${new Date().toUTCString()}] - Client ready`);
	},
	once: true,
};

module.exports = [
	ready
];
