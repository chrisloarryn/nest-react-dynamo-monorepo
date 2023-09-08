import { v4 } from "uuid";

export interface UserKey {
	id: string;
}

export interface User extends UserKey {
	displayName: string;
	email: string;
	avatarUrl: string;
}

const stubUser: User = {
	id: v4(),
	displayName: 'User 1',
	email: 'email@example.com',
	avatarUrl: 'https://picsum.photos/200/300',
};