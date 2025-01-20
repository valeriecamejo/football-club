import { Coach } from "src/modules/coach/entities/coach.entity";
import { Player } from "src/modules/player/entities/player.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UpdateClubDto } from "../dto/update-club.dto";

@Entity()
export class Club {

    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column('text', {
        unique: true
    })
    name: string;

    @Column('numeric')
    budget: number;

    @Column('numeric')
    remainingBudget?: number; 

    @OneToMany(() => Player, player => player.club)
    players: Player[];

    @OneToMany(() => Coach, coach => coach.club)
    coaches: Coach[];
}
