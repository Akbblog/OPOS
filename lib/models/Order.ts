import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  tokenNumber: { type: Number, required: true },
  category: { type: String, required: true, enum: ['bike', 'car'] },
  amount: { type: Number, required: true },
  customerEmail: { type: String, default: '' },
  vehicleNo: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
});

// Index for quick token lookup
OrderSchema.index({ tokenNumber: -1 });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);