import { AppDataSource } from "../datasource";
import { Waifu } from "../entity";
import { I_Waifu } from "../../utilities/interface";
import { logError } from "../../utilities/utilities";

function waifuCheck(waifu: I_Waifu) {
	if (!waifu.name || !waifu.location || !waifu.job || !waifu.age || !waifu.race || !waifu.gender) {
		return {
			data: "You are missing a required field",
			error: true
		};
	}
	if (waifu.description.length > 400) {
		return { data: `Description for ${waifu.name} is too long, your length: ${waifu.description.length}/400`, error: true };
	}
	return { data: "success", error: false };
}

export async function DAO_AddWaifu(waifu: I_Waifu): Promise<{ data: string, error: boolean }> {
	try {
		const waifuManager = AppDataSource.manager;

		// const feedback: string[] = [];
		let feedback: string = "";
		// for (const waifu of waifus) {
		const waifuChecked = waifuCheck(waifu)
		if (waifuChecked.error) {
			// feedback.push(waifuChecked.data);
			return {
				data: waifuChecked.data,
				error: true
			};
		}
		const existingWaifu = await waifuManager.findOne(Waifu.Core, {
			where: {
				name: waifu.name,
				race: waifu.race,
				gender: waifu.gender
			}
		});

		if (existingWaifu) {
			// feedback.push(`${waifu.name} already exists in the database!\nUpdating....`);
			const fb = await DAO_UpdateWaifu(existingWaifu.id, waifu)
			feedback = fb.data;
			return {
				data: feedback,
				error: false
			}
			// continue; // skip to next
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
			sfwImages: waifu.sfwImages,
			tagline: waifu.tagline,
			funFacts: waifu.funFacts,
			nsfwImages: waifu.nsfwImagepath
		}

		console.log(waifuObject)
		const newWaifu = waifuManager.create(Waifu.Core, waifuObject);

		console.log(waifu);
		console.log(newWaifu)

		await waifuManager.save(Waifu.Core, newWaifu);

		feedback = `Added ${waifu.name} to the database!`;
		// }
		return { data: feedback, error: false };
	} catch (e: any) {
		logError(e);
		return {
			data: "Something terrible happened whilst trying to access database. Contact the developer.",
			error: true,
		};
	}
}

export async function DAO_GetWaifus() { }

export async function DAO_DeleteWaifu() { }

export async function DAO_UpdateWaifu(waifuID: number, updatedWaifu: I_Waifu) {
	try {
		const waifuManager = AppDataSource.manager;
		const waifu = await waifuManager.findOne(Waifu.Core, {
			where: {
				id: waifuID
			}
		});

		if (waifu) {
			let feedback = `${waifu.name} with id: ${waifu.id} already exists! Updating existing Waifu...`;
			if (waifu.name != updatedWaifu.name) {
				feedback += `Waifu name changed from ${waifu.name} to ${updatedWaifu.name}\n`;
				waifu.name = updatedWaifu.name;
			}
			if (waifu.location != updatedWaifu.location) {
				feedback += `Waifu location changed from ${waifu.location} to ${updatedWaifu.location}\n`;
				waifu.location = updatedWaifu.location;
			}
			if (waifu.job != updatedWaifu.job) {
				feedback += `Waifu job changed from ${waifu.job} to ${updatedWaifu.job}\n`;
				waifu.job = updatedWaifu.job;
			}
			if (waifu.age != updatedWaifu.age) {
				feedback += `Waifu age changed from ${waifu.age} to ${updatedWaifu.age}\n`;
				waifu.age = updatedWaifu.age;
			}
			if (waifu.race != updatedWaifu.race) {
				feedback += `Waifu race changed from ${waifu.race} to ${updatedWaifu.race}\n`;
				waifu.race = updatedWaifu.race;
			}
			if (waifu.gender != updatedWaifu.gender) {
				feedback += `Waifu gender changed from ${waifu.gender} to ${updatedWaifu.gender}\n`;
				waifu.gender = updatedWaifu.gender;
			}
			if (waifu.description != updatedWaifu.description) {
				feedback += `Waifu description changed from ${waifu.description} to ${updatedWaifu.description}\n`;
				waifu.description = updatedWaifu.description;
			}
			if (waifu.interests != updatedWaifu.interests) {
				feedback += `Waifu interests changed from ${waifu.interests} to ${updatedWaifu.interests}\n`;
				waifu.interests = updatedWaifu.interests;
			}
			if (waifu.sfwImages != updatedWaifu.sfwImages) {
				feedback += `Waifu sfw_images changed from ${waifu.sfwImages} to ${updatedWaifu.sfwImages}\n`;
				waifu.sfwImages = updatedWaifu.sfwImages;
			}
			if (waifu.nsfwImages != updatedWaifu.nsfwImagepath) {
				feedback += `Waifu nsfw_imagepath changed from ${waifu.nsfwImages} to ${updatedWaifu.nsfwImagepath}\n`;
				waifu.nsfwImages = updatedWaifu.nsfwImagepath;
			}
			await waifuManager.save(Waifu.Core, waifu);
			return {
				data: feedback,
				error: false,
			};
		}

		return {
			data: "Waifu with id: " + waifuID + " does not exist!",
			error: true,
		};

	} catch (e: any) {
		logError(e);
		return {
			data: "Something terrible happened whilst trying to access database. Contact the developer.",
			error: true,
		};
	}
}