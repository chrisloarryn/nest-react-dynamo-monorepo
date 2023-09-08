import { v4 } from 'uuid';
import { Schema } from 'dynamoose';
import { TaskStatus } from '../interfaces/task.interface';



// dynamoose schema with name "task"and properties: id, text, order, archived.
export const TaskSchema = new Schema({
	id: {
		type: String,
		hashKey: true,
		required: false,
		default: v4()
	},
	text: {
		type: String,
		required: true,
	},
	status: {
		type: String,
		required: false,
		enum: Object.values(TaskStatus),
		default: TaskStatus.TODO,
	},
	type: {
		type: String,
		required: true,
	},
	order: {
		type: Number,
		required: true,
	},
	
	archived: {
		type: Boolean,
		required: false,
		default: false,
	},
}, {
	timestamps: true,
});

