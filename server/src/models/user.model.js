import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    refreshToken: { // Fixed typo from "refeshToken" to "refreshToken"
      type: String,
    },
    role: {
      type: [String],
      required: true,
      enum: ['buyer', 'seller'], // Ensures only 'buyer' or 'seller' roles can be assigned
      default: ['buyer'],
    },
    activeRole: {
      type: String,
      enum: ['buyer', 'seller'], // The active role the user is currently using
      default: 'buyer',
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Method to switch user roles
userSchema.methods.switchRole = function (newRole) {
    if (this.role.includes(newRole)) { // Updated "roles" to "role" since the field is named "role"
    this.activeRole = newRole;
    return this.save(); // Save the updated activeRole to the database
  } else {
    throw new Error('User does not have the specified role');
  }
};

// Pre-save middleware to hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare provided password with the stored hashed password
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Method to generate an access token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
      role: this.role
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// Method to generate a refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
