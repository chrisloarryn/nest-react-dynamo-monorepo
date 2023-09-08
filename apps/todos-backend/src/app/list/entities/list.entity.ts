import { v4 } from 'uuid';
import { Schema } from 'dynamoose';

// dynamoose schema with name "list"and properties: id, name, order, boardId, archived, tasks.
export const ListSchema = new Schema({
	id: {
		type: String,
		hashKey: true,
		required: false,
		default: v4()
	},
	name: {
		type: String,
		required: true,
	},
	order: {
		type: Number,
		required: true,
	},
	boardId: {
		type: String,
		required: true,
	},
	archived: {
		type: Boolean,
		required: true,
	},
	tasks: {
		type: Array,
		required: true,
	},
}, {
	timestamps: true,
});

