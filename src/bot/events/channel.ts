import { Events, Channel } from "discord.js";
import { I_BotEvent } from "../../utilities/interface";

const channelCreate: I_BotEvent = {
	name: Events.ChannelCreate,
	execute(channel: Channel) {
		console.log(`[${new Date().toUTCString()}] - Channel ${channel.id} created`);
	},
};
module.exports = [
	channelCreate,
];
