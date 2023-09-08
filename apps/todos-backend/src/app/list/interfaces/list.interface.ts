import { v4 } from "uuid";

export interface ListKey {
	id: string;
}

export interface List extends ListKey {
	name: string;
	order: number;
	boardId: string;
	archived: boolean;
	tasks: any[];
}


const stubList: List = {
	id: v4(),
	name: 'List 1',
	order: 1,
	boardId: '1',
	archived: false,
	tasks: [],
};