import {Entity, Column, BaseEntity, PrimaryColumn} from "typeorm";

@Entity()
export class ServiceModel extends BaseEntity {
    @PrimaryColumn("text")
    id!: string;
    
    @Column("text")
    user?: string;
    
    @Column("text")
    service!: string;

    @Column("text")
    username!: string;

    @Column("text")
    password!: string;

    @Column("text")
    notes!: string;
  }
  