import { User } from "../entity/index";
import { AppDataSource } from "../datasource";


export interface getUserCoreThings {
	msg: string,
	data?: {
		core: User.Core,
		level: User.Level,
		currency: User.Currency;
	},
	error?: boolean;
}

/**
 * This function performs database operations for a given user.
 * It initializes the database, finds or creates a user record,
 * and returns the user record.
 *
 * @param {string} userToGet - The Discord ID of the user.
 * containing the user record and an optional error flag.
 */
export async function getUserCoreThings(userToGet: string): Promise<getUserCoreThings> {
	try {
		// Initialize the database connection.
		await AppDataSource.initialize();

		// Find the user record in the database.
		let userCoreRepo = await AppDataSource.manager.findOne(User.Core, {
			where: {
				discord_id: userToGet,
			},
		});

		let userLevelRepo, userMoneyRepo;

		// If the user record doesn't exist, create a new one.
		if (!userCoreRepo) {
			const userCore = new User.Core();
			userCore.discord_id = userToGet;
			userCoreRepo = await AppDataSource.manager.save(userCore);

			const userLevel = new User.Level();
			userLevel.uuid = userCoreRepo.uuid;
			await AppDataSource.manager.save(userLevel);

			const userMoney = new User.Currency();
			userMoney.uuid = userCoreRepo.uuid;
			await AppDataSource.manager.save(userMoney);
		}

		// Find the level and currency records for the user.
		userLevelRepo = await AppDataSource.manager.findOne(User.Level, {
			where: {
				uuid: userCoreRepo.uuid,
			},
		});
		userMoneyRepo = await AppDataSource.manager.findOne(User.Currency, {
			where: {
				uuid: userCoreRepo.uuid,
			},
		});
		// These should never happen, as they literally can't exist wihtout a user, but TS is screaming at me, so.
		if (!userLevelRepo) {
			throw new Error("Level not found.");
		}
		if (!userMoneyRepo) {
			throw new Error("Currency not found.");
		}

		// Close the database connection.
		await AppDataSource.destroy();

		return {
			msg: "",	// Temporory until i find better way. Because only catch will send this param.
			data: {
				core: userCoreRepo,
				level: userLevelRepo,
				currency: userMoneyRepo,
			}
		};
	} catch (e: any) {
		console.error(e);
		return {
			msg: "It seems something didn't work out.",
			error: true,
		};
	}
}
