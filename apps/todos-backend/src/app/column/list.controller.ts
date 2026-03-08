import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ListService } from './list.service';
import { DeleteResponseDto } from '../common/dto/delete-response.dto';
import { CreateListDto } from './dto/create-list.dto';
import { ListDto } from './dto/list.dto';
import { UpdateListDto } from './dto/update-list.dto';

@ApiTags('columns')
@Controller('columns')
export class ListController {
  constructor(private readonly listService: ListService) {}

  @Post()
  @ApiCreatedResponse({ type: ListDto })
  @ApiBadRequestResponse({ description: 'Invalid column payload' })
  create(@Body() list: CreateListDto) {
    return this.listService.create(list);
  }

  @Get()
  @ApiOkResponse({ type: ListDto, isArray: true })
  findAll() {
    return this.listService.findAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id', example: 'column-1' })
  @ApiOkResponse({ type: ListDto })
  findOne(@Param('id') id: string) {
    return this.listService.findOne(id);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', example: 'column-1' })
  @ApiOkResponse({ type: ListDto })
  @ApiBadRequestResponse({ description: 'Invalid column payload' })
  update(@Param('id') id: string, @Body() list: UpdateListDto) {
    return this.listService.update(id, list);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', example: 'column-1' })
  @ApiOkResponse({ type: DeleteResponseDto })
  remove(@Param('id') id: string) {
    return this.listService.remove(id);
  }
}
