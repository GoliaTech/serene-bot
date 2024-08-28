import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserCore } from "./core";

/**
 * User Daily
 *
 * @export
 * @class UserDaily
 */
@Entity({ name: "user_daily" })
export class UserDaily {
	@PrimaryGeneratedColumn("uuid")
	uuid!: string;
	@OneToOne(() => UserCore, { onDelete: "CASCADE" })
	@JoinColumn({ name: "uuid" })
	userCore!: UserCore;
	@Column({ name: "daily_timestamp", type: "timestamp without time zone" })
	daily_timestamp!: Date;
	@Column({ name: "daily_streak", type: "integer", default: 0 })
	daily_streak!: number;
}