import express from "express";
import { firestoreDB } from "../config/config";
import { FieldValue } from "firebase-admin/firestore";
export const router = express.Router();
import { v4 as uuidv4 } from "uuid";

router.get("/getPointsTableByEvent", async (req, res) => {
    const eventId = req.query.eventId as string;
    const docRef = firestoreDB.collection("events").doc("all_events");

    try {
        const doc = await docRef.get();
        if (doc.exists) {
            const events: any = doc.data();
            if (events && events[eventId] && events[eventId].data.pointsTable) {
                return res.status(200).json({ pointsTable: events[eventId].data.pointsTable });
            } else {
                return res.status(404).json({ message: "Event not found" });
            }
        } else {
            return res.status(404).json({ message: "No events found" });
        }
    } catch (error) {
        console.error("Error accessing document:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});


router.get("/getPointsTableByTeam", async (req, res) => {
    const teamId = req.query.teamId as string;
    const docRef = firestoreDB.collection("events").doc("all_events");

    try {
        const doc = await docRef.get();
        if (doc.exists) {
            const events: any = doc.data();
            const pointsTable: any = {};
            for (const key in events) {
                if (events[key].data.pointsTable && events[key].data.pointsTable[teamId]) {
                    pointsTable[key] = events[key].data.pointsTable[teamId];
                }
            }
            return res.status(200).json({ pointsTable });
        } else {
            return res.status(404).json({ message: "No events found" });
        }
    } catch (error) {
        console.error("Error accessing document:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/getTotalPointsByTeam", async (req, res) => {
    const teamId = req.query.teamId as string;
    const docRef = firestoreDB.collection("events").doc("all_events");

    try {
        const doc = await docRef.get();
        if (doc.exists) {
            const events: any = doc.data();
            let points = 0;
            for (const key in events) {
                if (events[key].data.pointsTable && events[key].data.pointsTable[teamId]) {
                    points += events[key].data.pointsTable[teamId].points;
                }
            }
            return res.status(200).json({ points });
        } else {
            return res.status(404).json({ message: "No events found" });
        }
    } catch (error) {
        console.error("Error accessing document:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});


export default router;
