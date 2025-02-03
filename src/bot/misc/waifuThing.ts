import Canvas from "canvas";
import path from "path";
import fs from "fs";
import { Waifu } from "../../database/entity"
import { Repository } from "typeorm";
import { E_WaifuIcons, I_Waifu } from "../../utilities/interface";
const assetsPath = path.join(__dirname, "../../../assets/waifu");
Canvas.registerFont(path.join(__dirname, "../../../assets/waifu/misc", "Lato-Bold.ttf"), { family: "Open Sans", weight: "bold" });
Canvas.registerFont(path.join(__dirname, "../../../assets/waifu/misc", "Lato-Regular.ttf"), { family: "Open Sans" });

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
		let nsfwImages = getImagesFromFolder(waifu.nsfwImages);
		// In case we have no NSFW images.
		if (nsfwImages.length === 0) {
			nsfwImages = getImagesFromFolder(waifu.sfwImages);
		}
		// return [...sfwImages, ...nsfwImages];
		return nsfwImages
	}
}

/**
 * Wrap a single line of text into multiple lines, drawing each line to the canvas
 * at the specified x, y coordinates, with a specified line height and maximum
 * width. The text is split into words, and each word is added to the current line
 * until the line exceeds the maximum width. Then, the current line is drawn to
 * the canvas, and the next line is started.
 *
 * @param {Canvas.CanvasRenderingContext2D} ctx - The canvas context to draw to
 * @param {string} text - The text to draw
 * @param {number} x - The x coordinate of the top-left corner of the text
 * @param {number} y - The y coordinate of the top-left corner of the text
 * @param {number} maxWidth - The maximum width of a line of text
 * @param {number} lineHeight - The height of each line of text
 * @returns {number} - The y coordinate of the next line
 */
function wrapText(
	ctx: Canvas.CanvasRenderingContext2D,
	text: string,
	x: number,
	y: number,
	maxWidth: number,
	lineHeight: number = 10,
	font: string = "20px 'Open Sans'",
	fontStyle: string = "#000",
	textAlign: CanvasTextAlign = "left"
): number {
	// splits the text into words.
	const words = text.split(" ");
	// sets the current line to an empty string.
	let currentLine = "";
	// sets the Y coordinate of the current line.
	let lineY = y;
	let lineCount = 1;

	// Set our font
	ctx.font = font;
	ctx.fillStyle = fontStyle;
	ctx.textAlign = textAlign;

	// Iterate over each word in the text.
	for (const word of words) {
		// Create a test line by adding the current word to the current line.
		const testLine = currentLine + word + " ";

		// Measure the width of the test line.
		const { width: testLineWidth } = ctx.measureText(testLine);

		// If the test line exceeds the maximum width, draw the current line and
		// start a new line with the current word.
		if (testLineWidth > maxWidth && currentLine !== "") {
			ctx.fillText(currentLine, x, lineY);
			lineY += lineHeight;
			lineCount++;
			currentLine = word + " ";
		} else {
			// Otherwise, add the current word to the current line.
			currentLine = testLine;
		}
	}

	// Draw the final line of text.
	if (currentLine !== "") {
		ctx.fillText(currentLine, x, lineY);
	}
	ctx.save();
	// Dynamic saving.
	return lineHeight * lineCount;
}

async function drawIconAndText(
	ctx: Canvas.CanvasRenderingContext2D,
	x: number = 10,
	y: number,
	iconName: E_WaifuIcons | undefined,
	text: string,
	maxTextWidth: number,
	font: string = "20px 'Open Sans'",
	fontStyle: string = "#000",
	lineGap: number = 10,
	textAlign: CanvasTextAlign = "left"
) {
	// Apply alignment
	ctx.textAlign = textAlign;
	// Set basic icon stuff
	let icon, iconSize = 28;
	if (iconName) {
		// Load icon
		icon = await Canvas.loadImage(
			path.join(assetsPath, "misc", iconName),
		);
		// set the size;
		iconSize = 28;
		// Draw the image
		ctx.drawImage(icon, x, y - iconSize + 5, iconSize, iconSize);
		// Apply correct margin depending on the alignment
		let textMarginFromImage = x + iconSize + 10;
		if (textAlign == "left") {
			textMarginFromImage = x + iconSize + 10;
		} else if (textAlign == "right") {
			textMarginFromImage = x - iconSize - 10;
		}

		// Apply new Y based on text wrapping
		y = wrapText(ctx,
			text,
			textMarginFromImage,
			y,
			maxTextWidth,
			lineGap,
			font,
			fontStyle,
			textAlign
		);

		// Return;
		return y
	}

	// No icon
	y = wrapText(ctx,
		text,
		x,
		y,
		maxTextWidth,
		lineGap,
		font,
		fontStyle,
		textAlign
	);
	return y
}

