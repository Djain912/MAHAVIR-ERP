/**
 * Counter Sale Model
 * Track on-the-spot cash sales to wholesalers
 */

import mongoose from 'mongoose';

const counterSaleItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  ratePerUnit: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  }
});

const counterSaleSchema = new mongoose.Schema({
  // Sale date
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // Counter sale number (auto-generated)
  saleNumber: {
    type: String,
    unique: true,
    required: true
  },
  
  // Customer type
  customerType: {
    type: String,
    enum: ['Wholesaler', 'Retailer', 'Walk-in', 'Other'],
    default: 'Walk-in'
  },
  
  // Customer reference (if registered)
  wholesalerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wholesaler'
  },
  
  retailerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Retailer'
  },
  
  // Customer name (for walk-in customers)
  customerName: {
    type: String,
    trim: true
  },
  
  // Customer phone
  customerPhone: {
    type: String,
    trim: true
  },
  
  // Items sold
  items: [counterSaleItemSchema],
  
  // Total amount
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Discount
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Final amount after discount
  finalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Cash denominations received
  cashReceived: {
    note2000: { type: Number, default: 0 },
    note500: { type: Number, default: 0 },
    note200: { type: Number, default: 0 },
    note100: { type: Number, default: 0 },
    note50: { type: Number, default: 0 },
    note20: { type: Number, default: 0 },
    note10: { type: Number, default: 0 },
    coin10: { type: Number, default: 0 },
    coin5: { type: Number, default: 0 },
    coin2: { type: Number, default: 0 },
    coin1: { type: Number, default: 0 }
  },
  
  // Total cash received
  totalCashReceived: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Change returned
  changeReturned: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Payment mode
  paymentMode: {
    type: String,
    enum: ['Cash', 'UPI', 'Card', 'Mixed'],
    default: 'Cash'
  },
  
  // UPI/Digital payment details
  digitalPayment: {
    amount: { type: Number, default: 0 },
    transactionId: { type: String, trim: true },
    mode: { type: String, enum: ['UPI', 'Card', 'NEFT'], trim: true }
  },
  
  // Recorded by
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  
  // Remarks
  remarks: {
    type: String,
    trim: true
  },
  
  // Bill printed
  billPrinted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
counterSaleSchema.index({ date: 1 });
counterSaleSchema.index({ saleNumber: 1 }, { unique: true });
counterSaleSchema.index({ customerType: 1, date: -1 });

// Pre-save to calculate totals
counterSaleSchema.pre('save', function(next) {
  // Calculate total amount from items
  this.totalAmount = this.items.reduce((sum, item) => sum + item.totalAmount, 0);
  
  // Calculate final amount after discount
  this.finalAmount = this.totalAmount - this.discount;
  
  // Calculate total cash received from denominations
  const c = this.cashReceived;
  const cashTotal = (
    (c.note2000 * 2000) +
    (c.note500 * 500) +
    (c.note200 * 200) +
    (c.note100 * 100) +
    (c.note50 * 50) +
    (c.note20 * 20) +
    (c.note10 * 10) +
    (c.coin10 * 10) +
    (c.coin5 * 5) +
    (c.coin2 * 2) +
    (c.coin1 * 1)
  );
  
  // Add digital payment if mixed
  this.totalCashReceived = cashTotal + (this.digitalPayment?.amount || 0);
  
  // Calculate change
  this.changeReturned = Math.max(0, this.totalCashReceived - this.finalAmount);
  
  next();
});

// Static method to generate sale number
counterSaleSchema.statics.generateSaleNumber = async function() {
  const today = new Date();
  const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  const lastSale = await this.findOne({
    saleNumber: new RegExp(`^CS${datePrefix}`)
  }).sort({ saleNumber: -1 });
  
  let sequence = 1;
  if (lastSale) {
    const lastSequence = parseInt(lastSale.saleNumber.slice(-4));
    sequence = lastSequence + 1;
  }
  
  return `CS${datePrefix}${sequence.toString().padStart(4, '0')}`;
};

// Static method to get daily summary
counterSaleSchema.statics.getDailySummary = async function(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const sales = await this.find({
    date: { $gte: startOfDay, $lte: endOfDay }
  });
  
  const summary = {
    totalSales: sales.length,
    totalAmount: sales.reduce((sum, sale) => sum + sale.finalAmount, 0),
    cashSales: sales.filter(s => s.paymentMode === 'Cash').length,
    upiSales: sales.filter(s => s.paymentMode === 'UPI').length,
    cardSales: sales.filter(s => s.paymentMode === 'Card').length,
    mixedSales: sales.filter(s => s.paymentMode === 'Mixed').length
  };
  
  return { sales, summary };
};

const CounterSale = mongoose.model('CounterSale', counterSaleSchema);

export default CounterSale;
