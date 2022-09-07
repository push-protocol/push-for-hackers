/* eslint-disable prettier/prettier */
import { model, Document, Schema } from 'mongoose';

export interface DigibleData {
  latestBlockForDigiTrackEvent?: number;
  latestBlockForOfferRecieved?: number;
  latestBlockForOfferAccepted?: number;
  latestBlockForOfferCancelled?: number;
}

const digibleSchema = new Schema<DigibleData>({
  _id: {
    type: String,
  },
  latestBlockForDigiTrackEvent: {
    type: Number,
  },
  latestBlockForOfferRecieved: {
    type: Number,
  },
  latestBlockForOfferAccepted: {
    type: Number,
  },
  latestBlockForOfferCancelled: {
    type: Number,
  },
});

export const digibleModel = model<DigibleData>('digibleDB', digibleSchema);
