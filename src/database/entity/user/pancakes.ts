// src/entities/User.ts
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "user_pancakes" })
export class UserPancakes {
	@PrimaryGeneratedColumn()
	id!: string;

	@Column({ unique: true, name: "user_id" })
	userID!: string;

	@Column({ default: 0 })
	flour!: number;

	@Column({ default: 0 })
	milk!: number;

	@Column({ default: 0 })
	eggs!: number;

	@Column({ default: 0, name: "whipped_cream" })
	whippedCream!: number;

	// How many pancakes has the user baked *this event*
	@Column({ default: 0, name: "pancakes_baked" })
	pancakesBaked!: number;

	// You could keep track of a "lifetime" total if you want:
	@Column({ default: 0, name: "lifetime_pancakes" })
	lifetimePancakes!: number;
}