/**
 * Draws a heart icon and the number of likes to the canvas at the specified location.
 *
 * @param {Canvas.CanvasRenderingContext2D} ctx - The canvas context to draw to
 * @param {number} numberOfLikes - The number of likes to draw
 * @param {number} iconXCoordinate - The x coordinate of the top-left corner of the icon
 * @param {number} iconYCoordinate - The y coordinate of the top-left corner of the icon
 */
async function drawLikes(
	ctx: Canvas.CanvasRenderingContext2D,
	numberOfLikes: number,
	iconXCoordinate: number,
	iconYCoordinate: number
) {
	// Load the heart icon from the assets directory
	const heartIconPath = path.join(assetsPath, "misc", "heartburn.svg");
	const heartIcon = await Canvas.loadImage(heartIconPath);

	// Determine the size of the icon
	const heartIconSize = 28;

	// Calculate the coordinates for the icon and text
	const textXCoordinate = iconXCoordinate + heartIconSize + 10;
	const textYCoordinate = iconYCoordinate;

	// Draw the icon at the specified location
	ctx.drawImage(heartIcon, iconXCoordinate, iconYCoordinate - heartIconSize + 5, heartIconSize, heartIconSize);

	// Draw the number of likes next to the icon
	ctx.fillText(` ${numberOfLikes}`, textXCoordinate, textYCoordinate);
}

/**
 * Draws a broken heart icon and the number of dislikes to the canvas at the specified location.
 *
 * @param {Canvas.CanvasRenderingContext2D} ctx - The canvas context to draw to
 * @param {number} dislikeCount - The number of dislikes to draw
 * @param {number} iconX - The x coordinate of the top-left corner of the icon
 * @param {number} iconY - The y coordinate of the top-left corner of the icon
 */
async function drawDislikes(
	ctx: Canvas.CanvasRenderingContext2D,
	dislikeCount: number,
	iconX: number,
	iconY: number
) {
	// Load the icon from the assets directory
	const iconPath = path.join(assetsPath, "misc", "shattered-heart.svg");
	const icon = await Canvas.loadImage(iconPath);

	// Determine the size of the icon
	const iconSize = 28;

	// Calculate the coordinates for the icon and text
	// The icon is drawn on the right side of the text
	const textX = iconX - iconSize;
	// The text is drawn on the same line as the icon
	const textY = iconY;

	// Draw the icon at the specified location
	// The icon is drawn with a slight offset from the top and left
	ctx.drawImage(icon, iconX, iconY - iconSize + 5, iconSize, iconSize);

	// Draw the dislike count to the left of the icon
	// The text is drawn with a slight offset from the top and left
	ctx.fillText(`${dislikeCount}`, textX, textY);
}

/**
 * Measure the width of a single interest "badge" based on its text and font.
 *
 * @param {CanvasRenderingContext2D} ctx - The canvas context to measure with
 * @param {string} text - The text to measure the width of
 * @param {string} font - The font to measure with (e.g. "20px 'Open Sans'")
 * @param {number} [paddingX=10] - The horizontal padding to add to the width
 * @param {number} [badgeHeight=24] - The height of the badge
 * @returns {number} The measured width of the badge
 */
function measureInterestTagWidth(
	ctx: CanvasRenderingContext2D,
	text: string,
	font: string,
	paddingX = 10,
	badgeHeight = 24,
): number {
	// Set the font
	ctx.font = font;
	// Measure the text
	const metrics = ctx.measureText(text);
	// Width of one tag badge
	const tagWidth = metrics.width + paddingX * 2;
	// return the width
	return tagWidth;
}

