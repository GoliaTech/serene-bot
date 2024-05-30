import { Collection, Shard, ShardingManager } from "discord.js";
import path from "path";
// import { config } from "dotenv";
// config();
require("dotenv").config();

const shards: Collection<number, Shard> = new Collection();

/**
 * This code handles setting the process.env.NODE_ENV to the correct one.
 * This is necessary as the rest of the program requires a properly functioning process.env.NODE_ENV to work right.
 */
async function nodeEnv() {
	try {
		// Default environment.
		const defaultEnv = "development";

		// Here we will instantly define that the key is a string and the value it holds is also a string.
		const envMap: { [key: string]: string; } = {
			"--production": "production",
			"-P": "production",
			"-D": defaultEnv,
			"--development": defaultEnv
		};

		// Slice away the unnecessary stuff at the start.
		const args: string[] = process.argv.slice(2);

		// Determine the environment based on the provided arguments.
		const env = args.find(arg => envMap[arg]) || defaultEnv;
		process.env.NODE_ENV = envMap[env] || env;

		// Lets handle the token here as well.
		// This will also set global .env variable: .TOKEN, to be used in other parts of the program.
		process.env.TOKEN = getToken();

		return;
	} catch (e: any) { throw new Error(e.message); }
}

/**
 * These are the shard's execution argument variables. 
 * You want to keep different execArgv for production and development.
 * This function handles that separation.
 * @returns {string[]} - The array of execArgv to be parsed into shards.
 */
function getExecArgv(): string[] {
	if (process.env.NODE_ENV === "production") {
		return [
			"--trace-warnings",
			"--unhandled-rejections=strict"
		];
	}
	// If it is not production. You can modify this array however you want.
	// What --inspect does, is it launches node inspector.
	return [
		// "--inspect=9239",
		"--trace-warnings",
		"-r",
		"ts-node/register"
	];
}

/**
 * This checks what process.env.NODE_ENV you are running and returns correct bot token.
 * This is in case you have 2 bots, one for development and one for production.
 * @returns {string} - The token.
 */
function getToken(): string {
	// return process.env.NODE_ENV === "production" ? String(process.env.TOKEN_PRODUCTION) : process.env.NODE_ENV === "development" ? String(process.env.TOKEN_DEVELOPMENT) : (() => { throw new Error("How did you manage to break NODE_ENV???"); })();
	if (process.env.NODE_ENV === "production") {
		return process.env.TOKEN_PRODUCTION || handleTokenError("TOKEN_PRODUCTION");
	} else if (process.env.NODE_ENV === "development") {
		return process.env.TOKEN_DEVELOPMENT || handleTokenError("TOKEN_DEVELOPMENT");
	} else {
		throw new Error("Invalid NODE_ENV value: expected 'production' or 'development'.");
	}
}

/**
 * Setting this to :never fixes the issue in getToken where it thought it would be returning void.
 * @param error The error message
 */
function handleTokenError(error: string): never {
	throw new Error(`Environment variable ${error} is not set.`);
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

		// this is in case you want to see how many events have been resumed.
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
		// This is the part of the code that handles the shards and sharding events.
		const shardArgs: string[] = ["--ansi", "--color"];

		// Get execution argument variables based on the environment.
		const execArgv = getExecArgv();

		// This is a fix to test and run TS code directly:
		const fileExtension = process.env.NODE_ENV === "development" ? "ts" : "js";
		// const fileExtension = "js";

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
	} catch (e: any) { throw new Error(e.message); }
}

// First handle the environment.
nodeEnv();

// Then start the bot.
startBot();

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
