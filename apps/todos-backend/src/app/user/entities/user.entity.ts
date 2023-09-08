import { v4 } from 'uuid';
import { Schema } from 'dynamoose';

// dynamoose schema with name "user" and properties: id, displayName, email, avatarUrl.
export const UserSchema = new Schema({
	id: {
		type: String,
		hashKey: true,
		required: false,
		default: v4()
	},
	displayName: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	avatarUrl: {
		type: String,
		required: true,
		default: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
		set: (value: string) => {
			if (!value) {
				return 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
			}
		},
	},
}, {
	timestamps: true,
});

