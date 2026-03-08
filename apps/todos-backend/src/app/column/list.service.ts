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

  async create(list: Partial<List>): Promise<List> {
    return this.listModel.create(list as List);
  }

  async findOne(id: string): Promise<List> {
    return this.listModel.get({ id });
  }

  async update(id: string, list: Partial<List>): Promise<List> {
    const payload = { ...(list as Partial<List> & { id?: string }) };
    delete payload.id;

    return this.listModel.update(
      { id },
      {
        $SET: payload as List,
      }
    );
  }

  async remove(id: string): Promise<{ deleted: true; id: string }> {
    await this.listModel.delete({ id });

    return { deleted: true, id };
  }
}
