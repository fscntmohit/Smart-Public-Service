const PDFDocument = require('pdfkit');
const { getAuth } = require('@clerk/express');
const Complaint = require('../models/Complaint');
const User = require('../models/User');

const getStartDate = (type) => {
  const now = new Date();
  const startDate = new Date(now);

  if (type === 'weekly') {
    startDate.setDate(now.getDate() - 7);
    return startDate;
  }

  if (type === 'monthly') {
    startDate.setMonth(now.getMonth() - 1);
    return startDate;
  }

  return null;
};

const countByField = (items, field, whitelist = []) => {
  const base = whitelist.reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {});

  return items.reduce((acc, item) => {
    const key = item?.[field] || 'Unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, base);
};

exports.generateReport = async (req, res) => {
  try {
    const { type = 'weekly' } = req.query;
    if (!['weekly', 'monthly'].includes(type)) {
      return res.status(400).json({ error: 'Invalid report type. Use weekly or monthly.' });
    }

    const startDate = getStartDate(type);
    const { userId: clerkId, sessionClaims } = getAuth(req);

    const claimRole =
      sessionClaims?.metadata?.role ||
      sessionClaims?.publicMetadata?.role ||
      sessionClaims?.unsafeMetadata?.role ||
      null;

    let role = req.userRole || claimRole;

    if (!role && clerkId) {
      const userDoc = await User.findOne({ clerkId }).select('role');
      role = userDoc?.role || null;
    }

    if (!['admin', 'officer'].includes(role)) {
      return res.status(403).json({ error: 'Forbidden: Reports are only available for admin/officer roles' });
    }

    const query = {
      createdAt: { $gte: startDate },
    };

    if (role === 'officer') {
      query.assignedOfficer = clerkId;
    }

    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 })
      .select('complaintId title status priority category area createdAt resolvedAt assignedOfficer');

    const statusCounts = countByField(complaints, 'status', ['Pending', 'In Progress', 'Resolved']);
    const priorityCounts = countByField(complaints, 'priority', ['High', 'Medium', 'Low']);
    const categoryCounts = countByField(complaints, 'category');

    const total = complaints.length;
    const resolved = statusCounts.Resolved || 0;
    const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : '0.0';

    const filename = `${type}-report-${new Date().toISOString().slice(0, 10)}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    doc.pipe(res);

    doc.fontSize(20).text('PS-CRM Complaint Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor('#374151').text(`Report Type: ${type.toUpperCase()}`);
    doc.text(`Generated: ${new Date().toLocaleString()}`);
    doc.text(`Role Scope: ${role === 'admin' ? 'All complaints' : 'Assigned officer complaints'}`);
    doc.text(`Window Start: ${startDate.toLocaleString()}`);
    doc.moveDown();

    doc.fontSize(14).fillColor('#111827').text('Analytics Summary');
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor('#374151');
    doc.text(`Total Complaints: ${total}`);
    doc.text(`Resolved: ${statusCounts.Resolved || 0}`);
    doc.text(`In Progress: ${statusCounts['In Progress'] || 0}`);
    doc.text(`Pending: ${statusCounts.Pending || 0}`);
    doc.text(`Resolution Rate: ${resolutionRate}%`);
    doc.moveDown();

    doc.fontSize(12).fillColor('#111827').text('Priority Breakdown');
    doc.fontSize(11).fillColor('#374151');
    doc.text(`High: ${priorityCounts.High || 0}`);
    doc.text(`Medium: ${priorityCounts.Medium || 0}`);
    doc.text(`Low: ${priorityCounts.Low || 0}`);
    doc.moveDown();

    doc.fontSize(12).fillColor('#111827').text('Category Breakdown');
    doc.fontSize(11).fillColor('#374151');
    const categoryEntries = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
    if (categoryEntries.length === 0) {
      doc.text('No category data available.');
    } else {
      categoryEntries.forEach(([category, count]) => {
        doc.text(`${category}: ${count}`);
      });
    }
    doc.moveDown();

    doc.fontSize(14).fillColor('#111827').text('Complaint Details');
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#374151');

    if (complaints.length === 0) {
      doc.text('No complaints found for this reporting period.');
    } else {
      complaints.forEach((complaint, idx) => {
        doc.text(
          `${idx + 1}. ${complaint.complaintId || 'N/A'} | ${complaint.title} | ${complaint.status} | ${complaint.priority} | ${complaint.area || 'N/A'} | ${new Date(complaint.createdAt).toLocaleDateString()}`,
          { lineGap: 2 }
        );
      });
    }

    doc.end();
  } catch (error) {
    console.error('Generate report error:', error);
    return res.status(500).json({ error: 'Failed to generate report' });
  }
};
