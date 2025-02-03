// src/scheduler/pancakeEventScheduler.ts
import cron from "node-cron";
import { DataSource } from "typeorm";
import { User } from "../../database/entity";
import { findOrCreateUser } from "../../database/dao/user";
import { ChannelType, Client } from "discord.js";

// This variable is a simple in-memory flag to tell if the event is active
// In a clustered environment or multiple processes, you'd store this in a DB or cache
let isPancakeDayActive = false;

export function startPancakeDayEventScheduler(dataSource: DataSource, client: Client) {
	// Cron pattern: “0 0 * * TUE” => every Tuesday at 00:00
	cron.schedule("0 0 * * TUE", async () => {
		console.log("Pancake Day started!");
		isPancakeDayActive = true;

		await announcePancakeDayStart(client)

		// Optionally store the start time in DB, or other logic
		// e.g. create an Event entity row with `start = new Date()`

		// Schedule an automatic end 24 hours later
		setTimeout(async () => {
			console.log("Pancake Day ended!");
			isPancakeDayActive = false;

			await announcePancakeDayEnd(client)

			// Clear pancakesBaked for all users so we reset the leaderboard
			// but keep their ingredients.
			const userRepo = dataSource.getRepository(User.Pancakes);
			await userRepo.createQueryBuilder()
				.update()
				.set({ pancakesBaked: 0 })
				.execute();

			// Optionally store the end time in DB or do something else
		}, 24 * 60 * 60 * 1000); // 24 hours in ms
	});
}

export function getIsPancakeDayActive(): boolean {
	const testing = true;
	if (testing) {
		isPancakeDayActive = true;
		return isPancakeDayActive;
	}
	return isPancakeDayActive;
}

async function announcePancakeDayStart(client: Client) {
	// Ideally do it per guild.
	for (const [, guild] of client.guilds.cache) {
		try {
			console.log("We are trying to send annoucnement")
			const channelID = announcementChannel(guild.id);
			console.log("ChannelID: ", channelID);
			if (!channelID) {
				continue;
			}
			const channel = await client.channels.fetch(channelID);
			console.log("Channel: ", channel);
			if (channel && channel.type === ChannelType.GuildText) {
				console.log("Channel is a text channel")
				// await channel.send({
				// 	"🥞 **Pancake Day has started!** You can now `/pancakecollect` ingredients and bake pancakes for the next 24 hours. Happy cooking! 🥞"
				// })
				await channel.send({ content: "🥞 **Pancake Day has started!** You can now `/pancakecollect` ingredients and bake pancakes for the next 24 hours. Happy cooking! 🥞" })
			}

		} catch (err) {
			console.error(`Failed to announce Pancake Day in guild ${guild.id}:`, err);
			return;
		}
	}
}

async function announcePancakeDayEnd(client: Client) {
	// Ideally do it per guild.
	for (const [, guild] of client.guilds.cache) {
		try {
			const channelID = announcementChannel(guild.id);
			if (!channelID) {
				continue;
			}
			const channel = await client.channels.fetch(channelID);
			if (channel && channel.type === ChannelType.GuildText) {
				// await channel.send({
				// 	"🥞 **Pancake Day has started!** You can now `/pancakecollect` ingredients and bake pancakes for the next 24 hours. Happy cooking! 🥞"
				// })
				await channel.send({ content: "🥞 **Pancake Day has ended!** The leaderboard has been reset. Your ingredients remain, but you’ll need to wait for the next Pancake Day to bake more pancakes." })
			}

		} catch (err) {
			console.error(`Failed to announce end of Pancake Day in guild ${guild.id}:`, err);
			return;
		}
	}
}

function announcementChannel(guildID: string): string | undefined {
	// const channel = process.env.NODE_ENV === "production" ? process.env.ANNOUNCEMENT_CHANNEL_PROD : process.env.ANNOUNCEMENT_CHANNEL_DEV;
	// return channel;
	// const announcemnets = [
	// 	{
	// 		mainGuild: process.env.GUILD_ID,
	// 		channel: process.env.ANNOUNCEMENT_CHANNEL
	// 	},
	// 	{
	// 		devGuild: process.env.DEV_GUILD_ID,
	// 		channel: process.env.DEV_ANNOUNCEMENT_CHANNEL
	// 	}
	// ]

	const annc = new Map<string, string>();
	console.log(process.env.GUILD_ID);
	console.log(process.env.DEV_GUILD_ID);
	console.log(process.env.ANNOUNCEMENT_CHANNEL);
	console.log(process.env.DEV_ANNOUNCEMENT_CHANNEL);
	if (process.env.GUILD_ID === undefined) return undefined;
	if (process.env.DEV_GUILD_ID === undefined) return undefined;
	if (process.env.ANNOUNCEMENT_CHANNEL === undefined) return undefined;
	if (process.env.DEV_ANNOUNCEMENT_CHANNEL === undefined) return undefined;
	annc.set(process.env.GUILD_ID, process.env.ANNOUNCEMENT_CHANNEL);
	annc.set(process.env.DEV_GUILD_ID, process.env.DEV_ANNOUNCEMENT_CHANNEL);

	console.log(annc);
	// console.log()

	const channel = annc.get(guildID);
	console.log("channel in anncouncementChannel: ", channel);
	return channel;
}