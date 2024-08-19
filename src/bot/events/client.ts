import { Events } from "discord.js";
import { I_BotEvent } from "../../utilities/interface";

const ready: I_BotEvent = {
	name: Events.ClientReady,
	execute() {
		console.log(`[${new Date().toUTCString()}] - Client ready`);
	},
	once: true,
};

module.exports = [
	ready
];
