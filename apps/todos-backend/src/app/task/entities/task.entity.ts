import { v4 } from 'uuid';
import { Schema } from 'dynamoose';
import { TaskStatus } from '../interfaces/task.interface';

// dynamoose schema with name "task"and properties: id, text, order, archived.
export const TaskSchema = new Schema(
  {
    id: {
      type: String,
      hashKey: true,
      required: false,
      default: v4(),
    },
    title: {
      type: String,
      required: false,
      default: '',
    },
    text: {
      type: String,
      required: false,
      default: '',
    },
    status: {
      type: String,
      required: false,
      enum: Object.values(TaskStatus),
      default: TaskStatus.TODO,
    },
    type: {
      type: String,
      required: false,
      default: 'task',
    },
    order: {
      type: Number,
      required: false,
      default: Math.floor(Math.random() * 1000),
      set: (value) => {
        if (value === undefined) {
          return Math.floor(Math.random() * 1000);
        }

        return value;
      },
    },
    // board id
    boardId: {
      type: String,
      required: true,
    },
    // column id
    columnId: {
      type: String,
      required: true,
    },
    archived: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
