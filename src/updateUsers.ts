import { AppDataSource } from "./database/datasource";
import * as fs from "fs";
import readline from "readline";
import { User } from "./database/entity";

export async function updateUsersFromFile(filePath: string) {
	console.log("we are updating users.");
	// Read the file content asynchronously
	console.log(filePath);
	await fs.readFile(filePath, 'utf8', async (err, data) => {
		console.log("WE ARE READING THE FILE");
		if (err) {
			console.error('Error reading the file:', err);
			return;
		}

		// Split the content by line breaks to process each line
		const lines = data.split('\n');

		// Repositories for accessing and updating the entities
		const userLevelRepo = await AppDataSource.getRepository(User.Level);
		const userCurrencyRepo = await AppDataSource.getRepository(User.Currency);

		// Process each line
		for (const line of lines) {
			if (!line.trim()) continue; // Skip empty lines

			const [uuid, common, premium, level] = line.split(',');

			// Convert values to appropriate types
			const commonValue = parseInt(common, 10);
			const premiumValue = parseInt(premium, 10);
			const levelValue = parseInt(level, 10);

			try {
				// Update user_level
				await userLevelRepo.update({ uuid }, { level: levelValue });

				// Update user_currency
				await userCurrencyRepo.update({ uuid }, { common: commonValue, premium: premiumValue });

				console.log(`Updated UUID: ${uuid}`);
			} catch (updateErr) {
				console.error(`Error updating UUID: ${uuid}`, updateErr);
			}
		}
	});
}
