import express from "express";
import { firestoreDB } from "../config/config";
import { FieldValue } from "firebase-admin/firestore";
export const router = express.Router();
import { v4 as uuidv4 } from "uuid";

router.post("/addAnnouncement", async (req, res) => {
  try {
    const title = req.query.title;
    const description = req.query.description;

    if (!title || !description) {
      return res.status(400).json({ message: "Please provide title and description" });
    }
    const announcementsDoc = await firestoreDB.collection("announcements").doc("details");

    const id = uuidv4();
    const timestamp = FieldValue.serverTimestamp();
    const data = {
      [id]: {
        title,
        description,
        timestamp,
      },
    };
    await announcementsDoc.set(data, { merge: true });
    return res.status(200).json({ message: "Announcement added successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/getAnnouncements", async (req, res) => {
  try {
    const announcementsDoc = await firestoreDB.collection("announcements").doc("details").get();
    if (!announcementsDoc.exists) {
      return res.status(404).json({ message: "No announcements found" });
    }
    const data = announcementsDoc.data();
    return res.status(200).json(data);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
