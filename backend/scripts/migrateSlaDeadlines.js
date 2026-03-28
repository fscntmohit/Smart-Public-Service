require('dotenv').config();
const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');

const SLA_MAP = {
  Low: 36,
  Medium: 24,
  High: 16,
};

const computeDeadline = (priority, createdAt) => {
  const hours = SLA_MAP[priority] || SLA_MAP.Medium;
  return new Date(new Date(createdAt).getTime() + hours * 60 * 60 * 1000);
};

async function run() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing in environment');
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const cursor = Complaint.find({
    $or: [
      { slaDeadline: { $exists: false } },
      { slaDeadline: null },
    ],
    priority: { $in: ['Low', 'Medium', 'High'] },
    createdAt: { $ne: null },
  }).cursor();

  let scanned = 0;
  let updated = 0;

  for await (const complaint of cursor) {
    scanned += 1;
    const deadline = computeDeadline(complaint.priority, complaint.createdAt);

    await Complaint.updateOne(
      { _id: complaint._id },
      { $set: { slaDeadline: deadline } }
    );

    updated += 1;
  }

  console.log(`Scanned: ${scanned}, Updated: ${updated}`);
  await mongoose.disconnect();
}

run()
  .then(() => {
    console.log('✅ SLA migration complete');
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('❌ SLA migration failed:', error.message);
    try {
      await mongoose.disconnect();
    } catch (_) {
      // ignore
    }
    process.exit(1);
  });
