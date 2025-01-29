import { AppDataSource } from "../../../database/datasource"; // Import your data source
import { Waifu } from "../../../database/entity";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Message, TextChannel } from "discord.js";
import { createFakeTinderCard, createFakeTinderCardHorizontal, getAllRelevantImages, getRandomWaifu } from "../../misc/waifuThing";
import { I_MessageCommand } from "../../../utilities/interface";

const waifuCommand: I_MessageCommand = {
	data: {
		name: "waifu",
	},
	async execute(interaction: Message) {
		try {
			// Get the repositories.
			const waifuRepo = AppDataSource.getRepository(Waifu.Core);
			const interactionRepo = AppDataSource.getRepository(Waifu.Vote);
			const waifu = await getRandomWaifu(waifuRepo);

			// Apply channel logic.
			const channel = interaction.channel as TextChannel;
			const isChannelNSFW = channel?.nsfw ?? false;

			// Get our images.
			const images = getAllRelevantImages(waifu, isChannelNSFW);
			// If we have no images, what is the point?
			if (images.length === 0) {
				interaction.reply("No images available for this waifu.");
				return;
			}

			// The index of images.
			let currentIndex = 0;

			// This creates like and dislike (and in the future super like) buttons.
			const buttons = async (userId: string) => {
				const previousInteraction = await interactionRepo.findOne({
					where: { userId: userId, waifu: { id: waifu.id } },
				});
				return new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setCustomId("like")
						.setLabel("Like")
						.setStyle(ButtonStyle.Success)
						.setDisabled(previousInteraction?.rating === "like"),
					new ButtonBuilder()
						.setCustomId("dislike")
						.setLabel("Dislike")
						.setStyle(ButtonStyle.Danger)
						.setDisabled(previousInteraction?.rating === "dislike"),

				);
			};

			// This creates previous and next buttons to browse images.
			const imageButtons = () => {
				return new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setCustomId("previous")
						.setLabel("Previous")
						.setStyle(ButtonStyle.Primary)
						.setDisabled(currentIndex === 0),
					new ButtonBuilder()
						.setCustomId("next")
						.setLabel("Next")
						.setStyle(ButtonStyle.Primary)
						.setDisabled(currentIndex === images.length - 1)
				);
			};

			// This creates the image to be attached into the Embed.
			const compositeImageBuffer = await createFakeTinderCardHorizontal(waifu, images[currentIndex], currentIndex, images.length);

			// Create the actual embed.
			const embed = new EmbedBuilder()
				.setColor("Random")
				.setTitle(`Meet ${waifu.name}!`)
				.setImage("attachment://waifu.png");

			// This creates the reply message to the user, with the image file and embed.
			// This also sets a new const variable: message, to be used later.
			const message = await interaction.reply({
				embeds: [embed],
				files: [{ attachment: compositeImageBuffer, name: "waifu.png" }],
				components: [await buttons(interaction.author.id), imageButtons()],
				// fetchReply: true,
			});

			// Create a collector that collects interaction  from the user.
			// Adjusting the first number adjusts the amount of minutes. 
			// Default is 10.
			const collector = message.createMessageComponentCollector({
				time: 10 * 60 * 1000
			});

			// This is the actual collection logic.
			collector.on("collect", async (i) => {
				// We collect interaction only from the user who called it.
				// This can be changed later however.
				if (i.user.id !== interaction.author.id) {
					i.reply({ content: "This interaction is not for you!", ephemeral: true });
					return;
				}

				// Adjust the last interaction we have had with the waifu, in order to disable/enable right buttons and count her likes/dislikes correctly.
				let previousInteraction = await interactionRepo.findOne({
					where: { userId: i.user.id, waifu: { id: waifu.id } },
				});

				// If a user pressed like whilst they don't have a previous interaction, or their previous interaction was a dislike---
				if (i.customId === "like" && (!previousInteraction || previousInteraction.rating !== "like")) {
					// If they had a previous interaction --
					if (previousInteraction) {
						// And that interaction is a dislike ---
						if (previousInteraction.rating === "dislike") {
							// Remove the dislike.
							waifu.dislikes--;
						}
						// Then change our interaction to Like.
						previousInteraction.rating = "like";
						// And finally save it.
						await interactionRepo.save(previousInteraction);
					}
					// IF we had no previous interaction ---
					else {
						// Create a new interaction for them and apply the right rating.
						await interactionRepo.save({ userId: i.user.id, waifu: waifu, rating: "like" });
					}
					// Then add a like --
					waifu.likes++;
					// And finally save the Waifu.
					await waifuRepo.save(waifu);
				}
				// Same as Like.
				else if (i.customId === "dislike" && (!previousInteraction || previousInteraction.rating !== "dislike")) {
					if (previousInteraction) {
						if (previousInteraction.rating === "like") {
							waifu.likes--;
						}
						previousInteraction.rating = "dislike";
						await interactionRepo.save(previousInteraction);
					}
					else {
						await interactionRepo.save({ userId: i.user.id, waifu: waifu, rating: "dislike" });
					}
					waifu.dislikes++;
					await waifuRepo.save(waifu);
				}
				// Go to the next image.
				else if (i.customId === "next") {
					currentIndex++;
				}
				// Go to the previous image.
				else if (i.customId === "previous") {
					currentIndex--;
				}

				// Createa a new image for our attachments!
				const newCompositeImageBuffer = await createFakeTinderCardHorizontal(waifu, images[currentIndex], currentIndex, images.length);

				// Create a new embed!
				const newEmbed = new EmbedBuilder()
					.setColor("Random")
					.setTitle(`Meet ${waifu.name}!`)
					.setImage("attachment://waifu.png");

				// Update our interaction!
				await i.update({
					embeds: [newEmbed],
					files: [{ attachment: newCompositeImageBuffer, name: "waifu.png" }],
					components: [await buttons(i.user.id), imageButtons()],
				});
			});

			// When our time to collect is up, we delete the message, or the buttons.
			collector.on("end", async () => {
				// const disabledButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
				// 	new ButtonBuilder()
				// 		.setCustomId("like")
				// 		.setLabel("Like")
				// 		.setStyle(ButtonStyle.Success)
				// 		.setDisabled(true),
				// 	new ButtonBuilder()
				// 		.setCustomId("dislike")
				// 		.setLabel("Dislike")
				// 		.setStyle(ButtonStyle.Danger)
				// 		.setDisabled(true),
				// 	new ButtonBuilder()
				// 		.setCustomId("previous")
				// 		.setLabel("Previous")
				// 		.setStyle(ButtonStyle.Primary)
				// 		.setDisabled(true),
				// 	new ButtonBuilder()
				// 		.setCustomId("next")
				// 		.setLabel("Next")
				// 		.setStyle(ButtonStyle.Primary)
				// 		.setDisabled(true)
				// );

				// message.edit({
				// 	components: [disabledButtons],
				// });

				await message.delete();
			});
		}
		// In case shit hits the fan.
		catch (error) {
			console.error(error);
			interaction.reply("An error occurred while executing the command.");
			return;
		}
	},
};

module.exports = [
	waifuCommand
];
