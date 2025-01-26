import { AppDataSource } from "../datasource";
import { Waifu } from "../entity";

interface I_Waifu {
	name: string;
	imgpath: string;
	nsfwImgpath: string;
	race: string;
	age: number;
	description: string;
	gender: string;
}

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

		const newWaifu = waifuManager.create(Waifu.Core, {
			name: waifu.name,
			age: waifu.age,
			race: waifu.race,
			gender: waifu.gender,
			description: waifu.description,
			imgpath: waifu.imgpath,
			nsfwImgpath: waifu.nsfwImgpath
		});

		await waifuManager.save(Waifu.Core, newWaifu);

		feedback.push(`Added ${waifu.name} to the database!`);
	}
	return feedback;
}