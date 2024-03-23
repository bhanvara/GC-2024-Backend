import express from "express";
import { firestoreDB } from "../config/config";
import { FieldValue } from "firebase-admin/firestore";
export const router = express.Router();
import { v4 as uuidv4 } from "uuid";

router.post("/addCarouselImage", async (req, res) => {
    const imageUrl = req.query.imageUrl as string;
    const title = req.query.title as string;
    const id = uuidv4();

    const docRef = firestoreDB.collection("assets").doc("carousel-images");

    try {
        const doc = await docRef.get();
        if (doc.exists) {
            await docRef.update({
                [id]: {
                    imageUrl,
                    title,
                    timestamp: FieldValue.serverTimestamp(),
                },
            });
        } else {
            await docRef.set({
                [id]: {
                    imageUrl,
                    title,
                    timestamp: FieldValue.serverTimestamp(),
                },
            });
        }
        return res.status(200).json({ message: "Image added successfully" });
    } catch (error) {
        console.error("Error accessing document:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/deleteCarouselImage", async (req, res) => {
    const id = req.query.id as string;
    const docRef = firestoreDB.collection("assets").doc("carousel-images");
  
    try {
      const doc = await docRef.get();
      if (doc.exists) {
        const data = doc.data();
        if (data && data[id]) {
          await docRef.update({
            [id]: FieldValue.delete(),
          });
          return res.status(200).json({ message: "Image deleted successfully" });
        } else {
          return res.status(404).json({ message: "Image not found" });
        }
      } else {
        return res.status(404).json({ message: "No images found" });
      }
    } catch (error) {
      console.error("Error accessing document:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/getCarouselImages", async (req, res) => {
    const docRef = firestoreDB.collection("assets").doc("carousel-images");

    try {
        const doc = await docRef.get();
        if (doc.exists) {
            return res.status(200).json(doc.data());
        } else {
            return res.status(404).json({ message: "No images found" });
        }
    } catch (error) {
        console.error("Error accessing document:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});



export default router;
