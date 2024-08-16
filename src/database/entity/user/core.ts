import { Column, Entity, PrimaryGeneratedColumn, JoinColumn, OneToOne } from "typeorm";

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
	display_name: string | undefined;
	@Column({ type: "text", nullable: false, unique: true })
	discord_id!: string;
	@Column({ type: "timestamp without time zone", default: () => "CURRENT_TIMESTAMP" })
	joined_at!: Date;
	@OneToOne(() => UserLevel, (levels) => levels.uuid)
	levels!: UserLevel[];
	@OneToOne(() => UserCurrency, (currency) => currency.uuid)
	currencies!: UserCurrency[];
};

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
	@OneToOne(() => UserCore)
	@JoinColumn({ name: "uuid" })
	core!: UserCore;
	@Column({ type: "int", default: 0 })
	common!: number;
	@Column({ type: "int", default: 0 })
	premium!: number;
};

/**
 * User Level
 *
 * @export
 * @class UserLevel
 */
@Entity({ name: "user_level" })

export class UserLevel {
	@PrimaryGeneratedColumn("uuid")
	uuid!: string;
	@OneToOne(() => UserCore)
	@JoinColumn({ name: "uuid" })
	core!: UserCore;
	@Column({ type: "int", nullable: false, default: 1 })
	level!: number;
	@Column({ type: "int", nullable: false, default: 0 })
	xp!: number;
	@Column({ type: "int", nullable: false, default: 100 })
	xp_to_level!: number;
	@Column({ type: "int", nullable: false, default: 0 })
	prestige!: number;
};