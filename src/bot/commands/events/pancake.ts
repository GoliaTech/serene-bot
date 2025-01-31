import { User } from "../../../database/entity";
import { getIsPancakeDayActive } from "../../misc/pancakedayScheduler";
import { findOrCreateUserPancake } from "../../../database/dao/user";
import { EmbedColors, I_Command } from "../../../utilities/interface";
import { AppDataSource } from "../../../database/datasource";
import { addIngredients, addPancakes, deductIngredients, getPancakes } from "../../../database/dao/pancakes";
import { commandBuilder, embedBuilder } from "../../misc/builders";

const collectCommand: I_Command = {
	data: commandBuilder("pancakecollect", "Collect a random amount of pancake ingredients."),
	options: {
		cooldown: 15
	},
	async execute(interaction) {
		// Check if the event is active
		if (!getIsPancakeDayActive()) {
			await interaction.reply({
				content: "Pancake Day is not active right now!",
				ephemeral: true,
			});
			return;
		}

		const user = await findOrCreateUserPancake(interaction.user.id);
		if (typeof user.data === "string") {
			await interaction.reply({
				content: "Something bad happened trying to fetch pancake details...",
				ephemeral: true,
			});
			return;
		}

		// Randomly pick an ingredient among [flour, milk, eggs, whippedCream]
		const ingredients = ["flour", "milk", "eggs", "whippedCream"] as const;
		const chosenIngredient = ingredients[Math.floor(Math.random() * ingredients.length)];

		// Random amount between 1 and 5
		const amount = Math.floor(Math.random() * 5) + 1;


		// (user as any)[chosenIngredient] += amount;

		const addedIngredient = await addIngredients(interaction.user.id, chosenIngredient, amount);
		if (typeof addedIngredient.data === "string") {
			await interaction.reply({
				content: "Something bad happened trying to fetch pancake details...",
				ephemeral: true,
			});
			return;
		}

		await interaction.reply(
			`You collected **${amount}** of **${chosenIngredient}**!`
		);
		return;
	},
};

const checkCommand: I_Command = {
	data: commandBuilder("pancakecheck", "Check how many ingredients and pancakes you have."),
	async execute(interaction) {
		// const user = await findOrCreateUser(interaction.user.id);
		const user = await getPancakes(interaction.user.id);
		if (typeof user.data === "string") {
			await interaction.reply({
				content: "Something bad happend trying to fetch pancake details...",
				ephemeral: true
			});
			return;
		}
		await interaction.reply({
			content: `**Your inventory**:
- Flour: ${user.data.flour}
- Milk: ${user.data.milk}
- Eggs: ${user.data.eggs}
- Whipped Cream: ${user.data.whippedCream}

**Pancakes baked this event**: ${user.data.pancakesBaked} and in your lifetime: ${user.data.lifetimePancakes}`,
			ephemeral: true,
		});
		return;
	},
};

// For puzzle logic, we’ll store ephemeral states in memory for demonstration.
interface BakingSession {
	userId: string;
	isDoublePancake: boolean; // did user solve puzzle?
	puzzleAnswer: number;	// answer to the arithmetic puzzle	
	flipTimeout?: NodeJS.Timeout;
}

// A Map that contains active baking sessions
const activeBakingSessions = new Map<string, BakingSession>();

// Utility to generate a random arithmetic puzzle
function generateArithmeticPuzzle() {
	const ops = ["+", "-", "*", "/"];
	const op = ops[Math.floor(Math.random() * ops.length)];
	const a = Math.floor(Math.random() * 9) + 1; // 1-9
	const b = Math.floor(Math.random() * 9) + 1; // 1-9

	let expression = `${a}${op}${b}`;
	let result: number;
	switch (op) {
		case "+":
			result = a + b;
			break;
		case "-":
			result = a - b;
			break;
		case "*":
			result = a * b;
			break;
		case "/":
			result = a / b;
			break;
		default:
			result = 0;
	}
	// We should be storing as float, but I don't want the user to type the entire .3984u394u3984398 when they get a weird division
	result = Number(result.toFixed(2));
	return { expression, result };
}

const bakeCommand: I_Command = {
	data: commandBuilder("pancakebake", "Start baking a pancake."),
	options: {
		cooldown: 30,
	},
	async execute(interaction) {
		if (!getIsPancakeDayActive()) {
			await interaction.reply({
				content: "Pancake Day is not active right now!",
				options: {
					ephemeral: true,
				}
			});
			return;
		}

		const deductedIngredients = await deductIngredients(interaction.user.id)
		if (typeof deductedIngredients.data === "string") {
			await interaction.reply({
				content: deductedIngredients.data,
				ephemeral: true
			});
			console.error(deductedIngredients.data);
			return;
		}

		const embed = embedBuilder("Pancake baking");

		// Start the baking process: wait 15s, then show puzzle
		await interaction.reply({
			embeds: [embed.setDescription("You started baking a pancake. Please wait **10 seconds**...")],
		});

		setTimeout(async () => {
			// Generate puzzle
			const puzzle = generateArithmeticPuzzle();

			// Create a new session for the user
			activeBakingSessions.set(interaction.user.id, {
				userId: interaction.user.id,
				isDoublePancake: false, // will set to true if puzzle is solved,
				puzzleAnswer: puzzle.result
			});

			await interaction.followUp({
				embeds: [embed.setDescription(
					`**Pancake baking**\n\n` +
					`**${puzzle.expression}** = ?\n\n` +
					`Type your answer using \`/pancakeanswer <number>\`.` +
					`Maximum 2 decimals!`
				)],
			});

			// Listen for the answer (see /answer command below).
			// If we don’t get a correct answer in 10s, we continue with isDoublePancake = false.
			setTimeout(async () => {
				// Puzzle time ended. Now pancake continues cooking for another 15s.
				await interaction.followUp({
					embeds: [embed.setDescription(
						"Puzzle time ended. Pancake is still cooking for another 10 seconds..."
					)]
				});

				setTimeout(async () => {
					// Now user has 10 seconds to flip
					await interaction.followUp({
						embeds: [embed.setDescription(
							"Time to flip your pancake! Use **/flip** within 15 seconds!"
						)]
					});

					// If user doesn't flip, it fails. We'll set a timeout:
					const flipTimeout = setTimeout(async () => {
						// If user never flipped, remove session
						if (activeBakingSessions.has(interaction.user.id)) {
							activeBakingSessions.delete(interaction.user.id);
							await interaction.followUp({
								embeds: [embed.setColor(EmbedColors.error).setDescription(
									"You failed to flip in time. Pancake failed!"
								)]
							});
						}
					}, 15000);

					// Save the flipTimeout in the session, so if they do /flip, we clear it
					const session = activeBakingSessions.get(interaction.user.id);
					if (session) {
						session.flipTimeout = flipTimeout;
						activeBakingSessions.set(interaction.user.id, session);
					}
				}, 10_000);
			}, 15_000);
		}, 10_000);
		return;
	},
};

