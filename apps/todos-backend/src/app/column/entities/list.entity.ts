import { v4 } from 'uuid';
import { Schema } from 'dynamoose';

// dynamoose schema with name "list"and properties: id, name, order, boardId, archived, tasks.
export const ListSchema = new Schema(
  {
    id: {
      type: String,
      hashKey: true,
      required: false,
      default: v4(),
    },
    name: {
      type: String,
      required: true,
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
    boardId: {
      type: String,
      required: true,
    },
    archived: {
      type: Boolean,
      required: false,
      default: false,
    },
    tasks: {
      type: Array,
      required: false,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);
