import { User } from "../entity/index";
import { AppDataSource } from "../datasource";
import { checkUUID, logError } from "../../utilities/utilities";
import { LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { E_CurrencyTypes, I_addedItem, I_findOrCreateUser, Reward } from "../../utilities/interface";

/**
 * This function performs database operations for a given user.
 * It initializes the database, finds or creates a user record,
 * and returns the user record.
 *
 * @param {string} identifier Discord ID. We have a helper function that will check whether this is a UUID or not.
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

/**
 * This actually just finds the user currency. It doesn't create it, because a currency table is created when a new user is created.
 * An SQL trigger ensures that.
 * @param {string} user Discord ID
 * @returns Either error or data.
 */
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

/**
 * This will find or create the user level.
 * @param {string} user Discord ID
 * @returns Either error or data.
 */
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

/**
 * This will increase a user's currency.
 * @param {string} user Discord ID
 * @param {E_CurrencyTypes} type a currency type.
 * @param {number} amount The amount
 * @returns Either error or data.
 */
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

/**
 * This will decrease a user's currency.
 * @param {string} user Discord ID
 * @param {E_CurrencyTypes} type a currency type.
 * @param {number} amount The amount
 * @returns Either error or data.
 */
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

/**
 * This will calculate the new XP needed.
 * @param {number} baseXP Provide the current xpNeeded
 * @param {number} level Provide the current level
 * @param {number} exponent Provide the exponent wanted
 * @returns {number} the new XP needed.
 */
function exponentXpCalc(baseXP: number, level: number, exponent: number) {
	const xpNeeded = Math.floor(baseXP * Math.pow(level, exponent));
	return xpNeeded;
};

/**
 * This will calculate the XP for the user, as well as level them up and prestige them if conditions apply.
 * @param {string} user Discord ID
 * @param {number} amount the amount of XP to add
 * @returns Either error or data.
 */
export async function userLevelXpAdd(user: string, amount: number) {
	try {
		const maxLevel: number = 200,
			maxPrestige: number = 200,
			baseXP: number = 100,
			exponent: number = 1.05,
			baseLevel: number = 1;
		const userLevel = await findOrCreateUserLevel(user);
		if (!userLevel) {
			return userLevel;
		}
		if (typeof (userLevel.data) == "string") {
			return userLevel;
		}

		// Set up temporary data.
		let userTemp = userLevel.data;
		let xpToAdd: number = amount,
			tempXP: number = userTemp.xp,
			xpAdded: number = 0,
			nextXpTotal: number = userTemp.xpNeeded;

		// What we need to do:
		// 1. Add XP.
		// 2. If we have more XP than xp needed to level up, level up.
		// 3. Calculate how much XP we actually added.
		// 4. If our level up has let us go to max level, prestige.
		// 5. If we have reached max prestige and max level, we should not get more XP.

		// V2.
		while (xpToAdd > 0) {
			// First, add the XP.
			tempXP += xpToAdd;

			// Check if we have overflow.
			if (tempXP >= nextXpTotal) {
				// Calculate overflow.
				xpToAdd = tempXP - nextXpTotal;
				// Then reset the XP.
				tempXP = 0;
				// Add level.
				userTemp.level++;

				// Now we check if we have reached max level.
				if (userTemp.level > maxLevel) {
					// Check if we have have not reached max prestige yet.
					if (userTemp.prestige < maxPrestige) {
						// Reset the level things, to get new prestige.
						userTemp.level = baseLevel;
						userTemp.prestige++;
						nextXpTotal = baseXP;
					} else {
						// Cap out at max level.
						userTemp.level = maxLevel;
						xpAdded = 0;
					}
				} else {
					// Otherwise if we haven't, calculate XP needed for nex level.
					nextXpTotal = exponentXpCalc(baseXP, userTemp.level, exponent);
				}
			} else {
				// No level up, just add the remaining XP and stop.
				xpToAdd = 0;
			}
		}

		userTemp.xp = tempXP;
		userTemp.xpNeeded = nextXpTotal;

		// V1.
		// do {
		// 	// first add the xp.
		// 	tempXP = xpToAdd;
		// 	// Check if we have overflowed.
		// 	if (tempXP >= nextXpTotal) {
		// 		// Calculate overflow.
		// 		xpOverflow = tempXP - nextXpTotal;
		// 		// Add the level.
		// 		userTemp.level++;
		// 		// Calculate how much XP we actually added.
		// 		xpAdded = tempXP - xpOverflow;
		// 		// Calculate new XP needed to level up more.
		// 		nextXpTotal = exponentXpCalc(baseXP, userTemp.level, exponent);
		// 	}

		// 	// IF we have reached max level, get prestige and reset progress.
		// 	if (userTemp.level > maxLevel) {
		// 		userTemp.level = 1;
		// 		userTemp.prestige++;
		// 		nextXpTotal = baseXP;
		// 	}
		// 	xpToAdd -= xpAdded;
		// } while (xpToAdd > 0);

		await AppDataSource.manager.save(User.Level, userTemp);
		return {
			data: userTemp,
		};
	} catch (e: any) {
		logError(e);
		return {
			data: "Something terrible happened whilst trying to access database. Contact the developer.",
			error: true,
		};
	}
};

export async function findOrCreateItem(item: number | string) {
	try {
		let itemInfo: User.Item | null;
		if (typeof (item) == "string") {
			itemInfo = await AppDataSource.manager.findOne(User.Item, {
				where: {
					name: item,
				}, relations: ["userInventories"]
			});
			if (!itemInfo) {
				return {
					data: "Couldn't find item in database, by the ID provided. Contact the developer.",
					error: true,
				};
			}
		} else if (typeof (item) == "number") {
			itemInfo = await AppDataSource.manager.findOne(User.Item, {
				where: {
					id: item,
				},
			});
			if (!itemInfo) {
				return {
					data: "Couldn't find item in database, by the name provided. Contact the developer.",
					error: true,
				};
			}
		} else {
			return {
				data: "Something terrible happened whilst trying to get the item in the database. Contact the developer.",
				error: true,
			};
		}

		if (!itemInfo) {
			return {
				data: "Something terrible happened whilst trying to access database. Contact the developer.",
				error: true,
			};
		}

		return {
			data: itemInfo,
		};
	} catch (e: any) {
		logError(e);
		return {
			data: "Something terrible happened whilst trying to access database. Contact the developer.",
			error: true,
		};
	}
}

/**
 * This will distribute the items. 
 * @param {string} user The Discrod ID
 * @param {Reward[]} items The list of itmes to add.
 * @returns Either error or data.
 */
export async function userItemsDistribute(user: string, items: Reward[]) {
	try {
		// Try getting/creating user.
		const userInfo = await findOrCreateUser(user);
		if (userInfo.error) {
			return userInfo;
		}
		if (typeof (userInfo.data) == "string") {
			return userInfo;
		}

		// Now we need to go through the items.
		// See what items we are getting.
		// Check if a user has that item.
		// If yes, add amount.
		// If not, create entry.
		// Return new data.

		const itemsAdded: I_addedItem[] = [];

		items.map(async (item) => {
			// This is not needed, but TS screams otherwise.
			if (typeof (item.reward) != "object") {
				return;
			}
			if (typeof (item.reward.type) != "string") { return; }

			// Try finding the item first.
			const itemDB = await findOrCreateItem(item.rewardType);
			// What if we don't find any item???
			if (!itemDB) {
				return itemDB;
			}

			// Try to see if we have the item in our inventory.
			let userItem = await AppDataSource.manager.findOne(User.Inventory, {
				where: {
					item: {
						name: item.reward.type
					}
				}, relations: ["item", "userCore"]
			});

			// If we don't create it.
			if (!userItem) {
				const newItem = new User.Inventory();
				// Not needed but screams otherwise.
				if (typeof (userInfo.data) == "string") {
					return userInfo;
				}
				if (typeof (itemDB.data) == "string") {
					return itemDB;
				}
				newItem.uuid = userInfo.data.uuid;
				newItem.item_id = itemDB.data.id;

				await AppDataSource.manager.save(User.Inventory, newItem);
				userItem = await AppDataSource.manager.findOne(User.Inventory, {
					where: {
						item: {
							name: item.reward.type
						}
					}, relations: ["item", "userCore"]
				});
			}

			// Not needed but screams otherwise.
			if (!userItem) {
				return userItem;
			}
			// Add the amount.
			userItem.amount += item.reward.amount;
			await AppDataSource.manager.save(User.Inventory, userItem);
			userItem = await AppDataSource.manager.findOne(User.Inventory, {
				where: {
					item: {
						name: item.reward.type
					}
				}, relations: ["item", "userCore"]
			});

			// Again, not needed but screams at me.
			if (!userItem) { return userItem; }

			// Lets give it an object.
			const addedItem = {
				id: userItem.item_id,
				uuid: userItem.uuid,
				name: userItem.item.name,
				description: userItem.item.description,
				lore: userItem.item.lore,
				amount: userItem.amount,
				maxStack: userItem.item.max_stack
			};

			itemsAdded.push(addedItem);
			return addedItem;
		});

		return {
			data: itemsAdded,
		};
	} catch (e: any) {
		logError(e);
		return {
			data: "Something terrible happened whilst trying to access database. Contact the developer.",
			error: true,
		};
	}
}