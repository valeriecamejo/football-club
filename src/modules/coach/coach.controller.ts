import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { CoachService } from './coach.service';
import { CreateCoachDto } from './dto/create-coach.dto';
import { UpdateCoachDto } from './dto/update-coach.dto';

@Controller('coach')
export class CoachController {

  constructor(private readonly coachService: CoachService) { }

  @Patch(':coachId/club')
  async assignCoachToClub(
    @Param('coachId', ParseIntPipe) coachId: number,
    @Body() updateCoachDto: UpdateCoachDto) {
    return this.coachService.assignCoachToClub(coachId, updateCoachDto);
  }

  @Post()
  create(@Body() createCoachDto: CreateCoachDto) {
    return this.coachService.create(createCoachDto);
  }

  @Get()
  findAll() {
    return this.coachService.findAll();
  }

  @Delete(':coachId/club')
  deleteCoachFromClub(
    @Param('coachId', ParseIntPipe) coachId: number) {
    return this.coachService.deleteCoachFromClub(coachId);
  }
}
