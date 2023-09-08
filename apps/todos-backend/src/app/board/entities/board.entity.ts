import { v4 } from 'uuid';
import { Schema } from "dynamoose";

// dynamoose schema with name "board"and properties: id, name, backgroundUrl,ownerId
export const BoardSchema = new Schema({
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
	backgroundUrl: {
		type: String,
		required: true,
	},
	ownerId: {
		type: String,
		required: true,
	},
}, {
	timestamps: true,
});

