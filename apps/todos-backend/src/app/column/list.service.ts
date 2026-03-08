import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
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

  async findOne(id: string): Promise<List> {
    return this.listModel.get({ id });
  }

  async update(id: string, list: List): Promise<List> {
    return this.listModel.update({ id }, { ...list, id });
  }

  async remove(id: string): Promise<{ deleted: true; id: string }> {
    await this.listModel.delete({ id });

    return { deleted: true, id };
  }
}
