import mongoose, { Schema, models, model } from 'mongoose';

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required for creating a user account'],
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Invalid Email Address',
      ],
      unique: [true, 'Email Already Exists'],
    },
    name: {
      type: String,
      required: [true, 'Name is required for creating an account'],
    },
    password: {
      type: String,
      required: [true, 'Password is required for creating an account'],
      minlength: [6, 'Password should contain atleast 6 characters'],
      select: false,
    },
    systemUser: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: {
        values: ['USER', 'ADMIN'],
        message: 'Role must be either USER or ADMIN',
      },
      default: 'USER',
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const bcrypt = require('bcrypt');
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
  return;
});

const User = models.User || model('User', userSchema);

export default User;