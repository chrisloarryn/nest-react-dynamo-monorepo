import { randomUUID } from 'node:crypto';
import { Schema } from 'dynamoose';
import { TaskStatus } from '../interfaces/task.interface';

export const TaskSchema = new Schema(
  {
    id: {
      type: String,
      hashKey: true,
      required: false,
      default: randomUUID,
    },
    title: {
      type: String,
      required: false,
      default: 'Add title',
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
    userId: {
      type: String,
      required: true,
    },
    assignedTo: {
      type: String,
      required: false,
      default: '',
    },
    label: {
      type: Object,
      required: false,
      schema: {
        bg: {
          type: String,
          required: false,
        },
        type: {
          type: String,
          required: false,
        },
      },
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
