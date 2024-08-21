import { logError } from "../../utilities/utilities";
import { AppDataSource } from "../datasource";
import { RPG } from "../entity";

export interface I_RPGCharacterResponse {
	data: string | null | RPG.CharacterCore;
	error?: boolean;
}

export interface I_RPGCharactersResponse {
	data: RPG.CharacterCore[] | any;
	error?: boolean;
}

export async function findCharacter(identifier: string, characterID: number) {
	try {
		await AppDataSource.initialize();

		const character = await AppDataSource.manager.findOne(RPG.CharacterCore, {
			where: {
				userCore: {
					discord_id: identifier,
				},
				character_id: characterID
			},
			relations: ["race", "class"],
		});

		console.log(character);

		await AppDataSource.destroy();

		// Let the program handle whether we got null or not.
		return {
			data: character
		};
	} catch (e: any) {
		logError(e);
		return {
			data: "Something terrible happened whilst trying to access database. Contact the developer.",
			error: true,
		};
	}
}

export async function findAllCharacters(identifier: string) {
	try {
		await AppDataSource.initialize();

		const characters = await AppDataSource.manager.find(RPG.CharacterCore, {
			where: {
				userCore: {
					discord_id: identifier,
				}
			},
			relations: ["race", "class"],
		});

		console.log("findAllCharacters:", characters);

		await AppDataSource.destroy();

		return {
			data: characters
		};
	} catch (e: any) {
		logError(e);
		return {
			data: "Something terrible happened whilst trying to access database. Contact the developer.",
			error: true,
		};
	}
}