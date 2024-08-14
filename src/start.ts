import "reflect-metadata";
import { Collection, Shard, ShardingManager } from "discord.js";
import path from "path";
import { getToken, nodeEnv, getExecArgv } from "./utilities/utilities";
import { loadCommands } from "./bot/misc/loaders";
import { AppDataSource } from "./typeormdb/datasource";
import { User } from "./typeormdb";
require("dotenv").config();

// Initialize shards collection.
const shards: Collection<number, Shard> = new Collection();

/**
 * This will kill shard by shard.
 */
async function killShards() {
	for (const shard of shards) {
		try {
			console.log(`Killing shard ${shard[1].id}`);
			shard[1].kill();
		} catch (e) {
			console.error("Unable to kill shard " + shard[1].id + "\n", e);
		}
	}
}

/**
 * This handles the setting up of the shards.
 * @param manager Parse the manager function here from startBot()
 */
function setupShardEvents(manager: ShardingManager) {
	manager.on("shardCreate", (...args: [shard: Shard]) => {
		shards.set(args[0].id, args[0]);
		console.log(`Launched shard ${args[0].id}\n`);
	});
}

/**
 * This handles recurring shard events.
 * @param managedShards parse managedShards object here from startBot().
 */
function watchShardEvents(managedShards: Collection<number, Shard>) {
	// For each Shard of managed shards.
	for (const shard of managedShards.values()) {
		shard.on("death", () => handleShardDeath(shard));
		shard.on("disconnect", () => console.log(`Shard ${shard.id} disconnected. Reconnecting...`));
		shard.on("ready", () => console.log(`Shard ${shard.id} is ready.`));
		shard.on("reconnecting", () => console.log(`Shard ${shard.id} is reconnecting...`));
		shard.on("spawn", () => console.log(`Shard ${shard.id} spawned.`));

		// This is in case you want to see how many events have been resumed.
		// We have to apply the shard.on even as any, in order for it to function.
		(shard.on as any)("resume", (replayed: number) => {
			console.log(`Shard ${shard.id} resumed. Replayed ${replayed} events.`);
		});
	}
}

/**
 * This will handle the death of a shard.
 * @param shard The shard object.
 */
function handleShardDeath(shard: Shard) {
	console.log(`Shard ${shard.id} died. Restarting...`);
	shards.delete(shard.id);
}

/**
 * This is the main starting point for the bot.
 * This will run the program, it will then create shards and parse execArgv into them.
 * It will have to spawn bots, which require a token.
 * Getting the token is handled in the getToken() function.
 */
async function startBot() {
	try {
		// First handle the environment.
		process.env.NODE_ENV = nodeEnv();

		// This will also set global .env variable: .TOKEN, to be used in other parts of the program.
		process.env.TOKEN = getToken();

		// This is the part of the code that handles the shards and sharding events.
		const shardArgs: string[] = ["--ansi", "--color"];

		// Get execution argument variables based on the environment.
		const execArgv = getExecArgv();

		// This is a fix to test and run TS code directly:
		const fileExtension = process.env.NODE_ENV === "development" ? "ts" : "js";

		const usersDiscordIds = ["371573158978912256", "289098255038676992"];
		for (const id of usersDiscordIds) {
			const reply = await performDatabaseStuff(id);
			console.log("reply", reply);
		}

		const start: boolean = false;
		if (start) {
			// This is a managed that handles the shards and sharding events.
			const manager: ShardingManager = new ShardingManager(path.join(__dirname, `bot/bot.${fileExtension}`), {
				token: process.env.TOKEN,
				execArgv: execArgv,
				shardArgs: shardArgs,
				totalShards: "auto"
			});

			// Load commands for all bots to use.
			loadCommands();

			// Start the setup shard events.
			setupShardEvents(manager);

			// This will spawn a new shard, but also will let us add further events.
			const managedShards: Collection<number, Shard> = await manager.spawn({ amount: "auto", delay: 5000, timeout: 30000 });

			// Now watch for watch shard events.
			watchShardEvents(managedShards);
		} else {
			process.exit(1);
		}
	} catch (e: any) { throw new Error(e.message); }
}

// Then start the bot.
startBot();

// We need to process signals and handling process events here.
process.on("exit", async () => {
	console.log("Got exit signal, quitting...");
	await killShards();
	process.exit(1);
});

process.on("SIGTERM", async () => {
	console.log("Got SIGTERM signal, quitting...");
	await killShards();
	process.exit(1);
});

process.on("SIGKILL", async () => {
	console.log("Got SIGKILL signal, quitting...");
	await killShards();
	process.exit(1);
});

async function performDatabaseStuff(userToGet: string) {
	try {
		await AppDataSource.initialize();
		let userRepo: any = await AppDataSource.manager.findOne(User.Core, {
			where: {
				discord_id: userToGet
			}
		});
		console.log("before !userRepo", userRepo);
		if (!userRepo) {
			const insertUser = await AppDataSource.manager.insert(User.Core, {
				discord_id: userToGet
			});
			userRepo = insertUser.raw;
			console.log("inside !userRepo", userRepo);
		}

		if (userToGet == "371573158978912256") {
			await AppDataSource.manager.remove(userRepo);
		}

		await AppDataSource.destroy();

		return {
			msg: userRepo,
		};
	} catch (e: any) {
		console.error(e);
		return {
			msg: e.msg,
			error: true
		};
	}
}