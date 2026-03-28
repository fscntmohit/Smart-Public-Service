require('dotenv').config();
const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');

async function run() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing in environment');
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const result = await Complaint.updateMany(
    {
      status: { $in: ['In Progress', 'Resolved'] },
      firstActionTaken: { $ne: true },
    },
    {
      $set: {
        firstActionTaken: true,
        firstActionAt: new Date(),
      },
    }
  );

  console.log(`Matched: ${result.matchedCount}, Updated: ${result.modifiedCount}`);
  await mongoose.disconnect();
}

run()
  .then(() => {
    console.log('✅ firstAction migration complete');
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('❌ firstAction migration failed:', error.message);
    try {
      await mongoose.disconnect();
    } catch (_) {
      // ignore
    }
    process.exit(1);
  });
