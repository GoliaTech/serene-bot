import "reflect-metadata";
import { Collection, Shard, ShardingManager } from "discord.js";
import path from "path";
import { getToken, nodeEnv, getExecArgv, logInfo, logError } from "./utilities/utilities";
import { AppDataSource } from "./database/datasource";

require("dotenv").config();

// whether we should actually start the program.
const start: boolean = true;

// Initialize shards collection.
const shards: Collection<number, Shard> = new Collection();

/**
 * This will kill shard by shard.
 */
async function killShards() {
	for (const shard of shards) {
		try {
			logInfo(`Killing shard ${shard[1].id}`);
			shard[1].kill();
		} catch (e) {
			logError(`Unable to kill shard ${shard[1].id}\n${e}`);
		}
	}
}

/**
 * This handles the setting up of the shards.
 * @param {ShardingManager} manager Parse the manager function here from startBot()
 */
function setupShardEvents(manager: ShardingManager) {
	manager.on("shardCreate", (...args: [shard: Shard]) => {
		shards.set(args[0].id, args[0]);
		logInfo(`Launched shard ${args[0].id}`);
	});
}

/**
 * This handles recurring shard events.
 * @param {Collection<number, Shard>} managedShards parse managedShards object here from startBot().
 */
function watchShardEvents(managedShards: Collection<number, Shard>) {
	// For each Shard of managed shards.
	for (const shard of managedShards.values()) {
		shard.on("death", () => handleShardDeath(shard));
		shard.on("disconnect", () => logInfo(`Shard ${shard.id} disconnected. Reconnecting...`));
		shard.on("ready", () => logInfo(`Shard ${shard.id} is ready.`));
		shard.on("reconnecting", () => logInfo(`Shard ${shard.id} is reconnecting...`));
		shard.on("spawn", () => logInfo(`Shard ${shard.id} spawned.`));

		// This is in case you want to see how many events have been resumed.
		// We have to apply the shard.on even as any, in order for it to function.
		(shard.on as any)("resume", (replayed: number) => {
			logInfo(`Shard ${shard.id} resumed. Replayed ${replayed} events.`);
		});
	}
}

/**
 * This will handle the death of a shard.
 * @param {Shard} shard The shard object.
 */
function handleShardDeath(shard: Shard) {
	logInfo(`Shard ${shard.id} died. Restarting...`);
	shards.delete(shard.id);
}

// async function performDatabaseStuff() {
// 	const userId = process.env.OWNER_ID || "289098255038676992";

// 	// const response = await findOrCreateUser(userId);
// 	// if (response.error) {
// 	// 	console.log(response.data);
// 	// }
// 	// return response.data;

// 	const response = await findAllCharacters();
// 	console.log(response);
// }

/**
 * This is the main starting point for the bot.
 * This will run the program, it will then create shards and parse execArgv into them.
 * It will have to spawn bots, which require a token.
 * Getting the token is handled in the getToken() function.
 */
async function startBot() {
	try {
		logInfo("We are now starting your bot...");
		// First handle the environment.
		process.env.NODE_ENV = nodeEnv();

		// This will also set global .env variable: .TOKEN, to be used in other parts of the program.
		process.env.TOKEN = getToken();

		// This is the part of the code that handles the shards and sharding events.
		const shardArgs: string[] = ["--ansi", "--color"];

		// Get execution argument variables based on the environment.
		const execArgv = getExecArgv();

		// This is a fix to test and run TS code directly:
		// const fileExtension = process.env.NODE_ENV === "development" ? "ts" : "js";
		// I decided to not go with the deployement thing, using Javascript. Rather, the whole thing runs on TSnode. Yes, you can still build it, but really - i have limited time and it was just a hassle adapting everything that worked during dev on TSnode to JS. 
		const fileExtension = "ts";

		if (start == false) {
			// console.info(await performDatabaseStuff());
		}
		else if (start) {
			// await AppDataSource.initialize();
			// This is a managed that handles the shards and sharding events.
			const manager: ShardingManager = new ShardingManager(path.join(__dirname, `bot/bot.${fileExtension}`), {
				token: process.env.TOKEN,
				execArgv: execArgv,
				shardArgs: shardArgs,
				totalShards: "auto"
			});

			// Start the setup shard events.
			setupShardEvents(manager);

			// This will spawn a new shard, but also will let us add further events.
			const managedShards: Collection<number, Shard> = await manager.spawn({ amount: "auto", delay: 5000, timeout: 30000 });

			// Now watch for watch shard events.
			watchShardEvents(managedShards);
		} else {
			await AppDataSource.destroy();
			process.exit(1);
		}
	} catch (e: any) {
		logError(e);
		await AppDataSource.destroy();
		throw new Error(e.message);
	}
}

// Then start the bot.
startBot();

// We need to process signals and handling process events here.
// This is broken on JS, but works fine with TS.
process.on("exit", async () => {
	console.log("Got exit signal, quitting...");
	await killShards();
	await AppDataSource.destroy();
	process.exit(1);
});

process.on("SIGTERM", async () => {
	console.log("Got SIGTERM signal, quitting...");
	await killShards();
	await AppDataSource.destroy();
	process.exit(1);
});

process.on("SIGKILL", async () => {
	console.log("Got SIGKILL signal, quitting...");
	await killShards();
	await AppDataSource.destroy();
	process.exit(1);
});
