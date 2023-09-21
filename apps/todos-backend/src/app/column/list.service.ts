import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { ListSchema } from './entities/list.entity';
import { List, ListKey } from './interfaces/list.interface';

@Injectable()
export class ListService {
  constructor(
    @InjectModel('List')
    private readonly listModel: Model<List, ListKey>
  ) { }

  async findAll(): Promise<List[]> {
    return this.listModel.scan().exec();
  }

  async create(list: List): Promise<List> {
    return this.listModel.create(list);
  }

  async findOne(id: ListKey): Promise<List> {
    return this.listModel.get(id);
  }

  async update(id: ListKey, list: List): Promise<List> {
    return this.listModel.update(id, list);
  }

  async remove(id: ListKey): Promise<any> {
    return this.listModel.delete(id);
  }
}
