import { Collection, Shard, ShardingManager } from "discord.js";
import path from "path";

const shards: Collection<number, Shard> = new Collection();
require("dotenv").config();

/**
 * This code handles setting the NODE_ENV to the correct one.
 */
async function nodeEnv() {
	try {
		// Put the args into a map. This way we can just use .find() param.
		const envMap = {
			"--production": "production",
			"-P": "production",
			"--development": "development",
			"-D": "development"
		};

		// Slice away unnecessary arguments.
		const args: string[] = process.argv.slice(2);
		console.log(args);

		// If the user did not provide any arguments, set default environment.
		if (args.length === 0) {
			console.log("No arguments provided. Setting default environment.");
			process.env.NODE_ENV = "development";
			return;
		}

		// Now handle what the argument has been provided.
		const arg = args.find((arg) => arg in envMap);
		if (arg) {
			process.env.NODE_ENV = envMap[arg as keyof typeof envMap];
		}
		return;
	} catch (e: any) { throw new Error(e.message); }
}

/**
 * This is the main starting point for the bot.
 */
async function startBot() {
	try {
		// This is the part of the code that handles the shards and sharding events.
		const shardArgs: string[] = ["--ansi", "--color"];

		// This is the default. It is also default for "development".
		let execArgv: string[] = ["--inspect=9239", "--trace-warnings"];
		if (process.env.NODE_ENV === "production") {
			execArgv = ["--trace-warnings", "--unhandled-rejections=strict"];
		}

		// I improved the token thing, instead of IF/ELSE, I did this.
		const token = process.env.NODE_ENV === "production" ? String(process.env.TOKEN_PRODUCTION) : process.env.NODE_ENV === "development" ? String(process.env.TOKEN_DEVELOPMENT) : (() => { throw new Error("How did you manage to break NODE_ENV???"); })();

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

// First handle the environment.
nodeEnv();

// Then start the bot.
startBot();