import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  team: { type: Schema.Types.ObjectId, ref: 'Team' },
  fitnessGoal: { type: String, required: true, trim: true },
});

userSchema.pre('validate', function () {
  if (this.name && this.email && !this.fitnessGoal) this.fitnessGoal = 'general fitness';
});

export const User = model('User', userSchema);
