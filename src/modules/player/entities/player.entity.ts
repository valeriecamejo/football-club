import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Club } from '../../club/entities/club.entity';

@Entity()
export class Player {

    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column('text', {
        unique: true,
        nullable: true,
    })
    name: string;

    @Column('numeric', { nullable: true })
    salary?: number;

    @ManyToOne(() => Club, club => club.players)
    @JoinColumn({ name: 'club_id' })
    club: Club;

    @Column('int', {
        unique: true,
        nullable: true,
    })
    club_id?: number;
}