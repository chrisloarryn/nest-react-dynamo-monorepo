import { randomUUID } from 'node:crypto';
import { Schema } from 'dynamoose';

export const BoardSchema = new Schema({
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
  backgroundImage: {
    type: String,
    required: false,
    default: '',
  },
  createdBy: {
    type: String,
    required: true,
  },
  dateCreated: {
    type: String,
    required: false,
  },
  users: {
    type: Array,
    required: false,
    default: [],
    schema: [String],
  },
}, {
  timestamps: true,
});
