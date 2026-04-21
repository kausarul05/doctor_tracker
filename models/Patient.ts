import mongoose, { Schema, Document, Model } from 'mongoose';

export type PatientCondition = 'Critical' | 'Stable' | 'Recovering' | 'Discharged' | 'Under Observation';

export interface IPatient extends Document {
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  condition: PatientCondition;
  diagnosis: string;
  phone: string;
  email: string;
  address: string;
  doctorId: mongoose.Types.ObjectId;
  admittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema = new Schema<IPatient>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      index: true,
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: 0,
      max: 150,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Gender is required'],
    },
    condition: {
      type: String,
      enum: ['Critical', 'Stable', 'Recovering', 'Discharged', 'Under Observation'],
      required: [true, 'Condition is required'],
      index: true,
    },
    diagnosis: {
      type: String,
      required: [true, 'Diagnosis is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor is required'],
      index: true,
    },
    admittedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index
PatientSchema.index({ name: 'text', diagnosis: 'text' });
PatientSchema.index({ doctorId: 1, condition: 1 });
PatientSchema.index({ admittedAt: -1 });

const Patient: Model<IPatient> =
  mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema);

export default Patient;
