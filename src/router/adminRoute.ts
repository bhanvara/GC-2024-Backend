import express from "express";
import { firestoreDB } from "../config/config";
import { FieldValue } from "firebase-admin/firestore";
export const router = express.Router();

router.get("/isAdmin/:email", async (req, res) => {
  try {
    const email = req.params.email;
    if (!email) {
      return res.status(400).json({ message: "Please provide email" });
    }
    const adminCollection = await firestoreDB.collection("admin");
    const adminDoc = await adminCollection.doc("allowedEmails").get();
    if (!adminDoc.exists) {
      return res.status(404).json({ message: "No admins found" });
    }
    const adminData: any = adminDoc.data()?.emails;
    if (adminData.includes(email)) {
      return res.status(200).json({ isAdmin: true });
    }
    return res.status(200).json({ isAdmin: false });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/addAdmin", async (req, res) => {
  try {
    const email = req.body.email;
    if (!email) {
      return res.status(400).json({ message: "Please provide email" });
    }
    const adminCollection = await firestoreDB.collection("admin");
    const adminDoc = await adminCollection.doc("allowedEmails").get();
    if (!adminDoc.exists) {
      return res.status(404).json({ message: "No admins found" });
    }
    const adminData: any = adminDoc.data()?.emails;
    if (adminData.includes(email)) {
      return res.status(200).json({ message: "Email already exists" });
    }
    adminData.push(email);
    await adminCollection.doc("allowedEmails").update({
      emails: adminData,
      lastUpdated: FieldValue.serverTimestamp(),
    });
    return res.status(200).json({ message: "Admin added successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
