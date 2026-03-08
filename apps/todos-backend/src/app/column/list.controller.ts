import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ListService } from './list.service';
import { List } from './interfaces/list.interface';

@Controller('columns')
export class ListController {
  constructor(private readonly listService: ListService) {}

  @Post()
  create(@Body() list: List) {
    return this.listService.create(list);
  }

  @Get()
  findAll() {
    return this.listService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.listService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() list: List) {
    return this.listService.update(id, list);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.listService.remove(id);
  }
}
