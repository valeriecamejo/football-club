import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { PlayerService } from './player.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';

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

  /*@Get()
  findAll() {
    return this.playerService.findAll();
  }*/

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.playerService.findOne(id);
  }

  @Get()
  async getPlayers(
      @Query('club_id') club_id: number,
      @Query('name') name: string,
      @Query('page') page: number = 1,
      @Query('limit') limit: number = 10
  ) {
      return this.playerService.getPlayers(club_id, name, page, limit);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlayerDto: UpdatePlayerDto) {
    return this.playerService.update(+id, updatePlayerDto);
  }

  @Delete(':playerId/club')
  deleteCoachFromClub(@Param('playerId', ParseIntPipe) playerId: number) {
    return this.playerService.deletePlayerFromClub(playerId);
  }
}
