import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "user_core" })
export class Core {
	@PrimaryGeneratedColumn("uuid")
	uuid!: string;

	@Column({ type: "varchar", length: 64, nullable: true })
	display_name: string | undefined;

	@Column({ type: "text", nullable: false, unique: true })
	discord_id!: string;

	@Column({ type: "timestamp without time zone", default: () => "CURRENT_TIMESTAMP" })
	joined_at!: Date;
}