import { Injectable } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { Board, BoardKey } from './interfaces/board.interface';

@Injectable()
export class BoardService {
  constructor(
    @InjectModel('Board')
    private readonly boardModel: Model<Board, BoardKey>
  ) { }
  create(createBoardDto: Board) {
    return this.boardModel.create(createBoardDto);
  }

  findAll() {
    return this.boardModel.scan().exec();
  }

  findOne(id: BoardKey) {
    return this.boardModel.get(id);
  }

  update(id: BoardKey, updateBoardDto: Board) {
    return this.boardModel.update(id, updateBoardDto);
  }

  remove(id: number) {
    return `This action removes a #${id} board`;
  }
}
