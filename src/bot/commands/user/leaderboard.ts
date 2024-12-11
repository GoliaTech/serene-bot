import { ChatInputCommandInteraction } from "discord.js";
import { commandBuilder, embedBuilder } from "../../misc/builders";
import { I_Command, EmbedColors, I_findOrCreateUser } from "../../../utilities/interface";
import { findOrCreateUser } from "../../../database/dao/user";
import { AppDataSource } from "../../../database/datasource";
import { User } from "../../../database/entity";
import { logError } from "../../../utilities/utilities";

// This is still under testing.
// We could totally just do export, but I want to prepare for possible additional stuff.
const user: I_Command = {
	data: commandBuilder(
		"leaderboard",
		"See who is at the top!",
		{
			dm: true,
		},
	).addStringOption((option) => option
		.setName("leaderboardtype")
		.setDescription("Choose which leaderboard you want to see.")
		.setChoices({ name: "Level", value: "level" }, { name: "Common money", value: "commonmoney" }, { name: "Premium money", value: "premiummoney" })
		.setRequired(true))
		.addStringOption((option) => option
			.setName("leaderboardsort")
			.setDescription("Choose how you want to sort. Default is descending (top to bottom).")
			.setChoices({ name: "Descending", value: "desc" }, { name: "Ascending", value: "asc" })
			.setRequired(false)),
	async execute(interaction: ChatInputCommandInteraction) {
		const embed = embedBuilder("🏆 Leaderboard");
		try {
			let leaderboardType = interaction.options.getString("leaderboardtype", true);
			let leaderboardSort: string | null = "DESC";
			if (interaction.options.getString("leaderboardsort")) {
				if (interaction.options.getString("leaderboardsort") == "asc") leaderboardSort = "ASC";
				else leaderboardSort = "DESC";
			}
			if (leaderboardType == "commonmoney") { leaderboardType = "common_currency"; }
			else if (leaderboardType == "premiummoney") { leaderboardType = "premium_currency"; }

			let users: any[] = [];

			const limit = 10;

			try {
				// let users = await AppDataSource.manager
				// 	.createQueryBuilder(User.Level, "userLevel")
				// 	.innerJoin("userLevel.userCore", "userCore")

				// 	.getMany();
				// let users = await AppDataSource.manager.find(User.Level, {
				// 	relations: ["userCore"],
				// 	order: { prestige: leaderboardSort as any, level: leaderboardSort as any, xp: leaderboardSort as any },
				// });
				// let users = await AppDataSource.manager
				// 	.createQueryBuilder(User.Level, "userLevel")
				// 	.relation(User.)
				// 	.getMany();
				if (leaderboardType === "level") {
					users = await AppDataSource.manager
						.createQueryBuilder(User.Level, "user_level")
						.innerJoinAndSelect("user_level.userCore", "userCore")
						.orderBy("user_level.prestige", leaderboardSort as any)
						.addOrderBy("user_level.level", leaderboardSort as any)
						.addOrderBy("user_level.xp", leaderboardSort as any)
						// this doesnt work, because .userCore is a relation. And i cant set a relation here. for some reason.
						// .addOrderBy("userCore.join_date", "ASC") // Ensure this is a valid field
						.take(limit) // Limit the results to the specified number
						.getMany();
					// .relation(User.Core, "userCore")
				}
				else {
					users = await AppDataSource.manager
						.createQueryBuilder(User.Currency, "user_currency")
						.innerJoinAndSelect("user_currency.userCore", "user_core")
						.orderBy(`user_currency.${leaderboardType}`, leaderboardSort as any)
						// .addOrderBy("user_core.join_date", "ASC")
						.take(limit) // Limit the results to the specified number
						.getMany();
				}
			} catch (error: any) {
				logError(error);
				embed.setColor(EmbedColors.error)
					.setDescription("There was an error fetching the leaderboard. Please try again later.");
				await interaction.reply({ embeds: [embed], ephemeral: true, });
				return;
			}

			console.log("users:", users);
			console.log(JSON.stringify(users));

			if (users.length === 0) {
				embed.setColor(EmbedColors.error)
					.setDescription("No users found for this leaderboard.");
				await interaction.reply({ embeds: [embed], ephemeral: true, });
				return;
			}

			// const ldDisplay: string[] = [];

			const leaderboardDisplay = await Promise.all(
				users.map(async (user, index) => {
					const userInfo = await interaction.client.users.fetch(user.userCore.discord_id);
					console.log(userInfo);
					let display = `**#${index + 1} ${user.userCore.display_name || userInfo.username}**\n`;

					if (leaderboardType === "level") {
						display += `🏅 **Prestige:** ${user.prestige}, **Level:** ${user.level}, **XP:** ${user.xp}`;
					}
					else {
						display += `💰 **Common Money:** ${user.common}, 💎 **Premium Money:** ${user.premium}`;
					}

					console.log(display);
					// ldDisplay.push(display);
					return display;
				})
			);

			console.log(leaderboardDisplay);
			// console.log(ldDisplay);

			embed.setDescription(leaderboardDisplay.join("\n\n"));

			await interaction.reply({ embeds: [embed] });
			return;
		} catch (e: any) {
			logError(e);
			embed.setDescription("Something done goofed in the database. Contact the developer.")
				.setColor(EmbedColors.error);

			await interaction.reply({ embeds: [embed] });
			return;
		}
	}
};

module.exports = [
	user,
];
