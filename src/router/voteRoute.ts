import express from "express";
import { firestoreDB } from "../config/config";
import { FieldValue } from "firebase-admin/firestore";
export const router = express.Router();

router.post("/registerVote", async (req, res) => {
  try {
    const dept = req.body.dept;
    const email = req.body.email;
    const vote = req.body.vote;

    if (!email || !dept || !vote) {
      return res.status(400).json({ message: "Invalid Request" });
    }

    const votingDocRef = firestoreDB.collection("voting").doc("voted");
    const votingDoc = await votingDocRef.get();
    if (!votingDoc.exists) {
      await votingDocRef.set({});
    }
    const votingData = votingDoc.data();

    const hasVoted = votingData?.hasVoted ?? {};
    console.log(hasVoted);
    if (hasVoted?.[email]) {
      return res.status(400).json({ message: "Already Voted" });
    }
    const docRef = firestoreDB.collection("voting").doc(dept);
    const doc = await docRef.get();
    if (!doc.exists) {
      await docRef.set({});
    }
    const data = {
      dept: dept,
      time: new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      }),
    };

    await firestoreDB
      .collection("voting")
      .doc("voted")
      .set(
        {
          hasVoted: {
            [email]: data,
          },
        },
        { merge: true }
      );

    await firestoreDB
      .collection("voting")
      .doc(dept)
      .update({
        [vote]: FieldValue.increment(1),
      });

    return res.status(200).json({ message: "Voted Registered Successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
