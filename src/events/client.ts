import { Events } from "discord.js";
const ready = {
	name: Events.ClientReady,
	once: true,
	execute() {
		console.log(`[${new Date().toUTCString()}] - Client ready`);
	}
};

module.exports = [
	ready
]