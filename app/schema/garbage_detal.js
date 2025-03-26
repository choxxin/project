import mongoose from "mongoose";

const garbageSchema = new mongoose.Schema(
  {
    location: {
      type: String,
      required: [true, "Provide location where garbage was found"],
    },
    foundAt: {
      type: Date,
      default: Date.now, // Automatically stores the current timestamp
    },
    type: {
      type: String,
      required: [
        true,
        "Provide type of garbage (e.g., plastic, organic, metal)",
      ],
    },

    description: {
      type: String,
      default: "No additional details provided.",
    },
  },
  {
    timestamps: true,
  }
);

// Check if model already exists before defining it
const GarbageModel =
  mongoose.models.Garbage || mongoose.model("Garbage", garbageSchema);

export default GarbageModel;
