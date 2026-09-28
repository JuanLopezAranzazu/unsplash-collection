import { Schema, model, Types } from "mongoose";

const userSchema = new Schema(
  {
    provider: String,
    providerId: String,
    name: String,
    avatar: String,
  },
  { timestamps: true },
);
userSchema.index({ provider: 1, providerId: 1 }, { unique: true });

const imageSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    tags: [String],
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    width: Number,
    height: Number,
    views: { type: Number, default: 0 },
  },
  { timestamps: true },
);
imageSchema.index({ title: "text", tags: "text", description: "text" });

const collectionSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    images: [{ type: Types.ObjectId, ref: "Image" }],
  },
  { timestamps: true },
);

export const User = model("User", userSchema);
export const Image = model("Image", imageSchema);
export const Collection = model("Collection", collectionSchema);
