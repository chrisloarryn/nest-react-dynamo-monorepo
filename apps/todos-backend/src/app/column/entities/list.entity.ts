import { randomUUID } from 'node:crypto';
import { Schema } from 'dynamoose';

export const ListSchema = new Schema(
  {
    id: {
      type: String,
      hashKey: true,
      required: false,
      default: randomUUID,
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
      schema: [String],
    },
  },
  {
    timestamps: true,
  }
);
