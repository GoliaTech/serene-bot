import { Column, Entity, PrimaryGeneratedColumn, JoinColumn, OneToOne, CreateDateColumn, Relation } from "typeorm";
import { UserCurrency } from "./currency";
import { UserLevel } from "./level";

/**
 * User Core
 *
 * @export
 * @class UserCore
 */
@Entity("user_core")
export class UserCore {
	@PrimaryGeneratedColumn("uuid")
	uuid!: string;

	@Column({ type: "varchar", length: 64, nullable: true })
	display_name!: string;

	@Column({ type: "text", unique: true })
	discord_id!: string;

	@CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
	joined_at!: Date;

	@OneToOne(() => UserLevel, (userLevel) => userLevel.user)
	@JoinColumn({ name: "uuid" }) // Explicitly join on the uuid column
	user_level!: Relation<UserLevel>;

	@OneToOne(() => UserCurrency, (userCurrency) => userCurrency.user)
	@JoinColumn({ name: "uuid" }) // Explicitly join on the uuid column
	user_currency!: Relation<UserCurrency>;
};
