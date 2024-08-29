import { logError } from "../../utilities/utilities";
import { AppDataSource } from "../datasource";
import { Discord } from "../entity";

/**
 * Find or create a discord server.
 * @param {string} identifier Discord guild ID
 * @returns a bunch of data. Either data with error, or data.
 */
export async function findOrCreateDiscordServer(identifier: string) {
	try {
		// Get the user first.
		// await AppDataSource.initialize();
		let serverInfo = await AppDataSource.manager.findOne(Discord.Server, {
			where: [{ id: identifier }],
		});

		if (!serverInfo) {
			serverInfo = new Discord.Server();
			serverInfo.id = identifier;
			await AppDataSource.manager.save(Discord.Server, serverInfo);
		}

		return {
			data: {
				id: serverInfo.id,
				ownerId: serverInfo.ownerId,
				staffRole: serverInfo.staffRole,
				adminRole: serverInfo.adminRole,
				moderatorRole: serverInfo.moderatorRole,
				welcomeChannel: serverInfo.welcomeChannel,
				logChannel: serverInfo.logChannel,
				announceChannel: serverInfo.announceChannel,
				maintenanceChannel: serverInfo.maintenanceChannel,
				greetingOption: serverInfo.greetingOption,
				leaveOption: serverInfo.leaveOption,
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