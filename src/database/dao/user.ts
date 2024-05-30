// Here, we will put in code to process users in the database.
// I want to use the good practice of using the DAO, instead of just writing everything all over again in the code.
// So this file will handle various user interactions between the bot and the database.

import { Op, UUIDV4 } from "sequelize";
import { models, seql } from "../models";

/**
 * This gets an existing user or defines a new one.
 * @param userToFind Parse the ID or UUID into here. I'm not sure yet if I have to define a type for UUID, i think it's just a string, so...
 * @returns 
 */
async function getUser(userToFind: string) {
	let transaction;
	try {
		transaction = await seql.transaction();
		const [user, created]: [any, boolean] = await models["user_core"].findOrCreate({
			where: {
				[Op.or]: [
					{ user_uuid: userToFind },
					{ discord_id: userToFind }
				]
			},
			defaults: {
				user_uuid: new UUIDV4,
				discord_id: userToFind,
			},
			transaction
		});

		await transaction.commit();

		return {
			created: created,
			model: user
		};
	} catch (e) {
		if (transaction) await transaction.rollback();
		console.error(e);
		return null;
	}
}

export = [
	getUser,
];