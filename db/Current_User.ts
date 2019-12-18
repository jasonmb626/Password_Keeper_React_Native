import {Entity, PrimaryColumn, Column, BaseEntity} from "typeorm";

@Entity()
export class Current_User extends BaseEntity {

    @PrimaryColumn("text")
    email!: string;

    @Column("text")
    password!: string;
}