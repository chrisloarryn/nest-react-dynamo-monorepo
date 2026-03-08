import { randomUUID } from 'node:crypto';
import { Schema } from 'dynamoose';

export const UserSchema = new Schema({
  id: {
    type: String,
    hashKey: true,
    required: false,
    default: randomUUID,
  },
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  avatarUrl: {
    type: String,
    required: false,
    default: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
  },
}, {
  timestamps: true,
});
