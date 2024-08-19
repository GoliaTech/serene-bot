import { User } from "../entity/index";
import { AppDataSource } from "../datasource";
import { checkUUID } from "../../utilities/utilities";
import { LessThanOrEqual, MoreThanOrEqual } from "typeorm";


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
}

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
		let userInfo = await AppDataSource.manager.findOne(User.Core, {
			where: [{ uuid: identifier }, { discord_id: identifier }],
			relations: ['userLevel', 'userCurrency'],
		});

		// If no user was found AND if the identifier is not a UUID, create a new user.
		if (!userInfo && !checkUUID(identifier)) {
			userInfo = new User.Core();
			userInfo.discord_id = identifier;
			userInfo = await AppDataSource.manager.save(User.Core, userInfo);

			// After saving, the trigger creates Currency and Level entries.
			// We need to therefore reload the User.Core from the database.
			userInfo = await AppDataSource.manager.findOne(User.Core, {
				where: [{ uuid: identifier }, { discord_id: identifier }],
				relations: ['userLevel', 'userCurrency'],
			});
		}

		if (!userInfo) {
			return {
				data: "User not found.",
				error: true,
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
		console.error(e);
		return {
			data: "It seems something didn't work out.",
			error: true,
		};
	}
}
