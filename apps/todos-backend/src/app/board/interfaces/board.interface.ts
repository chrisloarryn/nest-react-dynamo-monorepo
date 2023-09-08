import { v4 } from "uuid";

export interface BoardKey {
	id: string;
}

export interface Board extends BoardKey {
	name: string;
	backgroundUrl: string;
	ownerId: string;
}

const stubBoard: Board = {
	id: v4(),
	name: 'Board 1',
	backgroundUrl: 'https://picsum.photos/200/300',
	ownerId: '1',
};