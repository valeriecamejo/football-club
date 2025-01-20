import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Club } from '../../club/entities/club.entity';

@Entity()
export class Coach {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', { unique: true })
    name: string;

    @Column('numeric')
    salary: number;

    @ManyToOne(() => Club, club => club.coaches)
    @JoinColumn({ name: 'club_id' })
    club: Club;

    @Column('int', {
        unique: true,
        nullable: true,
    })
    club_id?: number;
}