import { AppDataSource } from "../datasource";
import { Waifu } from "../entity";
import { I_Waifu } from "../../utilities/interface";

export async function DAO_AddWaifu(waifus: I_Waifu[]) {
	const waifuManager = AppDataSource.manager;

	const feedback: string[] = [];

	for (const waifu of waifus) {
		const existingWaifu = await waifuManager.findOne(Waifu.Core, {
			where: {
				name: waifu.name,
				race: waifu.race,
				gender: waifu.gender
			}
		});

		if (existingWaifu) {
			feedback.push(`${waifu.name} already exists in the database!`);
			continue; // skip to next
		}

		const waifuObject = {
			name: waifu.name,
			location: waifu.location,
			job: waifu.job,
			age: waifu.age,
			race: waifu.race,
			gender: waifu.gender,
			interests: waifu.interests,
			description: waifu.description,
			sfwImages: waifu.sfw_images,
			nsfwImages: waifu.nsfw_imagepath
		}

		console.log(waifuObject)
		const newWaifu = waifuManager.create(Waifu.Core, waifuObject);

		console.log(waifu);
		console.log(newWaifu)

		await waifuManager.save(Waifu.Core, newWaifu);

		feedback.push(`Added ${waifu.name} to the database!`);
	}
	return feedback;
}