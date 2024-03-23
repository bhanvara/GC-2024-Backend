import express from "express";
import { firestoreDB } from "../config/config";
import { FieldValue } from "firebase-admin/firestore";
export const router = express.Router();
import { v4 as uuidv4 } from "uuid";
import { isAdmin } from "../controller/admincontroller";

router.get("/getAllEventById", async (req, res) => {
  try {
    const eventId: string = req.query.eventId as string;
    if (eventId === undefined) {
      return res.status(400).json({ message: "Please provide eventId" });
    }
    const eventsCollection = firestoreDB.collection("events").doc("all_events");
    const eventsDoc = await eventsCollection.get();
    if (!eventsDoc.exists) {
      return res.status(404).json({ message: "No events found" });
    }
    const eventsData: any = eventsDoc.data();
    if (!eventsData[eventId]) {
      return res.status(404).json({ message: "Event not found" });
    }
    delete eventsData[eventId].updatedBy;
    return res.status(200).json({ event: eventsData[eventId] });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});
router.get("/getAllEvents", async (req, res) => {
  try {
    const eventsCollection = await firestoreDB
      .collection("events")
      .doc("all_events");
    const eventsDoc = await eventsCollection.get();
    if (!eventsDoc.exists) {
      return res.status(404).json({ message: "No events found" });
    }
    const eventsData: any = eventsDoc.data();

    const eventsArray = Object.keys(eventsData).map((key) => {
      const event = eventsData[key];
      // console.log(event);
      delete event.updatedBy;
      return event;
    });

    return res.status(200).json({ events: eventsArray });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});
router.get("/getEventByCategory", async (req, res) => {
  try {
    const type = req.query.category;
    if (!type) {
      return res.status(400).json({ message: "Please provide category" });
    }
    console.log(type);
    const eventsCollection = firestoreDB.collection("events").doc("all_events");
    const eventsDoc = await eventsCollection.get();
    if (!eventsDoc.exists) {
      return res.status(404).json({ message: "No events found" });
    }
    const eventsData: any = eventsDoc.data();
    const eventsArray = Object.keys(eventsData).map((key) => {
      const event = eventsData[key];
      delete event.updatedBy;
      if (event.data.category === type) {
        return event;
      } else {
        return null;
      }
    });
    return res.status(200).json({ events: eventsArray });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});
router.post("/addEvent", async (req, res) => {
  try {
    let {
      email,
      title,
      description,
      location,
      timestamp,
      category,
      eventId,
      status,
      pointsTable,
    } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Please provide email" });
    }
    const admin = await isAdmin(email);
    if (!admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!title || !description || !location || !timestamp || !category) {
      return res.status(400).json({ message: "Please provide all the fields" });
    }
    const eventsCollection = firestoreDB.collection("events");
    const eventsDoc = eventsCollection.doc("all_events");
    if (!eventId) {
      eventId = uuidv4();
    }
    const data: any = {
      eventId,
      category,
      details: {
        timestamp,
        title,
        description,
        location,
      },
    };
    console.log(pointsTable);
    if (pointsTable) {
      data["pointsTable"] = pointsTable;
    }
    await eventsDoc.update({
      [`${eventId}.data`]: data,
      [`${eventId}.updatedBy`]: FieldValue.arrayUnion({
        email,
        timestamp: new Date().toISOString(),
      }),
    });
    await firestoreDB
      .collection("events")
      .doc("events_by_council")
      .update({
        [category]: FieldValue.arrayUnion(eventId),
      });
    return res.status(200).json({ message: "Event added successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});
router.post("/updateEvent", async (req, res) => {
  try {
    const { eventId, email, location, timestamp, pointsTable } = req.body;
    const admin = await isAdmin(email);
    if (!admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    console.log(eventId, location, timestamp);
    if (!email) {
      return res.status(400).json({ message: "Please provide email" });
    }
    if (!eventId) {
      return res.status(400).json({ message: "Please provide event Id" });
    }
    const eventsCollection = firestoreDB.collection("events");
    const eventsDoc = await eventsCollection.doc("all_events").get();
    if (!eventsDoc.exists) {
      return res.status(404).json({ message: "Document not found" });
    }
    const eventsData: any = eventsDoc.data();
    if (!eventsData[eventId]) {
      return res.status(404).json({ message: "Event not found" });
    }
    console.log(location);
    const updatedata: any = {
      eventId: eventId,
      details: {
        timestamp: timestamp || eventsData[eventId].data.details.timestamp,
        title: eventsData[eventId].data.details.title,
        description: eventsData[eventId].data.details.description,
        location: location || eventsData[eventId].data.details.location,
      },
      pointsTable: pointsTable || eventsData[eventId]?.data?.pointsTable,
    };
    // console.log(updatedata);
    //remove undefined fields
    Object.keys(updatedata).forEach(
      (key) => updatedata[key] === undefined && delete updatedata[key]
    );
    await eventsCollection.doc("all_events").update({
      [`${eventId}.data`]: updatedata,
      [`${eventId}.updatedBy`]: FieldValue.arrayUnion({
        email,
        timestamp: new Date().toISOString(),
      }),
    });
    console.log("Event updated successfully");
    return res.status(200).json({
      message: "Event updated successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Not completed
router.post("/updateLiveEvent", async (req, res) => {
  try {
    const { email, status, eventId, subEventId, points } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Please provide email" });
    }
    const admin = await isAdmin(email);
    if (!admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!eventId || !subEventId) {
      return res
        .status(400)
        .json({ message: "Please provide Event Id and Sub Event Id" });
    }
    const eventsCollection = firestoreDB.collection("events");
    const eventsDoc = await eventsCollection.doc("live_events").get();
    if (!eventsDoc.exists) {
      await eventsCollection.doc("live_events").set({});
    }
    const eventsData: any = eventsDoc.data();
    const eventData = eventsData[eventId][subEventId];
    // console.log(eventData);
    const data: any = {
      details: {
        title: eventData?.data?.details?.title,
        timestamp: eventData?.data?.details?.timestamp,
        location: eventData?.data?.details?.location,
      },
      status: status || eventData?.data?.status,
      points: points || eventData?.data?.points,
    };
    // console.log(data);
    Object.keys(data).forEach(
      (key) => data[key] === undefined && delete data[key]
    );
    await eventsCollection.doc("live_events").update({
      [`${eventId}.${subEventId}.data`]: data,
      [`${eventId}.${subEventId}.updatedBy`]: FieldValue.arrayUnion({
        email,
        timestamp: new Date().toISOString(),
      }),
    });
    return res.status(200).json({
      message: "Event updated successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});
router.post("/scheduleLiveEvent", async (req, res) => {
  try {
    const {
      email,
      title,
      location,
      timestamp,
      status,
      eventId,
      subEventId,
      points,
    } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Please provide email" });
    }
    const admin = await isAdmin(email);
    if (!admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (
      !title ||
      !location ||
      !timestamp ||
      !status ||
      !eventId ||
      !subEventId
    ) {
      return res.status(400).json({ message: "Please provide all the fields" });
    }
    const eventsCollection = firestoreDB.collection("events");
    const eventsDoc = await eventsCollection.doc("live_events").get();
    if (!eventsDoc.exists) {
      await eventsCollection.doc("live_events").set({});
    }

    // console.log(points);
    const data: any = {
      status,
      details: {
        title,
        timestamp,
        location,
      },
    };
    if (points) {
      data["points"] = points;
    }
    await eventsCollection.doc("live_events").update({
      [`${eventId}.${subEventId}.data`]: data,
      [`${eventId}.${subEventId}.updatedBy`]: FieldValue.arrayUnion({
        email,
        timestamp: new Date().toISOString(),
      }),
    });
    return res.status(200).json({
      message: "Event scheduled successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});
router.get("/getAllLiveEvents", async (req, res) => {
  try {
    const eventsCollection = firestoreDB.collection("events");
    const eventsDoc = await eventsCollection.doc("live_events").get();
    if (!eventsDoc.exists) {
      await eventsCollection.doc("live_events").set({});
    }
    const eventsData: any = eventsDoc.data();
    const eventsArray = Object.keys(eventsData).map((key) => {
      const subEvents: any = [];
      Object.keys(eventsData[key]).map((subKey) => {
        // delete eventsData[key][subKey].updatedBy;
        subEvents.push({
          subEventId: subKey,
          data: eventsData[key][subKey].data,
        });
      });
      return {
        eventId: key,
        subEvents: subEvents,
      };
    });
    return res.status(200).json({ events: eventsArray });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});
router.get("/getCurrentlyLiveEvents", async (req, res) => {
  try {
    const eventsCollection = firestoreDB.collection("events");
    const eventsDoc = await eventsCollection.doc("live_events").get();
    if (!eventsDoc.exists) {
      await eventsCollection.doc("live_events").set({});
    }
    const eventsData: any = eventsDoc.data();
    //check if event.data.status is live
    const eventsArray = Object.keys(eventsData).map((key) => {
      const subEvents: any = [];
      Object.keys(eventsData[key]).map((subKey) => {
        if (eventsData[key][subKey].data.status === "live") {
          delete eventsData[key][subKey].updatedBy;
          subEvents.push({
            subEventId: subKey,
            data: eventsData[key][subKey].data,
          });
        }
      });
      return {
        eventId: key,
        subEvents: subEvents,
      };
    });
    return res.status(200).json({ events: eventsArray });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});
router.get("/getUpcomingEvents", async (req, res) => {
  try {
    const eventsCollection = firestoreDB.collection("events");
    const eventsDoc = await eventsCollection.doc("live_events").get();
    if (!eventsDoc.exists) {
      await eventsCollection.doc("live_events").set({});
    }
    const eventsData: any = eventsDoc.data();
    //check if event.data.status is live
    const eventsArray = Object.keys(eventsData).map((key) => {
      const subEvents: any = [];
      Object.keys(eventsData[key]).map((subKey) => {
        if (eventsData[key][subKey].data.status === "upcoming") {
          delete eventsData[key][subKey].updatedBy;
          subEvents.push({
            subEventId: subKey,
            data: eventsData[key][subKey].data,
          });
        }
      });
      return {
        eventId: key,
        subEvents: subEvents,
      };
    });
    return res.status(200).json({ events: eventsArray });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});
router.get("/getPastEvents", async (req, res) => {
  try {
    const eventsCollection = firestoreDB.collection("events");
    const eventsDoc = await eventsCollection.doc("live_events").get();
    if (!eventsDoc.exists) {
      await eventsCollection.doc("live_events").set({});
    }
    const eventsData: any = eventsDoc.data();
    //check if event.data.status is live
    const eventsArray = Object.keys(eventsData).map((key) => {
      const subEvents: any = [];
      Object.keys(eventsData[key]).map((subKey) => {
        if (eventsData[key][subKey].data.status === "concluded") {
          delete eventsData[key][subKey].updatedBy;
          subEvents.push({
            subEventId: subKey,
            data: eventsData[key][subKey].data,
          });
        }
      });
      return {
        eventId: key,
        subEvents: subEvents,
      };
    });
    return res.status(200).json({ events: eventsArray });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
