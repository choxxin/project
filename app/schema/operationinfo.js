import mongoose from "mongoose";

const ecoinfoSchema = new mongoose.Schema(
  {
    location: {
      type: String,
      required: [true, "provide location"],
    },
    reforestation: {
      type: String,
    },
    garbage_collection: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Check if model already exists before defining it
const EcoModel = mongoose.models.Eco || mongoose.model("Eco", ecoinfoSchema);

export default EcoModel;