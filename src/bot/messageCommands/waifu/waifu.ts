import { AppDataSource } from "../../../database/datasource"; // Import your data source
import { Waifu } from "../../../database/entity";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Message, TextChannel } from "discord.js";
import { createFakeTinderCard, createFakeTinderCardHorizontal, getAllRelevantImages, getRandomWaifu } from "../../misc/waifuThing";
import { I_MessageCommand } from "../../../utilities/interface";
import { ObjectLiteral } from "typeorm";
import { UserWaifuInteraction } from "../../../database/entity/waifu/vote";

const waifuCommand: I_MessageCommand = {
	data: {
		name: "waifu",
	},
	async execute(interaction: Message) {
		try {
			const waifuRepo = AppDataSource.getRepository(Waifu.Core);
			const interactionRepo = AppDataSource.getRepository(Waifu.Vote);
			const waifu = await getRandomWaifu(waifuRepo);
			console.log(waifu);

			const channel = interaction.channel as TextChannel;
			const isChannelNSFW = channel?.nsfw ?? false;

			const images = getAllRelevantImages(waifu, isChannelNSFW);
			if (images.length === 0) {
				interaction.reply("No images available for this waifu.");
				return;
			}

			let currentIndex = 0;

			// Fetch user's previous interaction with this waifu
			let previousInteraction: UserWaifuInteraction | null
			try {
				previousInteraction = await interactionRepo.findOne({
					// where: { userId: interaction.author.id },
					where: { userId: interaction.author.id, waifu: { id: waifu.id } },
					// relations: ["waifu"],
				});
			} catch (err: any) {
				console.error(err);
				interaction.reply("Error fetching previous interaction.");
				return;
			}

			console.log("WE have found all interactions.")

			const buttons = () => {
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

			const compositeImageBuffer = await createFakeTinderCardHorizontal(waifu, images[currentIndex], currentIndex, images.length);

			// console.log("WE have created the composite image.")

			const embed = new EmbedBuilder()
				.setColor("Random")
				.setTitle(`Meet ${waifu.name}!`)
				.setImage("attachment://waifu.png");

			const message = await interaction.reply({
				embeds: [embed],
				files: [{ attachment: compositeImageBuffer, name: "waifu.png" }],
				components: [buttons()],
				// fetchReply: true,
			});

			const collector = message.createMessageComponentCollector({
				time: 10 * 60 * 1000, // 10 minutes
			});

			// The collection has an issue:
			// Sure, it checks what our previous interaction was, but it never re-checks it.
			// Furthermore, everytime we like or dislike, a new row gets added.
			collector.on("collect", async (i) => {
				if (i.user.id !== interaction.author.id) {
					i.reply({ content: "This interaction is not for you!", ephemeral: true });
					return;
				}

				if (i.customId === "like") {
					// Update database
					if (!previousInteraction || previousInteraction.rating !== "like") {
						await interactionRepo.save({
							userId: interaction.author.id,
							waifu: waifu,
							rating: "like",
						});

						waifu.likes++;
						if (previousInteraction?.rating === "dislike") waifu.dislikes--;
						await waifuRepo.save(waifu);
					}
				} else if (i.customId === "dislike") {
					if (!previousInteraction || previousInteraction.rating !== "dislike") {
						await interactionRepo.save({
							userId: interaction.author.id,
							waifu: waifu,
							rating: "dislike",
						});

						waifu.dislikes++;
						if (previousInteraction?.rating === "like") waifu.likes--;
						await waifuRepo.save(waifu);
					}
				} else if (i.customId === "next") {
					currentIndex++;
				} else if (i.customId === "previous") {
					currentIndex--;
				}

				const newCompositeImageBuffer = await createFakeTinderCard(waifu, images[currentIndex], currentIndex, images.length);

				const newEmbed = new EmbedBuilder()
					.setColor("Random")
					.setTitle(`Meet ${waifu.name}!`)
					.setImage("attachment://waifu.png");
				await i.update({
					embeds: [newEmbed],
					files: [{ attachment: newCompositeImageBuffer, name: "waifu.png" }],
					// files: [{ attachment: newCompositeImageBuffer, name: "waifu.png" }],
					components: [buttons()],
				});
			});

			collector.on("end", () => {
				const disabledButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setCustomId("like")
						.setLabel("Like")
						.setStyle(ButtonStyle.Success)
						.setDisabled(true),
					new ButtonBuilder()
						.setCustomId("dislike")
						.setLabel("Dislike")
						.setStyle(ButtonStyle.Danger)
						.setDisabled(true),
					new ButtonBuilder()
						.setCustomId("previous")
						.setLabel("Previous")
						.setStyle(ButtonStyle.Primary)
						.setDisabled(true),
					new ButtonBuilder()
						.setCustomId("next")
						.setLabel("Next")
						.setStyle(ButtonStyle.Primary)
						.setDisabled(true)
				);

				message.edit({
					components: [disabledButtons],
				});
			});
		} catch (error) {
			console.error(error);
			interaction.reply("An error occurred while executing the command.");
		}
	},
};

module.exports = [waifuCommand]
