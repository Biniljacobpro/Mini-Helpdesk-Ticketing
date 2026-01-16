import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    minlength: [5, 'Title must be at least 5 characters'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [15, 'Description must be at least 15 characters'],
    trim: true
  },
  priority: {
    type: String,
    required: [true, 'Priority is required'],
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  status: {
    type: String,
    required: true,
    enum: ['Open', 'Closed'],
    default: 'Open'
  },
  category: {
    type: String,
    enum: ['Bug', 'Feature', 'Support', 'Other'],
    default: 'Other'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
ticketSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Ticket', ticketSchema);