/**
 * Draw a single interest "badge" with rounded corners, dark background,
 * and white text.
 *
 * The badge is drawn with rounded corners, and the text is centered
 * horizontally and vertically within the badge.
 *
 * @param {CanvasRenderingContext2D} ctx - The canvas context to draw to
 * @param {string} text - The interest name to draw
 * @param {number} x - The x coordinate of the top-left corner of the badge
 * @param {number} y - The y coordinate of the top-left corner of the badge
 * @param {string} font - The font to use for the text (e.g. "20px 'Open Sans'")
 * @param {string} backgroundColor - The background color of the badge (e.g. "#333")
 * @param {string} textColor - The color of the text (e.g. "#fff")
 * @param {number} [paddingX=10] - The horizontal padding to add to the width
 * @param {number} [badgeHeight=24] - The height of the badge
 * @param {number} [cornerRadius=8] - The corner radius of the badge
 */
function drawInterestTag(
	ctx: CanvasRenderingContext2D,
	text: string,
	x: number,
	y: number,
	font: string,
	backgroundColor = "#333",
	textColor = "#fff",
	paddingX = 10,
	badgeHeight = 24,
	cornerRadius = 8
) {
	// Set the font
	ctx.font = font;
	// Measure the text
	const textMetrics = ctx.measureText(text);
	// Width of one tag badge
	const badgeWidth = textMetrics.width + paddingX * 2;

	// Draw a rounded rect
	ctx.beginPath();
	roundedRectPath(ctx, x, y, badgeWidth, badgeHeight, cornerRadius);
	// Fill with the background color
	ctx.fillStyle = backgroundColor;
	ctx.fill();

	// Draw the text in white
	ctx.fillStyle = textColor;
	// Calculate the x and y coordinates of the text
	const textX = x + paddingX;
	const textY = y + badgeHeight / 2 + textMetrics.actualBoundingBoxAscent / 2 - 2;
	// Draw the text
	ctx.fillText(text, textX, textY);
}

/**
 * Creates a rounded rectangle path on the given canvas context.
 *
 * The path is created by moving to the top-left corner of the rectangle, then
 * drawing a line to the bottom-right corner. The corners are rounded by drawing
 * a Bezier curve to the edge of the rectangle, and then drawing a line to the
 * next corner.
 *
 * @param {CanvasRenderingContext2D} ctx - The canvas context to draw on.
 * @param {number} x - The x-coordinate of the top-left corner of the rectangle.
 * @param {number} y - The y-coordinate of the top-left corner of the rectangle.
 * @param {number} width - The width of the rectangle.
 * @param {number} height - The height of the rectangle.
 * @param {number} radius - The corner radius of the rectangle.
 */
function roundedRectPath(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number
) {
	ctx.beginPath();
	// Move to the top-left corner of the rectangle
	ctx.moveTo(x + radius, y);
	// Draw the top line
	ctx.lineTo(x + width - radius, y);
	// Draw the top-right rounded corner
	ctx.bezierCurveTo(x + width, y, x + width, y + radius, x + width, y + radius);
	// Draw the right line
	ctx.lineTo(x + width, y + height - radius);
	// Draw the bottom-right rounded corner
	ctx.bezierCurveTo(x + width, y + height, x + width - radius, y + height, x + width - radius, y + height);
	// Draw the bottom line
	ctx.lineTo(x + radius, y + height);
	// Draw the bottom-left rounded corner
	ctx.bezierCurveTo(x, y + height, x, y + height - radius, x, y + height - radius);
	// Draw the left line
	ctx.lineTo(x, y + radius);
	// Draw the top-left rounded corner
	ctx.bezierCurveTo(x, y, x + radius, y, x + radius, y);
	// Close the path
	ctx.closePath();
}

