import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Club } from '../../club/entities/club.entity';

@Entity()
export class Player {

    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column('text', { unique: true })
    name: string;

    @Column('float', { nullable: true })
    salary?: number;

    @ManyToOne(() => Club, club => club.players)
    @JoinColumn({ name: 'club_id' })
    club: Club;

    @Column('int', {
        nullable: true,
    })
    club_id?: number;
}