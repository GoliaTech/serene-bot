import { AppDataSource } from "../datasource";
import { RPG } from "../entity";

export async function findCharacter(identifier: string, characterID?: number) {
	try {
		await AppDataSource.initialize();

		let character!: any[] | any;

		// Find all their characters.
		if (!characterID) {
			character = await AppDataSource.manager.find(RPG.CharacterCore, {
				where: {
					userCore: {
						discord_id: identifier,
					}
				},
				relations: ["userCore", "race", "class"],
			});
		} else {
			character = await AppDataSource.manager.find(RPG.CharacterCore, {
				where: {
					userCore: {
						discord_id: identifier,
					},
					character_id: characterID
				},
				relations: ["userCore", "race", "class"],
			})
		}

		console.log(character);

		await AppDataSource.destroy();

		return character;
	} catch (e: any) {
		console.error(e);
		return "Ooops";
	}
}

export async function findAllCharacters() {
	try {
		await AppDataSource.initialize();

		const characters = await AppDataSource.manager.find(RPG.CharacterCore);

		console.log(characters);

		await AppDataSource.destroy();

		return characters;
	} catch (e: any) {
		console.error(e);
		return "Ooops";
	}
}