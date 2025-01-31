import { logError } from "../../utilities/utilities";
import { AppDataSource } from "../datasource";
import { User } from "../entity";
import { findOrCreateUserPancake } from "./user";
export async function addPancakes(user: string, increment: number) {
	try {
		const userPancakes = await findOrCreateUserPancake(user)
		if (userPancakes.error) {
			return {
				data: "We were unable to create your databse entry in the pancakes table.",
				error: userPancakes.error
			}
		}
		if (typeof (userPancakes.data) == "string") {
			return {
				data: "We were unable to create your databse entry in the pancakes table.",
				error: userPancakes.error
			}
		}

		userPancakes.data.pancakesBaked += increment;
		userPancakes.data.lifetimePancakes += increment;
		const newPancakes = await AppDataSource.manager.save(User.Pancakes, userPancakes.data);

		return {
			data: {
				userID: newPancakes.userID,
				pancakesBaked: newPancakes.pancakesBaked,
				lifetimePancakes: newPancakes.lifetimePancakes,
				flour: newPancakes.flour,
				milk: newPancakes.milk,
				eggs: newPancakes.eggs,
				whippedCream: newPancakes.whippedCream
			}
		}
	} catch (e: any) {
		logError(e);
		return {
			data: "Something terrible happened whilst trying to access database. Contact the developer.",
			error: true,
		};
	}
}

export async function getPancakes(user: string) {
	try {
		const userPancakes = await findOrCreateUserPancake(user)
		if (userPancakes.error) {
			return {
				data: "We were unable to create your databse entry in the pancakes table.",
				error: userPancakes.error
			}
		}
		if (typeof (userPancakes.data) == "string") {
			return {
				data: "We were unable to create your databse entry in the pancakes table.",
				error: userPancakes.error
			}
		}

		return {
			data: {
				userID: userPancakes.data.userID,
				pancakesBaked: userPancakes.data.pancakesBaked,
				lifetimePancakes: userPancakes.data.lifetimePancakes,
				flour: userPancakes.data.flour,
				milk: userPancakes.data.milk,
				eggs: userPancakes.data.eggs,
				whippedCream: userPancakes.data.whippedCream
			}
		}
	} catch (e: any) {
		logError(e);
		return {
			data: "Something terrible happened whilst trying to access database. Contact the developer.",
			error: true,
		}
	}
}

export async function deductIngredients(user: string) {
	try {
		const userPancakes = await findOrCreateUserPancake(user)
		if (userPancakes.error) {
			return {
				data: "We were unable to create your databse entry in the pancakes table.",
				error: userPancakes.error
			}
		}
		if (typeof (userPancakes.data) == "string") {
			return {
				data: "We were unable to create your databse entry in the pancakes table.",
				error: userPancakes.error
			}
		}

		// Check if user has enough ingredients: 1 flour, 1 milk, 2 eggs, 1 whipped cream
		if (userPancakes.data.flour < 1 || userPancakes.data.milk < 1 || userPancakes.data.eggs < 2 || userPancakes.data.whippedCream < 1) {
			return {
				data: "You don't have enough ingredients to bake a pancake!",
				error: true
			}
		}

		// Deduct the ingredients
		userPancakes.data.flour -= 1;
		userPancakes.data.milk -= 1;
		userPancakes.data.eggs -= 2;
		userPancakes.data.whippedCream -= 1;
		await AppDataSource.manager.save(User.Pancakes, userPancakes.data);

		return {
			data: userPancakes.data
		}
	} catch (e: any) {
		logError(e);
		return {
			data: "Something terrible happened whilst trying to access database. Contact the developer.",
			error: true,
		}
	}
}

export async function addIngredients(user: string, ingredient: string, amount: number) {
	try {
		const userPancakes = await findOrCreateUserPancake(user)
		if (userPancakes.error) {
			return {
				data: "We were unable to create your databse entry in the pancakes table.",
				error: userPancakes.error
			}
		}
		if (typeof (userPancakes.data) == "string") {
			return {
				data: "We were unable to create your databse entry in the pancakes table.",
				error: userPancakes.error
			}
		}

		switch (ingredient) {
			case "flour":
				userPancakes.data.flour += amount;
				break;
			case "milk":
				userPancakes.data.milk += amount;
				break;
			case "eggs":
				userPancakes.data.eggs += amount;
				break;
			case "whippedCream":
				userPancakes.data.whippedCream += amount;
				break;
			default:
				return {
					data: "Invalid ingredient. Please use flour, milk, eggs, or whippedCream.",
					error: true
				}
		}

		await AppDataSource.manager.save(User.Pancakes, userPancakes.data);

		return {
			data: userPancakes.data
		}
	} catch (e: any) {
		logError(e);
		return {
			data: "Something terrible happened whilst trying to access database. Contact the developer.",
			error: true,
		}
	}
}