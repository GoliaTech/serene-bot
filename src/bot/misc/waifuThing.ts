import Canvas from "canvas";
import path from "path";
import fs from "fs";
import { Waifu } from "../../database/entity"
import { Repository } from "typeorm";
import { I_Waifu } from "../../utilities/interface";
Canvas.registerFont(path.join(__dirname, "../../assets/waifu/misc", "Lato-Bold.ttf"), { family: "Open Sans", weight: "bold" });
Canvas.registerFont(path.join(__dirname, "../../assets/waifu/misc", "Lato-Regular.ttf"), { family: "Open Sans" });
// Canvas.registerFont(path.join(__dirname, "../assets", "Roboto-Bold.ttf"), { family: "Open Sans", weight: "bold" });
// Canvas.registerFont(path.join(__dirname, "../assets", "Roboto-Regular.ttf"), { family: "Open Sans" });
/**
 * Returns a random waifu from the database
 */
export async function getRandomWaifu(waifuRepo: Repository<Waifu.Core>): Promise<Waifu.Core> {
	const count = await waifuRepo.count();
	if (count === 0) {
		throw new Error("No waifus in the database!");
	}
	const randomOffset = Math.floor(Math.random() * count);

	// pick one waifu at random
	const [waifu] = await waifuRepo.find({
		skip: randomOffset,
		take: 1,
	});
	console.log(waifu);
	return waifu;
}

/**
 * Utility to get image file paths from a folder
 */
function getImagesFromFolder(folderPath: string): string[] {
	try {
		return fs
			.readdirSync(folderPath)
			.filter((file) => file.match(/\.(png|jpe?g|gif)$/i))
			.map((file) => path.join(folderPath, file));
	} catch (err) {
		// folder might not exist
		return [];
	}
}

/**
 * Returns an array of file paths (SFW images, and NSFW if channel is NSFW)
 */
export function getAllRelevantImages(waifu: Waifu.Core, isChannelNSFW: boolean): string[] {
	// const sfwImages = getImagesFromFolder(waifu.imgpath);
	if (!isChannelNSFW) {
		const sfwImages = getImagesFromFolder(waifu.sfwImages);
		console.log("THIS IS SFW CHANNEL")
		return sfwImages;
	} else {
		console.log("THIS IS NSFW CHANNEL")
		const nsfwImages = getImagesFromFolder(waifu.nsfwImages);
		// return [...sfwImages, ...nsfwImages];
		return nsfwImages
	}
}


// We'll reuse our wrapText from earlier
function wrapText(
	ctx: Canvas.CanvasRenderingContext2D,
	text: string,
	x: number,
	y: number,
	maxWidth: number,
	lineHeight: number
) {
	const words = text.split(" ");
	let currentLine = "";

	for (let i = 0; i < words.length; i++) {
		const testLine = currentLine + words[i] + " ";
		const metrics = ctx.measureText(testLine);
		if (metrics.width > maxWidth && i > 0) {
			// Render current line
			ctx.fillText(currentLine, x, y);
			// Move down
			y += lineHeight;
			// Start a new line
			currentLine = words[i] + " ";
		} else {
			currentLine = testLine;
		}
	}
	if (currentLine) {
		ctx.fillText(currentLine, x, y);
	}
}

async function drawGlobe(
	ctx: Canvas.CanvasRenderingContext2D,
	location: string,
	x: number,
	y: number
) {
	// Load or cache the icon depending on the gender
	const iconPath = path.join(__dirname, "../../assets/waifu/misc", "wireframe-globe.svg");
	const icon = await Canvas.loadImage(iconPath);
	const iconSize = 28;
	ctx.drawImage(icon, x, y - iconSize + 5, iconSize, iconSize);

	// Draw text next to it
	// ctx.font = "28px Sans";
	// ctx.fillStyle = "rgba(0, 0, 0, 0.66)";
	ctx.fillText(` ${location}`, x + iconSize + 10, y);
}

async function drawLikes(
	ctx: Canvas.CanvasRenderingContext2D,
	likes: number,
	x: number,
	y: number
) {
	// Load or cache the icon depending on the gender
	const iconPath = path.join(__dirname, "../../assets/waifu/misc", "heartburn.svg");
	const icon = await Canvas.loadImage(iconPath);
	const iconSize = 28;
	ctx.drawImage(icon, x, y - iconSize + 5, iconSize, iconSize);

	// Draw text next to it
	// ctx.font = "28px Sans";
	// ctx.fillStyle = "rgba(0, 0, 0, 0.66)";
	ctx.fillText(` ${likes}`, x + iconSize + 10, y);
}

