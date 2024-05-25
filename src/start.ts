import { Collection, Shard, ShardingManager } from "discord.js";
import path from "path";

const shards: Collection<number, Shard> = new Collection();
require("dotenv").config();

/**
 * This is the main starting point for the bot.
 */
async function startBot() {
	try {
		// this is where we will start the bot.
		// It will use sharding.

		// 1. We will need to check the bot token.
		// Since this will be both for production and development, we will need to check
		// what argument we are running, then check if we have that token.
		// That will have to be done in a separate function.
		// 2. Start the bot with the shards...
	} catch (e: any) { throw new Error(e.message); }
}

// This basically runs when you run the command.
// It could probably be done in a better way, but this is what we have.
(async () => {
	try { await startBot(); } catch (e) {
		console.error("Logging error in START.TS");
		console.error(`[ERROR] ${new Date().toUTCString()}\nAn unexpected error occurred!`);
		console.error(e);
		process.exit(1);
	}
})();

// We will have to figure out a way to kill the shards when killing the bot.