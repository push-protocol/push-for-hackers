import { model, Schema, Document } from 'mongoose';
import { Submission } from './proofOfHumanityChannel';

const POHSubmission = new Schema<Submission>({
  _id: String,
  submissionTime: {
    type: String,
    required: true,
  },
  creationTime: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  registered: {
    type: Boolean,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
});

// Duplicate the ID field.
POHSubmission.virtual('id').get(function() {
  return this._id;
});

POHSubmission.set('toJSON', {
  virtuals: true,
});
export const SubmissionModel = model<Submission>('POHSubmission', POHSubmission);