async function drawDislikes(
	ctx: Canvas.CanvasRenderingContext2D,
	dislikes: number,
	x: number,
	y: number
) {
	// Load or cache the icon depending on the gender
	const iconPath = path.join(__dirname, "../../assets/waifu/misc", "shattered-heart.svg");
	const icon = await Canvas.loadImage(iconPath);
	const iconSize = 28;
	ctx.drawImage(icon, x - iconSize, y - iconSize + 5, iconSize, iconSize);

	// Draw text next to it
	// ctx.font = "28px Sans";
	// ctx.fillStyle = "rgba(0, 0, 0, 0.66)";
	ctx.fillText(`${dislikes} `, x - iconSize - 10, y);
}

function measureInterestTag(
	ctx: CanvasRenderingContext2D,
	text: string,
	font: string,
	paddingX = 10,
	badgeHeight = 24
): number {
	ctx.font = font;
	const metrics = ctx.measureText(text);
	// Tag width = text width + horizontal padding
	const tagWidth = metrics.width + paddingX * 2;
	// Return a numeric width
	return tagWidth;
}

/**
 * Draw a single interest "badge" with rounded corners, dark background,
 * and white text. 
 * 
 * @param ctx      Canvas 2D context
 * @param text     Interest name (e.g. "Gamer", "Cosplay")
 * @param x        X coordinate to place the badge
 * @param y        Y coordinate (top of the badge)
 * @param font     e.g. "20px 'Open Sans'"
 * @param bgColor  e.g. "#333" or "rgba(0,0,0,0.7)"
 * @param textColor e.g. "#fff"
 */
function drawInterestTag(
	ctx: CanvasRenderingContext2D,
	text: string,
	x: number,
	y: number,
	font: string,
	bgColor = "#333",
	textColor = "#fff",
	paddingX = 10,
	badgeHeight = 24,
	cornerRadius = 8
) {
	ctx.font = font;
	const textMetrics = ctx.measureText(text);
	const badgeWidth = textMetrics.width + paddingX * 2;

	// Draw a rounded rect
	ctx.beginPath();
	roundedRectPath(ctx, x, y, badgeWidth, badgeHeight, cornerRadius);
	ctx.fillStyle = bgColor;
	ctx.fill();

	// Draw the text in white
	ctx.fillStyle = textColor;
	// approximate centering
	const textX = x + paddingX;
	const textY = y + badgeHeight / 2 + textMetrics.actualBoundingBoxAscent / 2 - 2;
	ctx.fillText(text, textX, textY);
}

/**
 * Helper: create a rounded rectangle path
 */
