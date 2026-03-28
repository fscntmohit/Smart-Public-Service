const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    enum: ['Waste', 'Electricity', 'Water', 'Road', 'Other'],
    default: 'Other',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved'],
    default: 'Pending',
  },
  latitude: {
    type: Number,
    default: null,
  },
  longitude: {
    type: Number,
    default: null,
  },
  area: {
    type: String,
    default: '',
  },
  fullAddress: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
  assignedOfficer: {
    type: String,
    default: null,
  },
  createdBy: {
    type: String,
    required: true,
    index: true,
  },
  department: {
    type: String,
    default: '',
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  proofImage: {
    type: String,
    default: '',
  },
  proofVideo: {
    type: String,
    default: '',
  },
  remarks: {
    type: String,
    default: '',
  },
  resolvedAt: {
    type: Date,
    default: null,
  },
  slaDeadline: {
    type: Date,
    required: true,
  },
  firstActionTaken: {
    type: Boolean,
    default: false,
  },
  firstActionAt: {
    type: Date,
    default: null,
  },
  isEscalated: {
    type: Boolean,
    default: false,
  },
  updates: [
    {
      message: {
        type: String,
        default: '',
      },
      status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Resolved'],
        default: 'Pending',
      },
      by: {
        type: String,
        enum: ['citizen', 'officer', 'system'],
        default: 'system',
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  history: [
    {
      status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Resolved'],
        required: true,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
      updatedBy: {
        type: String,
        default: null,
      },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
