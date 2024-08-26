import { User } from "../entity/index";
import { AppDataSource } from "../datasource";
import { checkUUID, logError } from "../../utilities/utilities";
import { LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { E_CurrencyTypes } from "../../utilities/interface";


export interface I_findOrCreateUser {
	data: {
		uuid: string,
		displayName: string,
		discordID: string,
		joinedAt: Date,
		common: number,
		premium: number,
		level: number,
		prestige: number,
		xp: number,
		xpToLevel: number,
		levelName: string,
		prestigeName: string;
	} | string,
	error?: boolean;
};

/**
 * This function performs database operations for a given user.
 * It initializes the database, finds or creates a user record,
 * and returns the user record.
 *
 * @param {string} identifier Either a UUID or Discord ID. We have a helper function that will check whether this is a UUID or not.
 */
export async function findOrCreateUser(identifier: string): Promise<I_findOrCreateUser> {
	try {
		// Get the user first.
		// await AppDataSource.initialize();
		let userInfo = await AppDataSource.manager.findOne(User.Core, {
			where: [{ discord_id: identifier }],
			relations: ["userLevel", "userCurrency"],
		});

		// let userInfo = await AppDataSource.getRepository(User.Core)
		// 	.createQueryBuilder("user")
		// 	.where("user.uuid = :identifier", { identifier })
		// 	.orWhere("user.discord_id = :identifier", { identifier })
		// 	.leftJoinAndSelect("user.userLevel", "userLevel")
		// 	.leftJoinAndSelect("user.userCurrency", "userCurrency")
		// 	.getOne();
		// If no user was found AND if the identifier is not a UUID, create a new user.
		if (!userInfo && !checkUUID(identifier)) {
			console.log("User not found. Creating new user.");
			userInfo = new User.Core();
			userInfo.discord_id = identifier;
			await AppDataSource.manager.save(User.Core, userInfo);

			// After saving, the trigger creates Currency and Level entries.
			// We need to therefore reload the User.Core from the database.
			userInfo = await AppDataSource.manager.findOne(User.Core, {
				where: [{ discord_id: identifier }],
				relations: ["userLevel", "userCurrency"],
			});
		}
		console.log("Identifier was not UUID and user not found.");
		if (!userInfo) {
			return {
				data: "User not found.",
				error: true,
			};
		}

		console.log("user was found");

		const { userLevel, userCurrency } = userInfo;

		const levelName = await AppDataSource.manager.findOne(User.LevelName, {
			where: {
				min_level: LessThanOrEqual(userLevel.level),
				max_level: MoreThanOrEqual(userLevel.level)
			},
		});
		const prestigeName = await AppDataSource.manager.findOne(User.PrestigeName, {
			where: {
				min_level: LessThanOrEqual(userLevel.prestige),
				max_level: MoreThanOrEqual(userLevel.prestige)
			},
		});

		// await AppDataSource.destroy();

		return {
			data: {
				uuid: userInfo.uuid,
				displayName: userInfo.display_name,
				discordID: userInfo.discord_id,
				joinedAt: userInfo.joined_at,
				common: userCurrency.common,
				premium: userCurrency.premium,
				level: userLevel.level,
				prestige: userLevel.prestige,
				xp: userLevel.xp,
				xpToLevel: userLevel.xp_to_level,
				levelName: levelName ? levelName.title : "Unknown",
				prestigeName: prestigeName ? prestigeName.title : "Unknown",
			},
		};
	} catch (e: any) {
		logError(e);
		return {
			data: "Something terrible happened whilst trying to access database. Contact the developer.",
			error: true,
		};
	}
};

export async function findOrCreateUserCurrency(user: string) {
	try {
		// Find it by discord id.
		let userCurrency = await AppDataSource.manager.findOne(User.Currency, {
			where: {
				userCore: {
					discord_id: user
				}
			}, relations: ["userCore"]
		});

		// This literally should never happen as we create this row every time a new user is created.
		if (!userCurrency) {
			const newUser = new User.Currency();
			newUser.userCore = new User.Core();
			newUser.userCore.discord_id = user;
			userCurrency = await AppDataSource.manager.save(User.Currency, newUser);
		}
		return {
			data: {
				uuid: userCurrency.uuid,
				common: userCurrency.common,
				premium: userCurrency.premium
			}
		};
	} catch (e: any) {
		logError(e);
		return {
			data: "Something terrible happened whilst trying to access database. Contact the developer.",
			error: true,
		};
	}
};

export async function findOrCreateUserLevel(user: string) {
	try {
		// Find it by discord id.
		let userLevel = await AppDataSource.manager.findOne(User.Level, {
			where: {
				userCore: {
					discord_id: user,
				},
			}, relations: ["userCore"],
		});

		// This literally should never happen as we create this row every time a new user is created.
		if (!userLevel) {
			const newUser = new User.Level();
			newUser.userCore = new User.Core();
			newUser.userCore.discord_id = user;
			userLevel = await AppDataSource.manager.save(User.Level, newUser);
		}

		const levelName = await AppDataSource.manager.findOne(User.LevelName, {
			where: {
				min_level: LessThanOrEqual(userLevel.level),
				max_level: MoreThanOrEqual(userLevel.level)
			},
		});
		const prestigeName = await AppDataSource.manager.findOne(User.PrestigeName, {
			where: {
				min_level: LessThanOrEqual(userLevel.prestige),
				max_level: MoreThanOrEqual(userLevel.prestige)
			},
		});

		return {
			data: {
				uuid: userLevel.uuid,
				level: userLevel.level,
				prestige: userLevel.prestige,
				xp: userLevel.xp,
				xpNeeded: userLevel.xp_to_level,
				levelName: levelName ? levelName.title : "Unknown",
				prestigeName: prestigeName ? prestigeName.title : "Unknown"
			}
		};
	} catch (e: any) {
		logError(e);
		return {
			data: "Something terrible happened whilst trying to access database. Contact the developer.",
			error: true,
		};
	}
};

export async function userCurrencyIncrease(user: string, type: E_CurrencyTypes, amount: number) {
	try {
		const commonCurrencyMaximum = 2000000000;
		const premiumCurrencyMaximum = 1000000000;
		const userCurrency = await findOrCreateUserCurrency(user);
		// These two, I can't get rid of, otherwise TS complains.
		if (userCurrency.error) {
			return userCurrency;
		}
		if (typeof (userCurrency.data) == "string") {
			return userCurrency;
		}

		let newCurrency: number = 0;

		// Check what we are increasing.
		if (type == E_CurrencyTypes.common) {
			newCurrency = userCurrency.data.common + amount;
			if (newCurrency > commonCurrencyMaximum) {
				newCurrency = commonCurrencyMaximum;
			}
			userCurrency.data.common = newCurrency;
		} else if (type == E_CurrencyTypes.premium) {
			newCurrency = userCurrency.data.premium + amount;
			if (newCurrency > premiumCurrencyMaximum) {
				newCurrency = premiumCurrencyMaximum;
			}
			userCurrency.data.premium = newCurrency;
		}

		const newUserCurrency = await AppDataSource.manager.save(User.Currency, userCurrency.data);

		return {
			data: {
				uuid: newUserCurrency.uuid,
				common: newUserCurrency.common,
				premium: newUserCurrency.premium
			}
		};
	} catch (e: any) {
		logError(e);
		return {
			data: "Something terrible happened whilst trying to access database. Contact the developer.",
			error: true,
		};
	}
};

export async function userCurrencyDecrease(user: string, type: E_CurrencyTypes, amount: number) {
	try {
		const userCurrency = await findOrCreateUserCurrency(user);
		// These two, I can't get rid of, otherwise TS complains.
		if (userCurrency.error) {
			return userCurrency;
		}
		if (typeof (userCurrency.data) == "string") {
			return userCurrency;
		}

		let newCurrency: number = 0;

		// Check what we are increasing.
		if (type == E_CurrencyTypes.common) {
			newCurrency = userCurrency.data.common + amount;
			if (newCurrency > 0) {
				newCurrency = 0;
			}
			userCurrency.data.common = newCurrency;
		} else if (type == E_CurrencyTypes.premium) {
			newCurrency = userCurrency.data.premium + amount;
			if (newCurrency > 0) {
				newCurrency = 0;
			}
			userCurrency.data.premium = newCurrency;
		}

		const newUserCurrency = await AppDataSource.manager.save(User.Currency, userCurrency.data);

		return {
			data: {
				uuid: newUserCurrency.uuid,
				common: newUserCurrency.common,
				premium: newUserCurrency.premium
			}
		};
	} catch (e: any) {
		logError(e);
		return {
			data: "Something terrible happened whilst trying to access database. Contact the developer.",
			error: true,
		};
	}
};

function exponentXpCalc(baseXP: number, level: number, exponent: number) {
	const xpNeeded = Math.floor(baseXP * Math.pow(level, exponent));
	return xpNeeded;
};

export async function userLevelXpAdd(user: string, amount: number) {
	try {
		const maxLevel: number = 200, maxPrestige: number = 200, baseXP: number = 100, exponent: number = 1.05, baseLevel: number = 1;
		const userLevel = await findOrCreateUserLevel(user);
		if (!userLevel) {
			return userLevel;
		}
		if (typeof (userLevel.data) == "string") {
			return userLevel;
		}

		let userTemp = userLevel.data;
		let xpToAdd: number = amount,
			tempXP: number = userTemp.xp,
			xpAdded: number = 0,
			xpOverflow: number = 0,
			nextXpTotal: number = userTemp.xpNeeded;

		// we have to add XP.
		// If we reach XP to next level, we give the user a level. 
		// if there is still XP left to give, we give until none is left.
		do {
			// first add the xp.
			console.log(`${tempXP} tempXP before xpToAdd`);
			tempXP = xpToAdd;
			console.log(`${tempXP} tempXP after xpToAdd`);
			if (tempXP >= nextXpTotal) {
				console.log(`tempXP higher or equal to NexXpTotal ${nextXpTotal}`);
				xpOverflow = tempXP - nextXpTotal;
				console.log(`${xpOverflow} xpOverflow = nextXpTotal - tempXP`);
				userTemp.level++;
				console.log("Level added");
				xpAdded = tempXP - xpOverflow;
				console.log(`${xpAdded} xpAdded = tempXP - xpOverflow`);
				nextXpTotal = exponentXpCalc(baseXP, userTemp.level, exponent);
				console.log(`${nextXpTotal} nextXpTotal = exponentXpCalc(baseXP, userTemp.level, exponent)`);
			}
			if(userTemp.level > maxLevel) {
				userTemp.level = 1;
				userTemp.prestige++;
				nextXpTotal = baseXP;
			}
			console.log(`xpToAdd before -= xpAdded ${xpToAdd}`);
			xpToAdd -= xpAdded;
			console.log(`xpToAdd after -= xpAdded ${xpToAdd}`);
		} while (xpToAdd > 0);

		userTemp.xp = tempXP;
		userTemp.xpNeeded = nextXpTotal;

		console.log(`USERTEMP ${JSON.stringify(userTemp)}`);
		return {
			data: {
				xp: amount,
			}
		};
	} catch (e: any) {
		logError(e);
		return {
			data: "Something terrible happened whilst trying to access database. Contact the developer.",
			error: true,
		};
	}
};
