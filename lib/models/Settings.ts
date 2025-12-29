import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  bikePrices: { type: [Number], default: [100, 150, 200] },
  carPrices: { type: [Number], default: [100, 150, 200] },
  currentTokenNumber: { type: Number, default: 0 },
});

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);