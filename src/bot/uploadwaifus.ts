import { DAO_AddWaifu } from "../database/dao/waifu";
import path from "path";
import { I_Waifu } from "../utilities/interface";

const assetPath = path.join(__dirname, "../../assets/waifu");
const assetPathMLP = path.join(assetPath, "mlp");

export async function uploadWaifus() {
	try {
		const waifus: I_Waifu[] = [
			{
				name: "Twilight Sparkle",
				location: "Canterlot, Equestria",
				age: 22,
				race: "Alicorn",
				gender: "Female",
				job: "Princess of Friendship",
				description: "Bookworm, princess, and friendship expert! I love learning new things, organizing libraries, and solving magical mysteries. If you enjoy deep conversations, late-night study sessions, and the occasional chaotic adventure (thanks, Pinkie), we might just be a perfect match!",
				interests: ["Magic", "Reading", "Friendship Studies", "Astronomy", "Organizing"],
				tagline: "Swipe right for a magical connection! ✨📖",
				sfwImages: String(path.join(assetPathMLP, "twilight_sparkle/sfw")),
				nsfwImagepath: String(path.join(assetPathMLP, "twilight_sparkle/nsfw")),
				funFacts: [
					"Once turned Ponyville into a disaster zone due to a spell gone wrong.",
					"Has read over 10,000 books (and counting!).",
					"Became an Alicorn after mastering the magic of friendship.",
					"Still gets nervous about being late, even as a princess.",
					"Once had an existential crisis over missing a friendship report."
				],
			},
			{
				"name": "Applejack",
				"location": "Sweet Apple Acres, Ponyville",
				"age": 23,
				"race": "Earth Pony",
				"gender": "Female",
				"job": "Farmer & Co-owner of Sweet Apple Acres",
				"description": "Hardworkin', honest, and always up for an adventure. I believe in honesty, family, and a good ol’ fashioned apple cider. If you can keep up with me in a rodeo or appreciate a peaceful night under the stars, we just might get along.",
				"interests": ["Farming", "Rodeos", "Honest Work", "Cooking", "Lasso Tricks"],
				"tagline": "Strong hooves, stronger heart. 💪🍏",
				"funFacts": [
					"Can buck an entire apple tree in one kick.",
					"Once saved Ponyville from a fruit bat invasion.",
					"Never backs down from a bet.",
					"Has an award-winning apple pie recipe.",
					"Strongest pony in Ponyville!"
				],
				"sfwImages": String(path.join(assetPathMLP, "applejack/sfw")),
				"nsfwImagepath": String(path.join(assetPathMLP, "applejack/nsfw")),
			},
			{
				"name": "Rarity",
				"location": "Carousel Boutique, Ponyville",
				"age": 24,
				"race": "Unicorn",
				"gender": "Female",
				"job": "Fashion Designer & Boutique Owner",
				"description": "A lady of grace, style, and sophistication. I craft beauty in every stitch and believe everyone deserves to shine. If you have an appreciation for elegance, a flair for the dramatic, and can handle a bit of glitter, we’ll get along splendidly.",
				"interests": ["Fashion", "Jewelry", "Spa Days", "Drama", "Tea Parties"],
				"tagline": "Elegance is my second nature. 💎✨",
				"funFacts": [
					"Has designed outfits for royalty.",
					"Once fought off a gang of diamond dogs with charm alone.",
					"Owns multiple boutiques across Equestria.",
					"Could survive on drama alone.",
					"Would literally faint if covered in mud."
				],
				"sfwImages": String(path.join(assetPathMLP, "rarity/sfw")),
				"nsfwImagepath": String(path.join(assetPathMLP, "rarity/nsfw")),
			},
			{
				"name": "Fluttershy",
				"location": "Cottage Near the Everfree Forest",
				"age": 22,
				"race": "Pegasus",
				"gender": "Female",
				"job": "Animal Caretaker",
				"description": "Soft-spoken, kind-hearted, and passionate about caring for animals. I love peaceful days, nature walks, and gentle conversations. If you’re patient, kind, and don’t mind a few critters around, we’ll get along beautifully.",
				"interests": ["Animals", "Nature", "Tea", "Singing", "Helping Others"],
				"tagline": "Gentle souls make the strongest bonds. 🦋💛",
				"funFacts": [
					"Has a pet bunny named Angel (he’s… opinionated).",
					"Once stared down a full-grown dragon.",
					"Knows how to communicate with animals.",
					"Sings like an angel but hates performing.",
					"Turns into a beast when mad."
				],
				"sfwImages": String(path.join(assetPathMLP, "fluttershy/sfw")),
				"nsfwImagepath": String(path.join(assetPathMLP, "fluttershy/nsfw")),
			},
			{
				"name": "Princess Celestia",
				"location": "Canterlot Castle",
				"age": 1000,
				"race": "Alicorn",
				"gender": "Female",
				"job": "Ruler of Equestria",
				"description": "Wise, warm, and ever-patient. I guide Equestria with the power of the sun and a gentle heart. Seeking someone who appreciates long conversations, cosmic mysteries, and a touch of royal grace.",
				"interests": ["Sunrises", "Diplomacy", "Magic", "Cake", "Philosophy"],
				"tagline": "A queen needs no crown—just wisdom. ☀️👑",
				"funFacts": [
					"Raises the sun daily.",
					"Loves cake more than anypony suspects.",
					"Can banish foes to the moon (but won’t unless necessary).",
					"Enjoys playing pranks on Luna.",
					"Secretly loves reading romance novels."
				],
				"sfwImages": String(path.join(assetPathMLP, "princess_celestia/sfw")),
				"nsfwImagepath": String(path.join(assetPathMLP, "princess_celestia/nsfw")),
			},
			{
				"name": "Princess Luna",
				"location": "Canterlot Castle",
				"age": 1000,
				"race": "Alicorn",
				"gender": "Female",
				"job": "Guardian of Dreams & Co-Ruler of Equestria",
				"description": "Mysterious, poetic, and deeply introspective. I watch over the night and protect dreams. If you cherish deep conversations, moonlit walks, and quiet companionship, we may find solace in each other’s company.",
				"interests": ["Stargazing", "Dreamwalking", "Poetry", "Gaming", "Night Flights"],
				"tagline": "The moon’s glow is gentle, yet eternal. 🌙✨",
				"funFacts": [
					"Once turned into Nightmare Moon (but she’s better now!).",
					"Can enter and protect ponies’ dreams.",
					"Secretly loves video games.",
					"Speaks in old-timey royal speech when excited.",
					"Her mane is literally the night sky."
				],
				"sfwImages": String(path.join(assetPathMLP, "princess_luna/sfw")),
				"nsfwImagepath": String(path.join(assetPathMLP, "princess_luna/nsfw")),
			},
			{
				"name": "Princess Cadence",
				"location": "Crystal Empire",
				"age": 25,
				"race": "Alicorn",
				"gender": "Female",
				"job": "Princess of Love & Ruler of the Crystal Empire",
				"description": "Romantic, compassionate, and devoted to spreading love. I believe in the power of relationships, whether friendships or true love. If you’re affectionate, caring, and ready for deep connections, I’d love to meet you!",
				"interests": ["Romance", "Dancing", "Crystal Magic", "Helping Others", "Music"],
				"tagline": "Love is a magic all its own. 💖✨",
				"funFacts": [
					"Once babysat Twilight Sparkle as a filly.",
					"Can sense and strengthen the love between others.",
					"Defeated Queen Chrysalis with the power of love.",
					"Absolutely adores slow dancing.",
					"Married to Shining Armor (but open to friendships!)."
				],
				"sfwImages": String(path.join(assetPathMLP, "princess_cadence/sfw")),
				"nsfwImagepath": String(path.join(assetPathMLP, "princess_cadence/nsfw")),
			},
			{
				"name": "Starlight Glimmer",
				"location": "Ponyville, Equestria",
				"age": 23,
				"race": "Unicorn",
				"gender": "Female",
				"job": "Guidance Counselor at the School of Friendship",
				"description": "Reformed villain, talented magician, and expert at making things... interesting! I believe in self-improvement and second chances. If you enjoy philosophical debates, magic duels, and a bit of mischief, we’ll get along great!",
				"interests": ["Magic", "Philosophy", "Self-Growth", "Time Travel (but safely!)", "Kites"],
				"tagline": "Mistakes make great lessons... and stories! ✨",
				"funFacts": [
					"Once enslaved an entire village (but she’s better now!).",
					"Time-traveled to alternate realities.",
					"Obsessed with kites.",
					"Has powerful magic skills, rivaling Twilight.",
					"Still overthinks every little mistake."
				],
				"sfwImages": String(path.join(assetPathMLP, "starlight_glimmer/sfw")),
				"nsfwImagepath": String(path.join(assetPathMLP, "starlight_glimmer/nsfw")),
			},
			{
				"name": "Sunset Shimmer",
				"location": "Canterlot High (Human World)",
				"age": 24,
				"race": "Unicorn (formerly), now Human",
				"gender": "Female",
				"job": "Musician & Magical Guardian",
				"description": "Ex-bad girl turned hero. Music, magic, and a fiery spirit fuel my world! I value honesty, deep conversations, and personal growth. If you can rock out, support self-improvement, and enjoy spontaneous adventures, we’ll get along just fine!",
				"interests": ["Guitar", "Music", "Magic", "Motorcycles", "Sunsets"],
				"tagline": "From villain to hero—let’s write our own song! 🎸🔥",
				"funFacts": [
					"Once stole Twilight’s crown and became a demon.",
					"Plays a mean electric guitar.",
					"Helped save the human world multiple times.",
					"Loves spicy food.",
					"Has the best leather jacket collection."
				],
				"sfwImages": String(path.join(assetPathMLP, "sunset_shimmer/sfw")),
				"nsfwImagepath": String(path.join(assetPathMLP, "sunset_shimmer/nsfw")),
			}
		];
		// const feedback = await DAO_AddWaifu(waifus);
		const feedback: string[] = [];
		for (const waifu of waifus) {
			const fb = await DAO_AddWaifu(waifu);
			feedback.push(fb.data);
		}

		feedback.map((f) => {
			console.log(f);
		})
		return;
	} catch (E) {
		console.error(E);
		return;
	}
}