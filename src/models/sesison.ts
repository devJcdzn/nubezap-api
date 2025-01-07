import mongoose, { Schema, Document } from "mongoose";

interface ISession extends Document {
  sessionId: string;
  key: string;
  data: any;
}

const SessionSchema = new Schema<ISession>({
  sessionId: { type: String, required: true },
  key: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
});

export const Session = mongoose.model<ISession>("Session", SessionSchema);
