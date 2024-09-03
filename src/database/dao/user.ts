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
export async function findOrCreateUser(identifier: string, displayName?: string): Promise<I_findOrCreateUser> {
	try {
		// Get the user first.
		// await AppDataSource.initialize();
		let userInfo = await AppDataSource.manager.findOne(User.Core, {
			where: {
				discord_id: identifier
			},
			relations: ["userLevel", "userCurrency"],
		});

		if (!userInfo) {
			console.log("User not found. Creating new user.");
			userInfo = new User.Core();
			userInfo.discord_id = identifier;
			userInfo.display_name = displayName ? displayName : null;
			await AppDataSource.manager.save(User.Core, userInfo);
			// we have to save then find, because relations...
			userInfo = await AppDataSource.manager.findOne(User.Core, {
				where: {
					discord_id: identifier
				},
				relations: ["userLevel", "userCurrency"],
			});
		}
		// This should literally never happen as we have already created a user. I need to find a better way to do this.


		console.log("user was found");

		if (!userInfo) {
			console.log("This should have never happend, how did you get here?");
			return {
				data: "Something went wrong. Please contact the developer.",
				error: true
			};
		}

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
				xp_to_level: userLevel.xp_to_level,
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
			return {
				data: userCurrency.data,
				error: userCurrency.error
			};
		}
		if (typeof (userCurrency.data) == "string") {
			return {
				data: userCurrency.data,
				error: userCurrency.error
			};
		}

		// New currency start at 0.
		let newCurrency: number = 0;

		// Check what we are increasing.
		switch (type) {
			case E_CurrencyTypes.common:
				newCurrency = userCurrency.data.common + amount;
				if (newCurrency > commonCurrencyMaximum) {
					newCurrency = commonCurrencyMaximum;
				}
				userCurrency.data.common = newCurrency;
				break;
			case E_CurrencyTypes.premium:
				newCurrency = userCurrency.data.premium + amount;
				if (newCurrency > premiumCurrencyMaximum) {
					newCurrency = premiumCurrencyMaximum;
				}
				userCurrency.data.premium = newCurrency;
				break;
			default:
				return {
					data: "Something terrible happened whilst trying to access database. Contact the developer.",
					error: true,
				};
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
			return {
				data: userCurrency.data,
				error: userCurrency.error
			};
		}
		if (typeof (userCurrency.data) == "string") {
			return {
				data: userCurrency.data,
				error: userCurrency.error
			};
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
function exponentXpCalc(baseXP: number, level: number, exponent: number): number {
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
		if (userLevel.error) {
			return {
				data: userLevel.data,
				error: userLevel.error,
			};
		}
		if (typeof (userLevel.data) == "string") {
			return {
				data: userLevel.data,
				error: userLevel.error,
			};
		}

		// Set up temporary data.
		let userTemp = userLevel.data;
		let xpToAdd: number = amount,
			tempXP: number = userTemp.xp,
			nextXpTotal: number = userTemp.xp_to_level;

		// Loop to add XP and handle level-ups
		while (xpToAdd > 0) {
			// First, add the XP.
			tempXP += xpToAdd;

			// Check if we have overflow.
			if (tempXP >= nextXpTotal) {
				// Calculate overflow.
				xpToAdd = tempXP - nextXpTotal;
				// Then reset the XP for the current level.
				tempXP = 0;
				// Add a level.
				userTemp.level++;

				// Now we check if we have reached max level.
				if (userTemp.level > maxLevel) {
					// Check if we have not reached max prestige yet.
					if (userTemp.prestige < maxPrestige) {
						// Reset the level and increase prestige.
						userTemp.level = baseLevel;
						userTemp.prestige++;
						nextXpTotal = baseXP; // Reset XP needed for the next level
					} else {
						// Cap out at max level and max prestige.
						userTemp.level = maxLevel;
						xpToAdd = 0; // No more XP to add since max level and prestige reached
					}
				} else {
					// Calculate XP needed for the next level based on the new level.
					nextXpTotal = exponentXpCalc(baseXP, userTemp.level, exponent);
				}
			} else {
				// No level up, just add the remaining XP and stop.
				xpToAdd = 0;
			}
		}

		// Update the user's XP and XP needed for the next level.
		userTemp.xp = tempXP;
		userTemp.xp_to_level = nextXpTotal;

		// IDK man.
		userLevel.data.level = userTemp.level;
		userLevel.data.prestige = userTemp.prestige;
		userLevel.data.xp = userTemp.xp;
		userLevel.data.xp_to_level = userTemp.xp_to_level;


		// Save the updated user level data.
		await AppDataSource.manager.save(User.Level, userLevel.data);

		return {
			data: userTemp,
		};
	} catch (e: any) {
		logError(e);
		return {
			data: "Something terrible happened whilst trying to access the database. Contact the developer.",
			error: true,
		};
	}
};

export async function findOrCreateItem(item: number | string) {
	try {
		console.log(`The item trying to find: ${item}`);
		let itemInfo;
		if (typeof (item) == "string") {
			itemInfo = await AppDataSource.manager.findOne(User.Item, {
				where: {
					name: item,
				}
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

export async function findOrCreateUserInventoryItem(user: string, item: string | number) {
	try {
		let userInventoryItem;
		// We are not looking for a user, in userCore, since we assume he is already created, as this function gets called AFTER findOrCreateUser.
		// Try finding item by ID first.
		if (typeof (item) == "number") {
			userInventoryItem = await AppDataSource.manager.findOne(User.Inventory, {
				where: {
					user_uuid: user,
					item_id: item,
				},
			});
		}
		// Then try finding by name.
		else if (typeof (item) == "string") {
			userInventoryItem = await AppDataSource.manager.findOne(User.Inventory, {
				where: {
					user_uuid: user,
					item: {
						name: item,
					}
				}, relations: ["item"]
			});
		}

		// If we don't find any, well, create it.
		if (!userInventoryItem) {
			userInventoryItem = new User.Inventory();
			userInventoryItem.user_uuid = user;
			// If we provided ID number.
			if (typeof (item) == "number") {
				userInventoryItem.item_id = item;
			}
			// If we provided string, we will have to find it in the item database first.
			else if (typeof (item) == "string") {
				const itemInfo = await findOrCreateItem(item);
				if (itemInfo.error) {
					return {
						data: itemInfo.data,
						error: itemInfo.error
					};
				}
				if (typeof (itemInfo.data) == "string") {
					return {
						data: itemInfo.data,
						error: itemInfo.error
					};
				}
				// Finally we can apply the ID if we found the item.
				userInventoryItem.item_id = itemInfo.data.id;
				// Finally save it.
				userInventoryItem = await AppDataSource.manager.save(User.Inventory, userInventoryItem);
			}
		}

		return {
			data: {
				name: userInventoryItem.item.name,
				description: userInventoryItem.item.description,
				lore: userInventoryItem.item.lore,
				id: userInventoryItem.item_id,
				user: userInventoryItem.user_uuid,
				amount: userInventoryItem.amount,
				maxStack: userInventoryItem.item.max_stack,
			}
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
			return {
				data: userInfo.data,
				error: userInfo.error
			};
		}
		if (typeof (userInfo.data) == "string") {
			return {
				data: userInfo.data,
				error: userInfo.error
			};
		}

		// Now we need to go through the items.
		// See what items we are getting.
		// Check if a user has that item.
		// If yes, add amount.
		// If not, create entry.
		// Return new data.

		const itemsAdded: I_addedItem[] = [];
		console.log(`items to distribute: ${JSON.stringify(items)}`);

		items.map(async (item) => {
			// This is not needed, but TS screams otherwise.
			if (typeof (item.reward) != "object") {
				return {
					data: "Something terrible happened whilst trying to distribute items.",
					error: true
				};
			}
			if (typeof (item.reward.type) != "string") {
				return {
					data: "Something terrible happened whilst trying to distribute items.",
					error: true
				};
			}

			// Try finding the item first.
			let userItem = await findOrCreateUserInventoryItem(user, item.reward.type);
			if (userItem.error) {
				return {
					data: userItem.data,
					error: userItem.error
				};
			}
			if (typeof (userItem.data) == "string") {
				return {
					data: userItem.data,
					error: userItem.error,
				};
			}

			userItem.data.amount += item.reward.amount;

			//Ensure we don't go over max stack.
			if (userItem.data.amount > userItem.data.maxStack) {
				userItem.data.amount = userItem.data.maxStack;
			}

			// Sanitize the object before saving.
			const saveItem = {
				amount: userItem.data.amount,
				user_uuid: userItem.data.user,
				item_id: userItem.data.id
			};
			// Save and return.
			const newItem = await AppDataSource.manager.save(User.Inventory, saveItem);

			// Lets give it an object.
			const addedItem = {
				id: newItem.item_id,
				uuid: newItem.user_uuid,
				name: newItem.item.name,
				description: newItem.item.description,
				lore: newItem.item.lore,
				amount: newItem.amount,
				maxStack: newItem.item.max_stack
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
};

export async function findOrCreateUserDaily(user: string, streak?: number, timestamp?: Date) {
	try {
		const userInfo = await findOrCreateUser(user);
		if (userInfo.error) {
			return {
				data: userInfo.data,
				error: userInfo.error
			};
		}
		if (typeof (userInfo.data) == "string") {
			return {
				data: userInfo.data,
				error: userInfo.error
			};
		}

		let userDaily = await AppDataSource.manager.findOne(User.Daily, {
			where: {
				uuid: userInfo.data.uuid,
			}
		});
		// If no daily found, create.
		if (!userDaily) {
			userDaily = new User.Daily();
			userDaily.uuid = userInfo.data.uuid;
		}

		// If we provide the timestamp
		if (timestamp) {
			userDaily.daily_timestamp = timestamp;
		}
		if (streak) {
			userDaily.daily_streak = streak;
		}
		userDaily = await AppDataSource.manager.save(User.Daily, userDaily);
		return {
			data: {
				uuid: userDaily.uuid,
				daily_streak: userDaily.daily_streak,
				daily_timestamp: userDaily.daily_timestamp,
			}
		};
	} catch (e: any) {
		logError(e);
		return {
			data: "Something terrible happened whilst trying to access database. Contact the developer.",
			error: true,
		};
	}
}

export async function setNewDaily(user: string, streak?: number, timestamp?: Date) {
	try {
		let userDaily = await findOrCreateUserDaily(user);
		if (userDaily.error) {
			return {
				data: userDaily.data,
				error: userDaily.error
			};
		}
		if (typeof (userDaily.data) == "string") {
			return {
				data: userDaily.data,
				error: userDaily.error
			};
		}

		if (streak) {
			userDaily.data.daily_streak = streak;
		}

		if (timestamp) {
			userDaily.data.daily_timestamp = timestamp;
		}

		const newUserDaily = {
			uuid: userDaily.data.uuid,
			daily_streak: userDaily.data.daily_streak,
			daily_timestamp: userDaily.data.daily_timestamp
		};
		const response = await AppDataSource.manager.save(User.Daily, newUserDaily);
		return {
			data: {
				uuid: response.uuid,
				daily_streak: response.daily_streak,
				daily_timestamp: response.daily_timestamp,
			}
		};
	} catch (e: any) {
		logError(e);
		return {
			data: "Something terrible happened whilst trying to access database. Contact the developer.",
			error: true,
		};
	}
}