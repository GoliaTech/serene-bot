import { Collection, Shard, ShardingManager } from "discord.js";
import path from "path";

const shards: Collection<number, Shard> = new Collection();
require("dotenv").config();

/**
 * This is the main starting point for the bot.
 */
async function startBot() {
	try {
		const shardArgs: string[] = ["--ansi", "--color"];
		let execArgv: string[] = ["--inspect=9239", "--trace-warnings"];
		if (process.env.NODE_ENV === "production") {
			execArgv = ["--trace-warnings", "--unhandled-rejections=strict"];
		}

		// We have to create a token checker, in case this is a dev or a production environment.
		let token: string = "";
		if (process.env.NODE_ENV === "production") {
			token = String(process.env.TOKEN_PRODUCTION);
		} else if (process.env.NODE_ENV === "development") {
			token = String(process.env.TOKEN_DEVELOPMENT);
		} else {
			throw new Error("How did you manage to break NODE_ENV???");
		}

		// This is a managed that handles the shards and sharding events.
		const manager: ShardingManager = new ShardingManager(path.join(__dirname, "bot.js"), {
			token: token,
			execArgv: execArgv,
			shardArgs: shardArgs,
			totalShards: "auto"
		});

		// This is the event that handles shard creation.
		manager.on("shardCreate", (...args: [shard: Shard]) => {
			shards.set(args[0].id, args[0]);
			console.log(`Launched shard ${args[0].id}\n`);
		});

		// This will spawn a new shard, but also will let us add further events.
		const managedShards: Collection<number, Shard> = await manager.spawn({ amount: "auto", delay: 5000, timeout: 30000 });
		// From here, we can make it watch for other shard events, like disconnect, death, ready, etc.
		for (const shard of managedShards.values()) {
			shard.on("death", () => {
				console.log(`Shard ${shard.id} died. Restarting...`);
				shards.delete(shard.id);
			});
			shard.on("disconnect", () => console.log(`Shard ${shard.id} disconnected. Reconnecting...`));
			shard.on("ready", () => console.log(`Shard ${shard.id} is ready.`));
			shard.on("reconnecting", () => console.log(`Shard ${shard.id} is reconnecting...`));
			// This does not work.
			// shard.on("resume", (replayed: number) => { console.log(`Shard ${shard.id} resumed. Replayed ${replayed} events.`); });
			// This however does.
			(shard.on as any)("resume", (replayed: number) => {
				console.log(`Shard ${shard.id} resumed. Replayed ${replayed} events.`);
			});
			shard.on("spawn", () => console.log(`Shard ${shard.id} spawned.`));
		}
	} catch (e: any) { throw new Error(e.message); }
}

startBot();
