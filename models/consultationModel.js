const { ObjectId } = require("mongodb");
const { getDB } = require("../database/mongo");

const CONSULTANTS = [
  {
    id: "trainer_almas",
    name: "Almasuly Damir",
    role: "Trainer",
    specialty: "Strength and Body Recomposition",
    modes: ["online", "offline"]
  },
  {
    id: "trainer_amir",
    name: "Amir Berdibek",
    role: "Trainer",
    specialty: "Cardio and Endurance",
    modes: ["online", "offline"]
  },
  {
    id: "consultant_zarina",
    name: "Qosaman Zarina",
    role: "Online Consultant",
    specialty: "Nutrition and Recovery",
    modes: ["online"]
  },
  {
    id: "consultant_alikhan",
    name: "Alikhan Korazbay",
    role: "Online Consultant",
    specialty: "Mobility and Technique",
    modes: ["online"]
  },
  {
    id: "trainer_ali",
    name: "Sharshiken Ali",
    role: "Trainer",
    specialty: "Functional Fitness",
    modes: ["online", "offline"]
  }
];

function consultationsCollection() {
  return getDB().collection("consultations");
}

function parseObjectId(id) {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  return new ObjectId(id);
}

function findConsultantById(consultantId) {
  return CONSULTANTS.find((item) => item.id === consultantId) || null;
}

function buildConsultationDocument(body, session) {
  const consultant = findConsultantById(body.consultantId);
  return {
    ownerId: session.userId,
    ownerUsername: session.username,
    consultantId: consultant.id,
    consultantName: consultant.name,
    consultantRole: consultant.role,
    specialty: consultant.specialty,
    mode: body.mode,
    phone: body.phone,
    scheduledAt: new Date(body.scheduledAt),
    notes: body.notes || "",
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

module.exports = {
  CONSULTANTS,
  consultationsCollection,
  parseObjectId,
  findConsultantById,
  buildConsultationDocument
};
