import { DAO_AddWaifu } from "../database/dao/waifu";
import path from "path";
export async function uploadWaifus() {
	const waifus = [
		{
			name: "Sora",
			location: "Canterlot",
			job: "Princess",
			age: 24,
			race: "Human",
			gender: "Female",
			description: "Sora is a human who loves to play games. She is a member of the guild.",
			interests: ["Princess", "Cosplay", "Gaming", "Cats", "Cock"],
			sfw_images: String(path.join(__dirname, "../assets/waifu/twilight_sparkle/sfw")),
			nsfw_imagepath: String(path.join(__dirname, "../assets/waifu/twilight_sparkle/nsfw")),
		}
	];
	const feedback = await DAO_AddWaifu(waifus);

	feedback.map((f) => {
		console.log(f);
	})
}