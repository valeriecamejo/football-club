import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { PlayerService } from './player.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { GetPlayersQueryDto } from './dto/get-players-query.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('player')
export class PlayerController {

  constructor(private readonly playerService: PlayerService) { }

  @ApiOperation({ summary: 'Assign player to a club' })
  @ApiResponse({ status: 200, description: 'Players', type: [CreatePlayerDto] })
  @Patch(':playerId/club')
  async assignPlayerToClub(
    @Param('playerId', ParseIntPipe) playerId: number,
    @Body() updatePlayerDto: UpdatePlayerDto): Promise<CreatePlayerDto> {
    return this.playerService.assignPlayerToClub(playerId, updatePlayerDto);
  }

  @ApiOperation({ summary: 'Create a player' })
  @ApiResponse({ status: 201, description: 'Players', type: [CreatePlayerDto] })
  @Post()
  async createPlayer(@Body() createPlayerDto: CreatePlayerDto): Promise<CreatePlayerDto> {
    return this.playerService.create(createPlayerDto);
  }

  @ApiOperation({ summary: 'Get all players' })
  @ApiResponse({ status: 200, description: 'Players', type: [CreatePlayerDto] })
  @Get()
  findAll(): Promise<CreatePlayerDto[]> {
    return this.playerService.findAll();
  }

  @ApiOperation({ summary: 'Get a player by Id' })
  @ApiResponse({ status: 200, description: 'Players', type: [CreatePlayerDto] })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<CreatePlayerDto> {
    return this.playerService.findOne(id);
  }

  @ApiOperation({ summary: 'Get all player' })
  @ApiResponse({ status: 200, description: 'Players', type: [CreatePlayerDto] })
  @Get('club/:clubId')
  @UsePipes(new ValidationPipe())
  async getPlayersByFilter(
    @Param('clubId', ParseIntPipe) clubId: number,
    @Query() query: GetPlayersQueryDto
  ): Promise<CreatePlayerDto[]> {
    const { name, page, limit } = query;
    return this.playerService.getPlayersByFilter(clubId, name, page, limit);
  }

  @ApiOperation({ summary: 'Delete a player from a club' })
  @ApiResponse({ status: 200, description: 'Players', type: [CreatePlayerDto] })
  @Delete(':playerId/club')
  deleteCoachFromClub(@Param('playerId', ParseIntPipe) playerId: number): Promise<CreatePlayerDto> {
    return this.playerService.deletePlayerFromClub(playerId);
  }
}
