import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { UserCore } from "./core";

/**
 * User Currency
 *
 * @export
 * @class UserCurrency
 */
@Entity({ name: "user_currency" })
export class UserCurrency {
	@PrimaryGeneratedColumn("uuid")
	uuid!: string;
	@Column({ type: "int", default: 0 })
	common!: number;
	@Column({ type: "int", default: 0 })
	premium!: number;
	@OneToOne(() => UserCore, { onDelete: "CASCADE" })
	@JoinColumn({ name: "uuid" })
	userCore!: UserCore;
};
