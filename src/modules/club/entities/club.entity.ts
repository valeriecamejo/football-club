import { Coach } from "src/modules/coach/entities/coach.entity";
import { Player } from "src/modules/player/entities/player.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Club {

    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column('text', {
        unique: true
    })
    name: string;

    @Column('float')
    budget: number;

    @Column('float')
    remainingBudget?: number; 

    @OneToMany(() => Player, player => player.club)
    players: Player[];

    @OneToMany(() => Coach, coach => coach.club)
    coaches: Coach[];
}
