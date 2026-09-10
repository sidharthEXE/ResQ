import mongoose from 'mongoose';

const bloodDonorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  approximateLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  availability: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Create a geospatial index for approximateLocation to allow efficient spatial queries ($near)
bloodDonorSchema.index({ approximateLocation: '2dsphere' });

const BloodDonor = mongoose.model('BloodDonor', bloodDonorSchema);
export default BloodDonor;
