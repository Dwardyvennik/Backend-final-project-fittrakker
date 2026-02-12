const { getDB } = require("../database/mongo");

function usersCollection() {
  return getDB().collection("users");
}

async function findByUsername(username) {
  return usersCollection().findOne({ username });
}

async function countUsers() {
  return usersCollection().countDocuments();
}

async function createUser(user) {
  return usersCollection().insertOne(user);
}

async function listUsers() {
  return usersCollection()
    .find({}, { projection: { password: 0 } })
    .sort({ username: 1 })
    .toArray();
}

module.exports = {
  findByUsername,
  countUsers,
  createUser,
  listUsers
};