/**
 * Draws multiple interest badges, automatically wrapping to the next line
 * if the next badge doesn't fit within `maxRowWidth`.
 *
 * @param {CanvasRenderingContext2D} ctx - The canvas context to draw on.
 * @param {string[]} interests - The list of interest tags to draw.
 * @param {number} startX - The starting x-coordinate of the badges.
 * @param {number} startY - The starting y-coordinate of the badges.
 * @param {number} maxRowWidth - The maximum width of each row of badges.
 * @param {string} [font="20px 'Open Sans'"] - The font to use for the badges.
 * @param {number} [lineGap=10] - The vertical gap between rows of badges.
 * @param {number} [horizontalGap=10] - The horizontal gap between badges.
 * @returns {number} - The new Y-Coordinates,
 *
 * Draws each badge on a new line if the next badge would exceed the
 * maximum row width. The starting x-coordinate will be reset to the
 * `startX` value when a new line is started.
 */
function drawInterestsWrapped(
	ctx: any,
	interests: string[],
	startX: number,
	startY: number,
	maxRowWidth: number,
	font: string = "20px 'Open Sans'",
	lineGap: number = 10,
	horizontalGap: number = 10
) {
	// Keep track of the current x and y coordinates
	let currentX = startX;
	let currentY = startY;
	let lineCount = 1;
	console.log(currentY)

	// The height of each badge is the same, so only calculate it once
	const badgeHeight = 28; // or 24, plus a bit for line spacing
	// The horizontal padding is the same for all badges, so only calculate it once
	const paddingX = 10;

	// Loop through each interest tag and draw it
	for (const interest of interests) {
		// Measure how wide this badge will be
		const tagWidth = measureInterestTagWidth(ctx, interest, font, paddingX, badgeHeight);

		// If adding this badge would exceed max width, move to next line
		if (currentX + tagWidth > maxRowWidth) {
			// Reset to new line
			currentX = startX;
			currentY += badgeHeight + lineGap;
			lineCount++;
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
	console.log(currentY)
	const returnal = currentY + (lineGap * lineCount) + badgeHeight + 20;
	console.log("returnal: ", returnal)
	return returnal;
}

function drawFactsWrapped(
	ctx: any,
	facts: string[],
	startX: number,
	startY: number,
	maxRowWidth: number,
	font: string = "20px 'Open Sans'",
	lineGap: number = 10,
	horizontalGap: number = 10
) {
	// Keep track of the current x and y coordinates
	let currentX = startX;
	let currentY = startY;
	let lineCount = 1;

	const paddingY = 10;
	const paddingX = 10;
	// for (const fact of facts) {
	// 	if(currentX + )
	// }
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
	baseImagePath: string,
	waifu: Waifu.Core,
	index: number, totalImages: number
): Promise<Buffer> {

	// 1) Load base image
	const baseImage = await Canvas.loadImage(baseImagePath);
	// Convert baseImage.width and .height to simple params
	const w = baseImage.width;
	const h = baseImage.height;

	// 2) Decide the extra space to the left of the image
	const leftMargin = 500;

	// Final canvas size
	const totalWidth = w + leftMargin;
	const totalHeight = h;

	// 3) Create the canvas
	const canvas = Canvas.createCanvas(totalWidth, totalHeight);
	const ctx = canvas.getContext("2d");

	// 4) Fill entire background with white
	ctx.fillStyle = "#fff";
	ctx.fillRect(0, 0, totalWidth, totalHeight);

	// 5) Draw the base image
	ctx.drawImage(baseImage, leftMargin, 0);

	// For testing this stuff, we dont need to see the image;
	// ctx.fillStyle = "#fff";
	// ctx.fillRect(leftMargin, 0, baseImage.width, baseImage.height);

	// 6) Draw gradient over the top of the image
	const imageTopGradient = ctx.createLinearGradient(0, 0, 0, h * 0.15);
	imageTopGradient.addColorStop(0, "rgb(0, 0, 0)"); // fully black at top
	imageTopGradient.addColorStop(1, "rgba(0, 0, 0, 0)"); // transparent
	// Draw the gradient
	ctx.fillStyle = imageTopGradient;
	// Which part of the gradient to display
	ctx.fillRect(leftMargin, 0, totalWidth - leftMargin, h * 0.15);

	// 7) Draw gradient over the bottom of the image
	const imageBottomGradient = ctx.createLinearGradient(0, totalHeight - 100, 0, totalHeight);
	imageBottomGradient.addColorStop(0, "rgba(0, 0, 0, 0)"); // Transparent
	imageBottomGradient.addColorStop(1, "rgb(0, 0, 0)"); // Fully black at the bottom
	ctx.fillStyle = imageBottomGradient;
	ctx.fillRect(leftMargin, totalHeight - 100, totalWidth, 300);
	ctx.save();

	// 8) Draw text
	ctx.fillStyle = "#000";
	ctx.textAlign = "left";
	const textMarginLeft = 20;
	// For wrapping text
	const maxTextWidth = leftMargin - 20;
	// Y-coordinate for text, changes dynamically.
	let textY = 40;
	// Space between lines
	let lineGap = 30;

	// Name and age
	lineGap = 40
	textY += wrapText(ctx,
		`${waifu.name}, ${waifu.age}`,
		textMarginLeft,
		textY,
		maxTextWidth,
		lineGap,
		"bold 30px 'Open Sans'"
	);
	ctx.save();

	// Gender and race
	textY += wrapText(ctx,
		`${waifu.gender}, ${waifu.race}`,
		textMarginLeft,
		textY,
		maxTextWidth,
		lineGap,
		"22px 'Open Sans'",
		"rgba(0, 0, 0, 0.65)"
	);
	ctx.save();

	// Location
	lineGap = 30;
	textY += await drawIconAndText(ctx,
		textMarginLeft,
		textY,
		E_WaifuIcons.location,
		waifu.location,
		maxTextWidth,
		"26px 'Open Sans'",
		"#000",
		lineGap
	);
	ctx.save();

	// Job
	lineGap = 40
	textY += await drawIconAndText(ctx,
		textMarginLeft,
		textY,
		E_WaifuIcons.job,
		waifu.job,
		maxTextWidth,
		"26px 'Open Sans'",
		"#000",
		lineGap
	);
	ctx.save();

	// Tagline
	lineGap = 30
	textY += wrapText(ctx,
		waifu.tagline || "Swipe right for a magical connection! ✨📖",
		textMarginLeft,
		textY,
		maxTextWidth,
		lineGap,
		"22px 'Open Sans'",
		"rgba(0, 0, 0, 0.65)"
	);
	ctx.save();

	// If your waifu has interests
	if (waifu.interests && waifu.interests.length > 0) {
		textY = drawInterestsWrapped(ctx,
			waifu.interests,
			textMarginLeft,
			textY,
			maxTextWidth
		);
		ctx.save();
	}

	// Description
	console.log(textY);
	textY += wrapText(
		ctx,
		waifu.description ||
		"No description available. She is a mysterious figure from a distant land…",
		textMarginLeft,
		textY,
		maxTextWidth,
		lineGap,
		"24px 'Open Sans'",
		"rgba(0, 0, 0, 0.75)"
	);
	ctx.save();

	// 8) Fun facts
	if (waifu.funFacts) {
		lineGap = 30
		textY += lineGap
		ctx.font = "bold 28px 'Open Sans'"
		ctx.fillText("FUN FACTS", textMarginLeft, textY)
		// Render each fun fact with text wrapping
		textY += lineGap + lineGap;
		lineGap = 20
		waifu.funFacts.forEach((fact, index) => {
			textY += wrapText(ctx, `• ${fact}`, textMarginLeft, textY, maxTextWidth, lineGap, "20px 'Open Sans'", "#333", "left") + 10;
		});
	}

	// 9) Text over the image
	// Artist credit in top-right corner
	ctx.textAlign = "right";
	ctx.font = "14px 'Open Sans'";
	ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
	ctx.fillText(
		`Art: ${"Placeholder AI image"}`,
		totalWidth - 10,
		20
	);

	// Create page numbering, for amount of images and which image (in index) we are on.
	ctx.textAlign = "center";
	ctx.font = "20px 'Open Sans'";
	ctx.fillStyle = "#FFFFFF";
	ctx.fillText(
		`${index + 1}/${totalImages}`,
		(w / 2) + leftMargin,
		totalHeight - 60
	);

	// likes and dislikes
	ctx.textAlign = "left";
	await drawLikes(ctx, waifu.likes, leftMargin + 20, totalHeight - 20);
	ctx.textAlign = "right";
	await drawDislikes(ctx, waifu.dislikes, totalWidth - 50, totalHeight - 20);

	// 10) Export final PNG
	return canvas.toBuffer("image/png");
}