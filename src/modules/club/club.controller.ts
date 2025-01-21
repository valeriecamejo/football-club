import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { ClubService } from './club.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('club')
export class ClubController {
  constructor(private readonly clubService: ClubService) {}

  @ApiOperation({ summary: 'Create a club' })
  @ApiResponse({ status: 201, description: 'Clubs', type: [CreateClubDto] })
  @Post()
  create(@Body() createClubDto: CreateClubDto) {
    return this.clubService.create(createClubDto);
  }

  @ApiOperation({ summary: 'Get all clubs' })
  @ApiResponse({ status: 200, description: 'Clubs', type: [CreateClubDto] })
  @Get()
  findAll(): Promise<CreateClubDto[]> {
    return this.clubService.findAll();
  }

  @ApiOperation({ summary: 'Get club by ID' })
  @ApiResponse({ status: 200, description: 'Clubs', type: [CreateClubDto] })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clubService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a club' })
  @ApiResponse({ status: 200, description: 'Clubs', type: [CreateClubDto] })
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateClubDto: UpdateClubDto) {
    return this.clubService.update(id, updateClubDto);
  }
}
