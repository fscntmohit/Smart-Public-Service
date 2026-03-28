const cron = require('node-cron');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');
const { emitToUser } = require('../services/socketService');

const startSlaEscalationJob = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date();
      const breachedComplaints = await Complaint.find({
        status: 'Pending',
        firstActionTaken: false,
        slaDeadline: { $lt: now },
        isEscalated: { $ne: true },
      }).select('_id complaintId assignedOfficer');

      if (!breachedComplaints.length) return;

      const adminUsers = await User.find({ role: 'admin' }).select('clerkId');
      const adminIds = adminUsers.map((admin) => admin.clerkId).filter(Boolean);

      for (const complaint of breachedComplaints) {
        await Complaint.updateOne(
          { _id: complaint._id },
          { $set: { isEscalated: true } }
        );

        const message = `Complaint ${complaint.complaintId} has exceeded SLA. Assigned officer has not taken any action. Immediate attention required.`;

        for (const adminId of adminIds) {
          await createNotification({
            userId: adminId,
            message,
            type: 'SLA_BREACH',
            meta: { complaintId: complaint.complaintId, complaintDbId: complaint._id.toString() },
          });

          emitToUser(adminId, 'complaint:sla-breach', {
            complaintId: complaint.complaintId,
            complaintDbId: complaint._id.toString(),
            assignedOfficer: complaint.assignedOfficer,
            breachedAt: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error('SLA escalation job error:', error);
    }
  });
};

module.exports = {
  startSlaEscalationJob,
};
