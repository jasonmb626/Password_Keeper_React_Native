import {Entity, OneToMany, Column, BaseEntity, PrimaryGeneratedColumn} from "typeorm";
import {ServiceModel} from './Service';

@Entity()
export class UserModel extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string

    @Column({
        type: "text",
        unique: true
    })
    email!: string;

    @Column("text")
    password!: string;

    @Column({ 
        type: "int",
        default: true
    })
    active!: boolean;
    
    @Column({ 
        type: "int",
        default: true
    })
    loggedIn!: boolean;

    @OneToMany(type => ServiceModel, service => service.user, {eager: true})
    services!: ServiceModel[];
}