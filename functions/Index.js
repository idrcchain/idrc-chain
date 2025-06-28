
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

exports.verifyDevice = functions.https.onRequest(async (req, res) => {
  const { uid, device_id } = req.body;

  const snapshot = await db.collection("users").doc(uid).get();
  if (!snapshot.exists) return res.status(404).send("User not found");

  const user = snapshot.data();
  if (user.device_id && user.device_id !== device_id) {
    return res.status(403).send("Untrusted device");
  }

  if (!user.device_id) {
    await db.collection("users").doc(uid).update({ device_id });
  }

  res.send("Device verified");
});

exports.startMining = functions.https.onRequest(async (req, res) => {
  const { uid, device_id, duration } = req.body;
  const reward = Math.floor(duration / 10);

  await db.collection("mining_logs").add({
    uid,
    device_id,
    duration,
    reward,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  res.send({ status: "success", reward });
});
