import { Collection, Shard, ShardingManager } from "discord.js";
import path from "path";

const shards: Collection<number, Shard> = new Collection();
require("dotenv").config();

/**
 * This is the main starting point for the bot.
 */
async function startBot() {
	try {

		// Skeleton
		const manager: ShardingManager = new ShardingManager(path.join(__dirname, "bot.js"), { token: process.env.TOKEN });

		manager.on("shardCreate", (shard) => {
			shards.set(shard.id, shard);
			console.log(`Launched shard ${shard.id}`);
		});

		await manager.spawn();
	} catch (e: any) { throw new Error(e.message); }
}

startBot();