function roundedRectPath(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number
) {
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width - radius, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
	ctx.lineTo(x + width, y + height - radius);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	ctx.lineTo(x + radius, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.closePath();
}

async function drawInterestsRow(
	ctx: any,
	interests: string[],
	x: number,
	y: number
) {
	let currentX = x;
	for (const interest of interests) {
		drawInterestTag(ctx, interest, currentX, y, "20px 'Open Sans'", "#333", "#fff");

		// measure how wide this tag was, so we know where to put the next one
		const textWidth = ctx.measureText(interest).width;
		const badgeWidth = textWidth + 20; // 2 * paddingX
		currentX += badgeWidth + 10; // plus a gap
	}
}

/**
 * Draw multiple interest badges, automatically wrapping to the next line
 * if the next badge doesn't fit within `maxRowWidth`.
 */
function drawInterestsWrapped(
	ctx: any,
	interests: string[],
	xStart: number,
	yStart: number,
	maxRowWidth: number,
	font = "20px 'Open Sans'",
	lineGap = 10,      // vertical gap between rows
	horizontalGap = 10 // horizontal gap between badges
) {
	let currentX = xStart;
	let currentY = yStart;

	const badgeHeight = 28; // or 24, plus a bit for line spacing
	const paddingX = 10;

	for (const interest of interests) {
		// Measure how wide this badge will be
		const tagWidth = measureInterestTag(ctx, interest, font, paddingX, badgeHeight);

		// If adding this badge would exceed max width, move to next line
		if (currentX + tagWidth > maxRowWidth) {
			// Reset to new line
			currentX = xStart;
			currentY += badgeHeight + lineGap;
		}

		// Draw the badge
		drawInterestTag(
			ctx,
			interest,
			currentX,
			currentY,
			font,
			"#333",
			"#fff",
			paddingX,
			badgeHeight
		);

		// Update currentX for the next badge (include horizontal gap)
		currentX += tagWidth + horizontalGap;
	}
}

/**
 * createFakeTinderCard
 * 
 * Generates a PNG where:
 *  - We add extra space at the top & bottom beyond the waifu image
 *  - Top area: black gradient -> Name, Age, Race, Location
 *  - Middle: actual waifu image
 *  - Bottom area: black gradient -> multiline description, plus an "artist" credit in the corner
 *
 * @param baseImagePath Path to the waifu image
 * @param waifu Data for the waifu (name, age, race, location, description, artist, etc.)
 */
export async function createFakeTinderCard(
	waifu: Waifu.Core,
	imagePath: string,
	index: number,
	totalImages: number
): Promise<Buffer> {

	// 1) Load base image
	const baseImage = await Canvas.loadImage(imagePath);
	const w = baseImage.width;
	const h = baseImage.height;

	// 2) Decide how much space to add on top/bottom
	const topMargin = 140;
	const bottomMargin = 200;

	// Final canvas size
	const totalWidth = w;
	const totalHeight = h + topMargin + bottomMargin;

	// 3) Create the canvas
	const canvas = Canvas.createCanvas(totalWidth, totalHeight);
	const ctx = canvas.getContext("2d");

	// Fill entire background with black (or your chosen color)
	ctx.fillStyle = "#fff";
	ctx.fillRect(0, 0, totalWidth, totalHeight);
	// 5) Draw the base image starting below the top gradient
	ctx.drawImage(baseImage, 0, topMargin);

	// draw gradient over the top of the image
	const imageTopGradient = ctx.createLinearGradient(0, topMargin, 0, (topMargin + h) * 0.35);
	imageTopGradient.addColorStop(0, "rgb(0, 0, 0)"); // fully black at top
	imageTopGradient.addColorStop(1, "rgba(0,0,0,0)"); // transparent by the time we reach the image
	ctx.fillStyle = imageTopGradient;
	ctx.fillRect(0, topMargin, totalWidth, (topMargin + h) * 0.35);



	// 6) Draw a bottom gradient (transparent near base image, fully black at bottom)
	const bottomStartY = topMargin + h - 0; // just below the bottom of the base image

	// draw gradient over the bottom of the image
	const imageBottomGradient = ctx.createLinearGradient(0, topMargin + bottomStartY - 300, 0, bottomStartY);
	imageBottomGradient.addColorStop(0, "rgba(0, 0, 0, 0)"); // fully black at top
	imageBottomGradient.addColorStop(1, "rgb(0, 0, 0)"); // transparent by the time we reach the image
	ctx.fillStyle = imageBottomGradient;
	ctx.fillRect(0, bottomStartY - 300, totalWidth, 300);

	// 7) Text at the top: Big name & age, smaller sub-lines (gender/race/location)
	ctx.fillStyle = "#000";
	ctx.textAlign = "left";

	// Big name + age
	ctx.font = "bold 36px 'Open Sans'";
	const topTextX = 20;
	const lineGap = 36; // space between lines
	let textY = 50; // about ~1/3 into the topMargin

	ctx.fillText(`${waifu.name}, ${waifu.age}`, topTextX, textY);

	// Additional lines
	ctx.font = "28px 'Open Sans'";
	textY += lineGap;

	ctx.fillStyle = "rgba(0, 0, 0, 0.66)";
	ctx.fillText(`${waifu.gender}, ${waifu.race}`, topTextX, textY);
	textY += lineGap;
	if (waifu.location) {
		// ctx.fillText(`Location: ${waifu.location}`, topTextX, textY);
		await drawGlobe(ctx, waifu.location, topTextX, textY);
		textY += lineGap;
	}
	if (waifu.job) {
		// ctx.fillText(`Location: ${waifu.location}`, topTextX, textY);
		// ctx.fillText("Princess", topTextX, textY);
		await drawBriefcase(ctx, waifu.job, topTextX, textY);
		textY += lineGap;
	}



	ctx.save();
	const startX = 20;
	const startY = bottomStartY + 10; // for example, just above your description
	const gap = 10;     // spacing between badges horizontally
	const maxRowWidth = canvas.width - 40; // leave 20px margin on right as well


	// If your waifu has an interests array
	if (waifu.interests && waifu.interests.length > 0) {
		// await drawInterestsRow(ctx, waifu.interests, startX, startY);
		await drawInterestsWrapped(ctx, waifu.interests, startX, startY, maxRowWidth);
	}
	ctx.restore();
	// 8) Description at the bottom
	const descX = 20;
	const descY = topMargin + h + 100; // some padding from the bottom image edge
	const descMaxWidth = w - 40;
	const descLineHeight = 30;
	ctx.font = "24px 'Open Sans'";
	ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
	wrapText(
		ctx,
		waifu.description ||
		"No description available. She is a mysterious figure from a distant land…",
		descX,
		descY,
		descMaxWidth,
		descLineHeight
	);

	// 9) Artist credit in bottom-right corner
	ctx.textAlign = "right";
	ctx.font = "14px 'Open Sans'";
	ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
	ctx.fillText(
		// `Art: ${waifu.artist || "Unknown"}`,
		`Art: ${"Unknown"}`,
		w - 10,
		topMargin + 20
	);

	// create page numbering, for amount of images and which image (in index) we are on.
	ctx.textAlign = "center";
	ctx.font = "20px 'Open Sans'";
	ctx.fillStyle = "#FFFFFF";
	ctx.fillText(
		`${index + 1}/${totalImages}`,
		w / 2,
		totalHeight - bottomMargin - 20
	);

	ctx.textAlign = "left";
	await drawLikes(ctx, waifu.likes || 0, 10, totalHeight - bottomMargin - 20);
	ctx.textAlign = "right";
	await drawDislikes(ctx, waifu.dislikes || 0, w - 10, totalHeight - bottomMargin - 20);

	// 10) Export final PNG
	return canvas.toBuffer("image/png");
}

async function drawBriefcase(
	ctx: Canvas.CanvasRenderingContext2D,
	location: string,
	x: number,
	y: number
) {
	// Load or cache the icon depending on the gender
	const iconPath = path.join(__dirname, "../../assets/waifu/misc", "briefcase.svg");
	const icon = await Canvas.loadImage(iconPath);
	const iconSize = 32;
	ctx.drawImage(icon, x, y - iconSize + 5, iconSize, iconSize);

	// Draw text next to it
	// ctx.font = "28px Sans";
	// ctx.fillStyle = "rgba(0, 0, 0, 0.66)";
	ctx.fillText(` ${location}`, x + iconSize + 10, y);
}


/**
 * createFakeTinderCard
 * 
 * Generates a PNG where:
 *  - We add extra space at the top & bottom beyond the waifu image
 *  - Top area: black gradient -> Name, Age, Race, Location
 *  - Middle: actual waifu image
 *  - Bottom area: black gradient -> multiline description, plus an "artist" credit in the corner
 *
 * @param baseImagePath Path to the waifu image
 * @param waifu Data for the waifu (name, age, race, location, description, artist, etc.)
 */
export async function createFakeTinderCardHorizontal(
	waifu: Waifu.Core,
	imagePath: string,
	index: number,
	totalImages: number
): Promise<Buffer> {

	// 1) Load base image
	const baseImage = await Canvas.loadImage(imagePath);
	const w = baseImage.width;
	const h = baseImage.height;

	// 2) Decide how much space to add on top/bottom

	// 2) Decide how much space to add on top/bottom
	const leftMargin = 500;
	// const bottomMargin = 200;

	// Final canvas size
	const totalWidth = w + leftMargin;
	const totalHeight = h;

	// 3) Create the canvas
	const canvas = Canvas.createCanvas(totalWidth, totalHeight);
	const ctx = canvas.getContext("2d");

	// Fill entire background with black (or your chosen color)
	ctx.fillStyle = "#fff";
	ctx.fillRect(0, 0, totalWidth, totalHeight);
	// 5) Draw the base image starting below the top gradient
	ctx.drawImage(baseImage, leftMargin, 0);

	// draw gradient over the top of the image
	const imageTopGradient = ctx.createLinearGradient(0, 0, 0, h * 0.15);
	imageTopGradient.addColorStop(0, "rgb(0, 0, 0)"); // fully black at top
	imageTopGradient.addColorStop(1, "rgba(0,0,0,0)"); // transparent by the time we reach the image
	ctx.fillStyle = imageTopGradient;
	ctx.fillRect(leftMargin, 0, totalWidth - leftMargin, h * 0.15);



	// 6) Draw a bottom gradient (transparent near base image, fully black at bottom)
	// const bottomStartY = topMargin + h - 0; // just below the bottom of the base image

	// draw gradient over the bottom of the image
	const imageBottomGradient = ctx.createLinearGradient(0, totalHeight - 150, 0, totalHeight);
	imageBottomGradient.addColorStop(0, "rgba(0, 0, 0, 0)"); // fully black at top
	imageBottomGradient.addColorStop(1, "rgb(0, 0, 0)"); // transparent by the time we reach the image
	ctx.fillStyle = imageBottomGradient;
	ctx.fillRect(leftMargin, totalHeight - 150, totalWidth, 300);

	// 7) Text at the top: Big name & age, smaller sub-lines (gender/race/location)
	ctx.fillStyle = "#000";
	ctx.textAlign = "left";

	// Big name + age
	ctx.font = "bold 36px 'Open Sans'";
	const topTextX = 20;
	const lineGap = 36; // space between lines
	let textY = 50; // about ~1/3 into the topMargin

	ctx.fillText(`${waifu.name}, ${waifu.age}`, topTextX, textY);

	// Additional lines
	ctx.font = "28px 'Open Sans'";
	textY += lineGap;

	ctx.fillStyle = "rgba(0, 0, 0, 0.66)";
	ctx.fillText(`${waifu.gender}, ${waifu.race}`, topTextX, textY);
	textY += lineGap;
	if (waifu.location) {
		// ctx.fillText(`Location: ${waifu.location}`, topTextX, textY);
		await drawGlobe(ctx, waifu.location, topTextX, textY);
		textY += lineGap;
	}
	if (waifu.job) {
		// ctx.fillText(`Location: ${waifu.location}`, topTextX, textY);
		// ctx.fillText("Princess", topTextX, textY);
		await drawBriefcase(ctx, waifu.job, topTextX, textY);
		textY += lineGap;
	}
	ctx.save();


	const startX = 20;
	const startY = (h / 2) * 0.4; // for example, just above your description
	const gap = 10;     // spacing between badges horizontally
	const maxRowWidth = leftMargin - 40; // leave 20px margin on right as well

	// If your waifu has an interests array
	if (waifu.interests && waifu.interests.length > 0) {
		// await drawInterestsRow(ctx, waifu.interests, startX, startY);
		await drawInterestsWrapped(ctx, waifu.interests, startX, startY, maxRowWidth);
	}
	ctx.restore();
	// 8) Description at the bottom
	const descX = 20;
	const descY = (h / 2) * 0.7; // some padding from the bottom image edge
	const descMaxWidth = leftMargin - 40;
	const descLineHeight = 30;
	ctx.font = "24px 'Open Sans'";
	ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
	wrapText(
		ctx,
		waifu.description ||
		"No description available. She is a mysterious figure from a distant land…",
		descX,
		descY,
		descMaxWidth,
		descLineHeight
	);

	// 9) Artist credit in bottom-right corner
	ctx.textAlign = "right";
	ctx.font = "14px 'Open Sans'";
	ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
	ctx.fillText(
		`Art: ${"Unknown"}`,
		totalWidth - 10,
		20
	);

	// create page numbering, for amount of images and which image (in index) we are on.
	ctx.textAlign = "center";
	ctx.font = "20px 'Open Sans'";
	ctx.fillStyle = "#FFFFFF";
	ctx.fillText(
		`${index + 1}/${totalImages}`,
		(w / 2) + leftMargin,
		totalHeight - 20
	);

	// likes and dislikes
	ctx.textAlign = "left";
	await drawLikes(ctx, waifu.likes, leftMargin + 20, totalHeight - 20);
	ctx.textAlign = "right";
	await drawDislikes(ctx, waifu.dislikes, totalWidth - 20, totalHeight - 20);

	// 10) Export final PNG
	return canvas.toBuffer("image/png");
}