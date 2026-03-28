const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { getAuth } = require('@clerk/express');
const { createNotification } = require('../services/notificationService');
const { emitToUser } = require('../services/socketService');

// Extract clean area/zone from full address
const extractArea = (fullAddress) => {
  if (!fullAddress) return '';

  const patterns = [
    /Alpha\s*\d+/i,
    /Beta\s*\d+/i,
    /Gamma\s*\d+/i,
    /Delta\s*\d+/i,
  ];

  for (let pattern of patterns) {
    const match = fullAddress.match(pattern);
    if (match) return match[0].trim();
  }

  // Fallback: use first part before comma
  return fullAddress.split(',')[0].trim();
};

// Normalize string for comparison
const normalize = (str) => str?.trim().toLowerCase() || '';

const statusFlow = {
  Pending: ['In Progress'],
  'In Progress': ['Resolved'],
  Resolved: [],
};

const SLA_HOURS = {
  Low: 36,
  Medium: 24,
  High: 16,
};

const calculateSlaDeadline = (priority, baseDate = new Date()) => {
  const hours = SLA_HOURS[priority] || SLA_HOURS.Medium;
  return new Date(new Date(baseDate).getTime() + hours * 60 * 60 * 1000);
};

const getStatusUpdateMessage = (status) => {
  if (status === 'In Progress') return 'Officer started working on the complaint';
  if (status === 'Resolved') return 'Complaint resolved successfully';
  return `Status updated to ${status}`;
};

