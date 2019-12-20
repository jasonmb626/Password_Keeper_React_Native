import {Entity, Column, BaseEntity, PrimaryColumn, ManyToOne, OneToMany, JoinColumn} from "typeorm";
import {UserModel} from './User';

@Entity()
export class ServiceModel extends BaseEntity {
    @PrimaryColumn("text")
    id!: string;
    
    @ManyToOne(type => UserModel, user => user.services)
    @JoinColumn()
    user!: UserModel;
    
    @Column("text")
    service!: string;

    @Column("text")
    username!: string;

    @Column("text")
    password!: string;

    @Column("text")
    notes!: string;
  }
  