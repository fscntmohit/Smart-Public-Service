const Complaint = require('../models/Complaint');

// Dashboard stats
exports.getStats = async (req, res) => {
  try {
    const [total, pending, inProgress, resolved, highPriority] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'Pending' }),
      Complaint.countDocuments({ status: 'In Progress' }),
      Complaint.countDocuments({ status: 'Resolved' }),
      Complaint.countDocuments({ priority: 'High' }),
    ]);

    res.json({ total, pending, inProgress, resolved, highPriority });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

// Category distribution
exports.getCategoryDistribution = async (req, res) => {
  try {
    const distribution = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json(distribution.map(d => ({ category: d._id, count: d.count })));
  } catch (error) {
    console.error('Category distribution error:', error);
    res.status(500).json({ error: 'Failed to fetch distribution' });
  }
};

// Monthly trends
exports.getMonthlyTrends = async (req, res) => {
  try {
    const trends = await Complaint.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          total: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    res.json(trends.map(t => ({
      month: `${months[t._id.month - 1]} ${t._id.year}`,
      total: t.total,
      resolved: t.resolved,
    })));
  } catch (error) {
    console.error('Trends error:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
};

// Area-wise distribution
exports.getAreaDistribution = async (req, res) => {
  try {
    const distribution = await Complaint.aggregate([
      { $match: { area: { $ne: '' } } },
      { $group: { _id: '$area', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json(distribution.map(d => ({ area: d._id, count: d.count })));
  } catch (error) {
    console.error('Area distribution error:', error);
    res.status(500).json({ error: 'Failed to fetch area distribution' });
  }
};

// Heatmap data (complaints with lat/lng)
exports.getHeatmapData = async (req, res) => {
  try {
    const complaints = await Complaint.find(
      { latitude: { $ne: null }, longitude: { $ne: null } },
      'latitude longitude category priority status area title'
    );

    res.json(complaints);
  } catch (error) {
    console.error('Heatmap error:', error);
    res.status(500).json({ error: 'Failed to fetch heatmap data' });
  }
};

// Officer performance
exports.getOfficerPerformance = async (req, res) => {
  try {
    const performance = await Complaint.aggregate([
      {
        $match: {
          status: "Resolved",
          assignedOfficer: { $ne: null }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "assignedOfficer",
          foreignField: "clerkId",
          as: "officer"
        }
      },
      {
        $unwind: "$officer"
      },
      {
        $group: {
          _id: "$assignedOfficer",
          officerName: { $first: "$officer.name" },
          department: { $first: "$department" },
          totalResolved: { $sum: 1 }
        }
      },
      {
        $sort: { totalResolved: -1 }
      }
    ]);

    console.log("Officer Performance Data:", performance);

    if (!performance.length) {
      console.log("No resolved complaints found");
    }

    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    console.error('Performance error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch performance' });
  }
};