const generateComplaintId = () => {
  return `CMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
};

// Create complaint
exports.createComplaint = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { title, description, category, latitude, longitude, area, image, priority } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }

    if (!priority) {
      return res.status(400).json({ error: 'Priority is required' });
    }

    const hasCoordinates = latitude !== null && latitude !== undefined && longitude !== null && longitude !== undefined;
    if (!hasCoordinates && !area) {
      return res.status(400).json({ error: 'Location is required' });
    }

    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'Image is required' });
    }

    const finalCategory = category;
    const finalPriority = ['Low', 'Medium', 'High'].includes(priority) ? priority : null;

    if (!finalPriority) {
      return res.status(400).json({ error: 'Invalid priority value' });
    }

    const slaDeadline = calculateSlaDeadline(finalPriority);

    // Extract and normalize area
    const cleanArea = extractArea(area);
    const normalizedArea = normalize(cleanArea);
    const normalizedCategory = normalize(finalCategory);

    // Debug logs
    console.log("------ DEBUG START ------");
    console.log("FULL ADDRESS:", area);
    console.log("EXTRACTED AREA:", cleanArea);
    console.log("NORMALIZED AREA:", normalizedArea);
    console.log("CATEGORY:", finalCategory);
    console.log("NORMALIZED CATEGORY:", normalizedCategory);

    const allOfficers = await User.find({ role: 'officer' });
    console.log("ALL OFFICERS:", allOfficers.map(o => ({ name: o.name, department: o.department, area: o.area, clerkId: o.clerkId })));

    // Case-insensitive, whitespace-safe officer matching
    const officer = await User.findOne({
      role: 'officer',
      department: { $regex: `^${normalizedCategory}$`, $options: 'i' },
      area: { $regex: `^${normalizedArea}$`, $options: 'i' },
    });

    console.log("MATCHED OFFICER:", officer);

    let assignedOfficer = null;
    if (officer) {
      assignedOfficer = officer.clerkId;
      console.log("ASSIGNED TO:", assignedOfficer);
    } else {
      console.log("NO OFFICER MATCH FOUND");
    }
    console.log("------ DEBUG END ------");

    let complaintId;
    let attempts = 0;

    while (attempts < 10) {
      const candidateId = generateComplaintId();
      const existing = await Complaint.findOne({ complaintId: candidateId }).select('_id');
      if (!existing) {
        complaintId = candidateId;
        break;
      }
      attempts += 1;
    }

    if (!complaintId) {
      return res.status(500).json({ error: 'Failed to generate complaint ID' });
    }

    const updates = [
      {
        message: 'Complaint submitted',
        status: 'Pending',
        by: 'citizen',
        timestamp: new Date(),
      },
    ];

    if (assignedOfficer) {
      updates.push({
        message: 'Assigned to officer',
        status: 'Pending',
        by: 'system',
        timestamp: new Date(),
      });
    }

    const complaint = await Complaint.create({
      complaintId,
      title,
      description: description || '',
      category: finalCategory,
      department: finalCategory,
      priority: finalPriority,
      latitude: latitude || null,
      longitude: longitude || null,
      area: cleanArea,
      fullAddress: area || '',
      image,
      createdBy: userId,
      userId,
      assignedOfficer,
      slaDeadline,
      updates,
      history: [
        {
          status: 'Pending',
          updatedAt: new Date(),
          updatedBy: userId,
        },
      ],
    });

    if (assignedOfficer) {
      const message = 'New complaint assigned to you';
      await createNotification({
        userId: assignedOfficer,
        message,
        type: 'NEW_COMPLAINT',
        meta: { complaintId: complaint.complaintId, complaintDbId: complaint._id.toString() },
      });

      emitToUser(assignedOfficer, 'complaint:created', {
        complaintId: complaint.complaintId,
        complaintDbId: complaint._id.toString(),
        title: complaint.title,
        priority: complaint.priority,
        category: complaint.category,
      });
    }

    res.status(201).json({
      success: true,
      complaintId: complaint.complaintId,
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ error: 'Failed to create complaint' });
  }
};

// Public tracking by complaintId (no auth required)
exports.trackComplaintByPublicId = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const complaint = await Complaint.findOne({ complaintId });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    return res.json({
      complaintId: complaint.complaintId,
      title: complaint.title,
      description: complaint.description,
      category: complaint.category,
      status: complaint.status,
      priority: complaint.priority,
      area: complaint.area,
      createdAt: complaint.createdAt,
      resolvedAt: complaint.resolvedAt,
      proofImage: complaint.proofImage,
      proofVideo: complaint.proofVideo,
    });
  } catch (error) {
    console.error('Track complaint error:', error);
    return res.status(500).json({ error: 'Failed to track complaint' });
  }
};

// Get all complaints (admin)
exports.getAllComplaints = async (req, res) => {
  try {
    const { status, category, priority, area } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (area) filter.area = area;

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
};

// Get user's complaints (citizen)
exports.getMyComplaints = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const complaints = await Complaint.find({
      $or: [{ createdBy: userId }, { userId }],
    }).sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    console.error('Get my complaints error:', error);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
};

// Get officer's assigned complaints
exports.getOfficerComplaints = async (req, res) => {
  try {
    const clerkId = getAuth(req).userId;
    console.log("Logged in Clerk ID:", clerkId);

    const { status, priority } = req.query;
    const filter = { assignedOfficer: clerkId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
    
    console.log("Assigned complaints:", complaints.length);
    res.json(complaints);
  } catch (error) {
    console.error('Get officer complaints error:', error);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
};

// Get single complaint
exports.getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    res.json(complaint);
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({ error: 'Failed to fetch complaint' });
  }
};

// Update complaint status (officer)
exports.updateStatus = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { status, proofImage, proofVideo, remarks } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (req.userRole === 'officer' && complaint.assignedOfficer !== userId) {
      return res.status(403).json({ message: 'You can only update complaints assigned to you' });
    }

    const currentStatus = complaint.status;
    const newStatus = status;

    // Lock updates after resolution
    if (currentStatus === 'Resolved') {
      return res.status(400).json({
        message: 'This complaint is closed and cannot be updated',
      });
    }

    if (!newStatus) {
      return res.status(400).json({
        message: 'Status is required',
      });
    }

    if (!statusFlow[currentStatus]?.includes(newStatus)) {
      return res.status(400).json({
        message: `Invalid transition from ${currentStatus} to ${newStatus}`,
      });
    }

    const isActionableStatus = newStatus === 'In Progress' || newStatus === 'Resolved';

    if (isActionableStatus && !complaint.firstActionTaken) {
      complaint.firstActionTaken = true;
      complaint.firstActionAt = new Date();
    }

    if (!complaint.createdBy && complaint.userId) {
      complaint.createdBy = complaint.userId;
    }

    if (!complaint.slaDeadline) {
      complaint.slaDeadline = calculateSlaDeadline(complaint.priority, complaint.createdAt || new Date());
    }

    // Keep existing proof rules for resolve transition
    const effectiveProofImage = proofImage || complaint.proofImage;
    if (newStatus === 'Resolved' && !effectiveProofImage) {
      return res.status(400).json({
        message: 'Photo proof is mandatory when resolving complaint',
      });
    }

    complaint.status = newStatus;

    if (proofImage) complaint.proofImage = proofImage;
    if (proofVideo) complaint.proofVideo = proofVideo;
    if (typeof remarks === 'string') complaint.remarks = remarks;

    if (newStatus === 'Resolved' && !complaint.resolvedAt) {
      complaint.resolvedAt = new Date();
    }

    if (!Array.isArray(complaint.history)) {
      complaint.history = [];
    }

    if (!Array.isArray(complaint.updates)) {
      complaint.updates = [];
    }

    if (complaint.updates.length === 0) {
      complaint.updates.push({
        message: 'Complaint submitted',
        status: 'Pending',
        by: 'citizen',
        timestamp: complaint.createdAt || new Date(),
      });
    }

    complaint.history.push({
      status: newStatus,
      updatedAt: new Date(),
      updatedBy: userId || null,
    });

    complaint.updates.push({
      message: getStatusUpdateMessage(newStatus),
      status: newStatus,
      by: 'officer',
      timestamp: new Date(),
    });

    await complaint.save();

    const citizenId = complaint.createdBy || complaint.userId;
    if (citizenId) {
      const message = 'Your complaint status has been updated';
      await createNotification({
        userId: citizenId,
        message,
        type: 'UPDATE',
        meta: {
          complaintId: complaint.complaintId,
          complaintDbId: complaint._id.toString(),
          status: complaint.status,
        },
      });

      emitToUser(citizenId, 'complaint:updated', {
        complaintId: complaint.complaintId,
        complaintDbId: complaint._id.toString(),
        status: complaint.status,
        resolvedAt: complaint.resolvedAt,
      });
    }

    return res.json({ success: true, complaint });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update complaint' });
  }
};

exports.getBreachedComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ isEscalated: true })
      .sort({ updatedAt: -1 })
      .limit(100);

    return res.json(complaints);
  } catch (error) {
    console.error('Get breached complaints error:', error);
    return res.status(500).json({ error: 'Failed to fetch breached complaints' });
  }
};

// Assign/reassign officer (admin)
exports.assignOfficer = async (req, res) => {
  try {
    const { officerId } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    complaint.assignedOfficer = officerId;

    if (!Array.isArray(complaint.updates)) {
      complaint.updates = [];
    }

    complaint.updates.push({
      message: 'Assigned to officer',
      status: complaint.status || 'Pending',
      by: 'system',
      timestamp: new Date(),
    });

    await complaint.save();

    res.json(complaint);
  } catch (error) {
    console.error('Assign officer error:', error);
    res.status(500).json({ error: 'Failed to assign officer' });
  }
};
