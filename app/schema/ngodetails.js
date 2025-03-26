import mongoose from "mongoose";

const ngoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "provide name"],
    },
    email: {
      type: String,
      required: [true, "provide email"],
      unique: true,
    },
    location: {
      type: String,
      required: [true, "provide location"],
    },
    clerkUserId: {
      type: String,
      required: true,
      unique: true
    }
  },
  {
    timestamps: true,
  }
);

// Check if model already exists before defining it
const NgoModel = mongoose.models.Ngo || mongoose.model("Ngo", ngoSchema);

export default NgoModel;