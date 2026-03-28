require('dotenv').config();
const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');

const statusMessage = (status) => {
  if (status === 'In Progress') return 'Officer started working on the complaint';
  if (status === 'Resolved') return 'Complaint resolved successfully';
  return `Status updated to ${status}`;
};

async function run() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing in environment');
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const cursor = Complaint.find().cursor();
  let scanned = 0;
  let updated = 0;

  for await (const complaint of cursor) {
    scanned += 1;

    if (Array.isArray(complaint.updates) && complaint.updates.length > 0) {
      continue;
    }

    const nextUpdates = [
      {
        message: 'Complaint submitted',
        status: 'Pending',
        by: 'citizen',
        timestamp: complaint.createdAt || new Date(),
      },
    ];

    if (complaint.assignedOfficer) {
      nextUpdates.push({
        message: 'Assigned to officer',
        status: 'Pending',
        by: 'system',
        timestamp: complaint.createdAt || new Date(),
      });
    }

    if (complaint.status === 'In Progress' || complaint.status === 'Resolved') {
      nextUpdates.push({
        message: statusMessage(complaint.status),
        status: complaint.status,
        by: 'officer',
        timestamp: complaint.resolvedAt || complaint.updatedAt || new Date(),
      });
    }

    await Complaint.updateOne(
      { _id: complaint._id },
      { $set: { updates: nextUpdates } }
    );

    updated += 1;
  }

  console.log(`Scanned: ${scanned}, Updated: ${updated}`);
  await mongoose.disconnect();
}

run()
  .then(() => {
    console.log('✅ complaint updates migration complete');
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('❌ complaint updates migration failed:', error.message);
    try {
      await mongoose.disconnect();
    } catch (_) {
      // ignore
    }
    process.exit(1);
  });
