import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { UserCore } from "./core";

/**
 * User Currency
 *
 * @export
 * @class UserCurrency
 */
@Entity("user_currency")
export class UserCurrency {
	@PrimaryGeneratedColumn("uuid")
	uuid!: string;

	@Column({ type: "int", default: 0 })
	common!: number;

	@Column({ type: "int", default: 0 })
	premium!: number;

	@OneToOne(() => UserCore, (userCore) => userCore.user_currency, {
		onDelete: "CASCADE",
	})
	@JoinColumn({ name: "uuid" }) // Explicitly join on the uuid column
	user!: UserCore;
};
