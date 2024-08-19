import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { UserCore } from "./core";

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
  @Column({ type: "int", default: 1 })
  level!: number;
  @Column({ type: "int", default: 0 })
  prestige!: number;
  @Column({ type: "int", default: 0 })
  xp!: number;
  @Column({ name: "xp_to_level", type: "int", default: 100 })
  xp_to_level!: number;
  @OneToOne(() => UserCore, { onDelete: "CASCADE" })
  @JoinColumn({ name: "uuid" })
  userCore!: UserCore;
  // @OneToOne(() => UserCore, (userCore) => userCore.userLevel, { onDelete: "CASCADE" })
  // @JoinColumn({ name: "uuid" })
  // userCore!: UserCore;
};
