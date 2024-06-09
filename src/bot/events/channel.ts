import { Events, Channel } from "discord.js";
import { BotEvent } from "../../utilities/interface";

const channelCreate: BotEvent = {
	name: Events.ChannelCreate,
	execute(channel: Channel) {
		console.log(`[${new Date().toUTCString()}] - Channel ${channel.id} created`);
	},
};
module.exports = [
	channelCreate,
];