// ----- /flip -----
const flipCommand: I_Command = {
	data: commandBuilder("pancakeflip", "Flip the pancake."),
	async execute(interaction) {
		const session = activeBakingSessions.get(interaction.user.id);
		if (!session) {
			await interaction.reply({
				content: "You have no pancake to flip right now!",
				options: {
					ephemeral: true,
				}
			});
			return;
		}

		// If we do have a session, flipping completes the pancake
		if (session.flipTimeout) {
			clearTimeout(session.flipTimeout);
		}
		activeBakingSessions.delete(interaction.user.id);

		// Add pancake to user's baked count
		const user = await findOrCreateUserPancake(interaction.user.id);
		if (typeof user.data === "string") {
			await interaction.reply("Something bad happend trying to fetch pancake details...")
			return;
		}
		let increment = 1;
		if (session.isDoublePancake) {
			increment = 2;
		}
		// user.data.pancakes += increment;
		// user.data.lifetimePancakes += increment;

		await addPancakes(user.data.userID, increment)

		await interaction.reply(
			`You successfully flipped the pancake! You earned **${increment}** pancake(s).`
		);
		return;
	},
};

// ----- /answer -----
// This command is used to answer the puzzle. If correct, user’s pancake is worth double.
const answerCommand: I_Command = {
	data: commandBuilder("pancakeanswer", "Answer the baking puzzle.")
		.addNumberOption(input => input.setName("value").setDescription("The answer to the puzzle.").setRequired(true)),
	async execute(interaction) {
		const userId = interaction.user.id;
		const session = activeBakingSessions.get(userId);
		if (!session) {
			await interaction.reply({ content: "You have no active puzzle!", options: { ephemeral: true } });
			return;
		}

		const userAnswer = interaction.options.getNumber("value", true);

		if (userAnswer === session.puzzleAnswer) {
			session.isDoublePancake = true;
			await interaction.reply("Correct! You’ll get a double pancake if you finish baking!");
		} else {
			await interaction.reply("Incorrect answer!");
		}
		return;
	},
};


const leaderboardCommand: I_Command = {
	data: commandBuilder("pancakeleaderboard", "This will show the top 10 users who have baked the most pancakes.", {
		dm: false,
	}),
	async execute(interaction) {
		// Query top 10 users by pancakesBaked
		const pancakeRepo = AppDataSource.getRepository(User.Pancakes);
		const topUsers = await pancakeRepo
			.createQueryBuilder("user")
			.orderBy("user.pancakesBaked", "DESC")
			.limit(10)
			.getMany();

		if (topUsers.length === 0) {
			await interaction.reply("No one has baked any pancakes yet!");
			return;
		}

		const users = await AppDataSource.getRepository(User.Core);
		const usersMap: { discordID: string; username: string; pancakes: number; lifetime: number }[] = [];
		for (const user of topUsers) {
			try {
				const foundUser = await users.findOne({
					where: {
						uuid: user.userID
					}
				})

				if (!foundUser) {
					await interaction.reply("Problem finding a user.");
					return;
				}

				const discordUser = await interaction.guild?.members.fetch(foundUser.discord_id);
				if (!discordUser) {
					await interaction.reply("Problem finding a user.");
					return;
				}
				const userFound = {
					discordID: foundUser.discord_id,
					username: discordUser.user.username,
					pancakes: user.pancakesBaked,
					lifetime: user.lifetimePancakes
				}

				usersMap.push(userFound);
			} catch (error) {
				await interaction.reply("Problem finding a user.");
				return;
			}


		}

		// const displayUsers = usersMap.map((user) => {
		// 	if()
		// })

		// we have to convert, user id to discord id an get their username instead of mentions.
		const leaderboardText = usersMap
			.map(
				(u, i) =>
					`${i + 1}. **${u.username}** — ${u.pancakes} pancake(s) / lifetime: ${u.lifetime}`
			)
			.join("\n");

		await interaction.reply(`**Pancake Day Leaderboard**\n${leaderboardText}`);
		return;
	},
};

module.exports = [
	leaderboardCommand,
	answerCommand,
	flipCommand,
	bakeCommand,
	checkCommand,
	collectCommand
]




// I thought I could make it as a message command, but I think its simpler to do it as an interaction, since we have .follwUp in command interaction.
// That does not exist on message...