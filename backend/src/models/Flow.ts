//backend\src\models\Flow.ts
import mongoose, { Document, Schema } from "mongoose";
import {
  EdgeType,
  NodeType,
  SystemDesignEdge,
  SystemDesignNode,
} from "../types/flowTypes";

export interface IFlow extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  nodes: SystemDesignNode[];
  edges: SystemDesignEdge[];
  createdAt: Date;
  updatedAt: Date;
}

const flowSchema = new Schema<IFlow>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    description: {
      type: String,
      required: true,
      minLength: 6,
    },
    nodes: {
      type: [
        {
          id: { type: String, required: true },
          type: {
            type: String,
            required: true,
            enum: Object.values(NodeType),
          },
          position: {
            x: { type: Number, required: true },
            y: { type: Number, required: true },
          },
          data: {
            type: Schema.Types.Mixed,
            required: true,
          },
        },
      ],
      default: [],
    },
    edges: {
      type: [
        {
          id: { type: String, required: true },
          source: { type: String, required: true },
          target: { type: String, required: true },
          type: {
            type: String,
            required: true,
            enum: Object.values(EdgeType),
          },
          sourceHandle: { type: String },
          targetHandle: { type: String },
          data: {
            type: Schema.Types.Mixed,
            required: true,
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Transform the flow object before sending it to the client
flowSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.userId;
  },
});

export const Flow = mongoose.model<IFlow>("Flow", flowSchema);
