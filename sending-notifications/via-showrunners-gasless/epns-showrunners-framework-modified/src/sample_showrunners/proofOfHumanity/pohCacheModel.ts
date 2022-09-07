import { model, Schema, Document } from 'mongoose';

export interface IPOHSchema {
  removalRequestBlockNo?: number;
  savedChallengeTimestamp?: number;
  savedEvidenceTimestamp?: number;
}
const POHDB = new Schema<IPOHSchema>({
  _id: {
    type: String,
  },
  removalRequestBlockNo: {
    type: Number,
  },
  savedChallengeTimestamp: {
    type: Number,
  },
  savedEvidenceTimestamp: {
    type: Number,
  },
});

export const POHModel = model<IPOHSchema>('POHDB', POHDB);
