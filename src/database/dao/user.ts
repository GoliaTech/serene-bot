// Here, we will put in code to process users in the database.
// I want to use the good practice of using the DAO, instead of just writing everything all over again in the code.
// So this file will handle various user interactions between the bot and the database.

import { Op } from "sequelize";
import { randomUUID } from "crypto";
import { models, seql } from "../models";
import { UserCoreModel } from "../../utilities/interface";

/**
 * This gets an existing user or defines a new one.
 * @param userToFind Parse the ID or UUID into here. I'm not sure yet if I have to define a type for UUID, i think it's just a string, so...
 * @returns 
 */
export async function getUser(userToFind: string) {
	// Define transactions.
	let transaction;
	try {
		// We then assign the transaction from seql (sequelize)
		transaction = await seql.transaction();
		// Create user and created. 
		// The reason for this is because we findOrCreate throws the model and boolean if a model has been created or not.
		const [user, created]: [UserCoreModel, boolean] = await models["user_core"].findOrCreate({
			where: {
				// Let it look for either UUID or discord id
				[Op.or]: [
					{ user_uuid: userToFind },
					{ discord_id: userToFind }
				]
			},
			// If nothing found, create.
			defaults: {
				user_uuid: randomUUID(),
				discord_id: userToFind,
			},
			// Append our transaction.
			transaction
		});

		// If all is good, commit!
		await transaction.commit();

		// Return if the model has been created or not, and the model itself.
		return {
			created: created,
			model: user
		};
	} catch (e) {
		// If something goes wrong, first thing you do is check if there is a transaction.
		// If there is, roll it back.
		if (transaction) await transaction.rollback();
		console.error(e);
		// I don't think this is needed, but it could be good to process stuff that didn't work out.
		return null;
	}
}
