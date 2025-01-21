import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { PlayerService } from './player.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { GetPlayersQueryDto } from './dto/get-players-query.dto';

@Controller('player')
export class PlayerController {

  constructor(private readonly playerService: PlayerService) { }

  @Patch(':playerId/club')
  async assignPlayerToClub(@Param('playerId', ParseIntPipe) playerId: number, @Body() updatePlayerDto: UpdatePlayerDto) {
    return this.playerService.assignPlayerToClub(playerId, updatePlayerDto);
  }

  @Post()
  async createPlayer(@Body() createPlayerDto: CreatePlayerDto) {
    return this.playerService.create(createPlayerDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.playerService.findOne(id);
  }

  @Get('club/:clubId')
  @UsePipes(new ValidationPipe())
  async getPlayersByFilter(
    @Param('clubId', ParseIntPipe) clubId: number,
    @Query() query: GetPlayersQueryDto
  ) {
    const { name, page, limit } = query;
    return this.playerService.getPlayersByFilter(clubId, name, page, limit);
  }

  @Delete(':playerId/club')
  deleteCoachFromClub(@Param('playerId', ParseIntPipe) playerId: number) {
    return this.playerService.deletePlayerFromClub(playerId);
  }
}
