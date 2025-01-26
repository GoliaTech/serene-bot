import { DAO_AddWaifu } from "../database/dao/waifu";
import path from "path";
export async function uploadWaifus() {
	const waifus = [
		{
			name: "Sora",
			race: "Human",
			age: 24,
			description: "Sora is a human who loves to play games. She is a member of the guild.",
			gender: "Female",
			imgpath: path.join(__dirname, "../assets/waifu/twilight_sparkle/sfw"),
			nsfwImgpath: path.join(__dirname, "../assets/waifu/twilight_sparkle/nsfw"),
		}
	];
	const feedback = await DAO_AddWaifu(waifus);

	feedback.map((f) => {
		console.log(f);
	})
}