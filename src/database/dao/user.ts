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
		await AppDataSource.initialize();
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
			userInfo = await AppDataSource.manager.save(User.Core, userInfo);

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

		await AppDataSource.destroy();

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
