import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { CoachService } from './coach.service';
import { CreateCoachDto } from './dto/create-coach.dto';
import { UpdateCoachDto } from './dto/update-coach.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('coach')
export class CoachController {

  constructor(private readonly coachService: CoachService) { }

  @ApiOperation({ summary: 'Assign coach to a club' })
  @ApiResponse({ status: 201, description: 'Coaches', type: [CreateCoachDto] })
  @Patch(':coachId/club')
  async assignCoachToClub(
    @Param('coachId', ParseIntPipe) coachId: number,
    @Body() updateCoachDto: UpdateCoachDto) {
    return this.coachService.assignCoachToClub(coachId, updateCoachDto);
  }

  @ApiOperation({ summary: 'Create a coach' })
  @ApiResponse({ status: 201, description: 'Coaches', type: [CreateCoachDto] })
  @Post()
  create(@Body() createCoachDto: CreateCoachDto) {
    return this.coachService.create(createCoachDto);
  }

  @ApiOperation({ summary: 'Gell all coaches' })
  @ApiResponse({ status: 201, description: 'Coaches', type: [CreateCoachDto] })
  @Get()
  findAll() {
    return this.coachService.findAll();
  }

  @ApiOperation({ summary: 'Delete a club from a club' })
  @ApiResponse({ status: 201, description: 'Coaches', type: [CreateCoachDto] })
  @Delete(':coachId/club')
  deleteCoachFromClub(
    @Param('coachId', ParseIntPipe) coachId: number) {
    return this.coachService.deleteCoachFromClub(coachId);
  }
}
