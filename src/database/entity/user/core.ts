import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, OneToOne } from "typeorm";
import { UserLevel } from "./level";
import { UserCurrency } from "./currency";

/**
 * User Core
 *
 * @export
 * @class UserCore
 */
@Entity({ name: "user_core" })
export class UserCore {
	@PrimaryGeneratedColumn("uuid")
	uuid!: string;
	@Column({ type: "varchar", length: 64, nullable: true })
	display_name!: string;
	@Column({ type: "text", unique: true })
	discord_id!: string;
	@CreateDateColumn({ type: "timestamp" })
	joined_at!: Date;
	@OneToOne(() => UserLevel, (userLevel) => userLevel.userCore)
	userLevel!: UserLevel;
	@OneToOne(() => UserCurrency, (userLevel) => userLevel.userCore)
	userCurrency!: UserCurrency;
};
