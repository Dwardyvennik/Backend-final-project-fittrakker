const {
  CONSULTANTS,
  consultationsCollection,
  parseObjectId,
  findConsultantById,
  buildConsultationDocument
} = require("../models/consultationModel");

const PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/;

function canAccessConsultation(session, consultation) {
  if (!session?.userId) {
    return false;
  }
  if (session.role === "admin") {
    return true;
  }
  return String(consultation.ownerId) === String(session.userId);
}

function getConsultants(req, res) {
  return res.status(200).json({ items: CONSULTANTS });
}

async function createConsultation(req, res) {
  const { consultantId, mode, phone, scheduledAt } = req.body;

  const consultant = findConsultantById(consultantId);
  if (!consultant) {
    return res.status(400).json({ error: "Invalid consultant selected" });
  }

  if (!consultant.modes.includes(mode)) {
    return res.status(400).json({ error: "Selected mode is not available for this consultant" });
  }

  if (!phone || !PHONE_REGEX.test(String(phone))) {
    return res.status(400).json({ error: "Invalid phone number" });
  }

  const scheduledDate = new Date(scheduledAt);
  if (!scheduledAt || Number.isNaN(scheduledDate.getTime())) {
    return res.status(400).json({ error: "Invalid date/time" });
  }

  if (scheduledDate.getTime() <= Date.now()) {
    return res.status(400).json({ error: "Consultation time must be in the future" });
  }

  try {
    const doc = buildConsultationDocument(req.body, req.session);
    const result = await consultationsCollection().insertOne(doc);
    return res.status(201).json({
      message: "Consultation booked successfully",
      insertedId: result.insertedId
    });
  } catch (error) {
    console.error("Create consultation error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}

async function getMyConsultations(req, res) {
  try {
    const filter = {};
    if (req.session.role !== "admin") {
      filter.ownerId = req.session.userId;
    } else if (req.query.scope !== "all") {
      filter.ownerId = req.session.userId;
    }

    const items = await consultationsCollection().find(filter).sort({ scheduledAt: 1 }).toArray();
    return res.status(200).json({ items });
  } catch (error) {
    console.error("List consultations error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}

async function updateConsultationStatus(req, res) {
  try {
    const id = parseObjectId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const action = String(req.body.action || "").toLowerCase();
    const allowed = ["pending", "approved", "completed", "cancelled"];
    if (!allowed.includes(action)) {
      return res.status(400).json({ error: "Invalid status action" });
    }

    const collection = consultationsCollection();
    const consultation = await collection.findOne({ _id: id });
    if (!consultation) {
      return res.status(404).json({ error: "Consultation not found" });
    }

    if (!canAccessConsultation(req.session, consultation)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (req.session.role !== "admin" && action !== "cancelled") {
      return res.status(403).json({ error: "Only admin can set this status" });
    }

    await collection.updateOne(
      { _id: id },
      {
        $set: {
          status: action,
          updatedAt: new Date()
        }
      }
    );

    return res.status(200).json({ message: `Consultation marked as ${action}` });
  } catch (error) {
    console.error("Update consultation status error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}

module.exports = {
  getConsultants,
  createConsultation,
  getMyConsultations,
  updateConsultationStatus
};
