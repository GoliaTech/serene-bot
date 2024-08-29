import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "discord_server" })
export class DiscordServer {
	@PrimaryColumn("text")
	id!: string;
	@Column({ type: "text", name: "owner_id" })
	ownerId!: string;
	@Column({ type: "text", name: "staff_role" })
	staffRole!: string;
	@Column({ type: "text", name: "admin_role" })
	adminRole!: string;
	@Column({ type: "text", name: "moderator_role" })
	moderatorRole!: string;
	@Column({ type: "text", name: "welcome_channel" })
	welcomeChannel!: string;
	@Column({ type: "text", name: "log_channel" })
	logChannel!: string;
	@Column({ type: "text", name: "announce_channel" })
	announceChannel!: string;
	@Column({ type: "text", name: "maintenance_channel" })
	maintenanceChannel!: string;
	@Column({ type: "boolean", name: "greeting_option" })
	greetingOption!: boolean;
	@Column({ type: "boolean", name: "leave_option" })
	leaveOption!: boolean;
}