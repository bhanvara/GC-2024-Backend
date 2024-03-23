import express from "express";
import admin from "firebase-admin";
import { firestoreDB } from "../config/config"; 

export const router = express.Router();

router.post("/addUser", async (req, res) => {
  const email = req.query.email as string;
  const name = req.query.name as string;
  const dept = req.query.dept as string;

  if (!email || !name || !dept) {
    return res.status(400).json({ message: "Invalid Request" });
  }

  const docRef = firestoreDB.collection('users').doc('userDetails');

  try {
    const doc = await docRef.get();
    if (doc.exists) {
      const outerDetails = doc.data() as { [key: string]: { [key: string]: { dept: string, name: string } } };
      const details = outerDetails.details;

      if (details[email]) {
        return res.status(400).json({ message: "User already exists" });
      }

      details[email] = { name, dept };

      await docRef.set({ details });

      return res.status(200).json({ message: "User added successfully" });
    } else {
      const details = {
        [email]: { name, dept }
      };

      await docRef.set({ details });

      return res.status(200).json({ message: "User added successfully" });
    }
  } catch (error) {
    console.error('Error accessing document:', error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/removeUser", async (req, res) => {
  const email = req.query.email as string;

  if (!email) {
    return res.status(400).json({ message: "Email parameter is missing." });
  }

  const docRef = firestoreDB.collection('users').doc('userDetails');

  try {
    const doc = await docRef.get();
    if (doc.exists) {
      const outerDetails = doc.data() as { [key: string]: { [key: string]: { dept: string, name: string } } };
      const details = outerDetails.details;

      if (!details[email]) {
        return res.status(400).json({ message: "User does not exist" });
      }

      delete details[email];

      await docRef.set({ details });

      return res.status(200).json({ message: "User removed successfully" });
    } else {
      return res.status(404).json({ message: "No user details found" });
    }
  } catch (error) {
    console.error('Error accessing document:', error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/getDetails", async (req, res) => {
  const email = req.query.email as string;

  if (!email) {
    return res.status(400).json({ message: "Email parameter is missing." });
  }

  const docRef = firestoreDB.collection('users').doc('userDetails');

  try {
    const doc = await docRef.get();
    if (doc.exists) {
      const outerDetails = doc.data() as { [key: string]: { [key: string]: { dept: string, name: string } } };
      const details = outerDetails.details;

      const userDetails = details[email];

      if (userDetails) {
        return res.status(200).json({ userDetails });
      } else {
        return res.status(404).json({ message: "User not found" });
      }
    } else {
      return res.status(404).json({ message: "No user details found" });
    }
  } catch (error) {
    console.error('Error accessing document:', error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/getFollowing", async (req, res) => {
  const email = req.query.email as string;

  if (!email) {
    return res.status(400).json({ message: "Email parameter is missing." });
  }

  const followingDocRef = firestoreDB.collection('users').doc('following');

  try {
    const doc = await followingDocRef.get();

    if (doc.exists) {
      const followingData = doc.data() as { [key: string]: string[] };
      console.log(doc.data());

      const following = followingData[email];

      if (following) {
        return res.status(200).json({ following });
      } else {
        return res.status(404).json({ message: "Following not found" });
      }
    } else {
      return res.status(404).json({ message: "No following found" });
    }
  } catch (error) {
    console.error('Error accessing document:', error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/follow", async (req, res) => {
  const email = req.query.email as string;
  const council = req.query.council as string;
  const event = req.query.event as string;
  const team = req.query.team as string;

  if (!email || (!council && !event && !team)) {
    return res.status(400).json({ message: "Invalid Request" });
  }

  const followingDocRef = firestoreDB.collection('users').doc('following');

  try {
    const doc = await followingDocRef.get();

    if (doc.exists) {
      const followingData = doc.data() as { [key: string]: { council: string[], events: string[], team: string[] } };

      const userData = followingData[email] || { council: [], events: [], team: [] };
      const alreadyFollowing = [];
      const successfullyFollowed = [];

      if (council) {
        if (userData.council.includes(council)) {
          alreadyFollowing.push('council');
        } else {
          userData.council.push(council);
          successfullyFollowed.push('council');
        }
      }

      if (event) {
        if (userData.events.includes(event)) {
          alreadyFollowing.push('event');
        } else {
          userData.events.push(event);
          successfullyFollowed.push('event');
        }
      }

      if (team) {
        if (userData.team.includes(team)) {
          alreadyFollowing.push('team');
        } else {
          userData.team.push(team);
          successfullyFollowed.push('team');
        }
      }

      followingData[email] = userData;

      await followingDocRef.set(followingData);

      let message = '';
      if (successfullyFollowed.length > 0) {
        message += `Successfully followed ${successfullyFollowed.join(', ')}. `;
      }
      if (alreadyFollowing.length > 0) {
        message += `Already following ${alreadyFollowing.join(', ')}.`;
      }

      return res.status(200).json({ message: message.trim() });
    } else {
      const followingData = {
        [email]: {
          council: council ? [council] : [],
          events: event ? [event] : [],
          team: team ? [team] : []
        }
      };

      await followingDocRef.set(followingData);

      return res.status(200).json({ message: `Successfully followed ${[council, event, team].filter(Boolean).join(', ')}` });
    }
  } catch (error) {
    console.error('Error accessing document:', error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/unfollow", async (req, res) => {
  const email = req.query.email as string;
  const council = req.query.council as string;
  const event = req.query.event as string;
  const team = req.query.team as string;

  if (!email || (!council && !event && !team)) {
    return res.status(400).json({ message: "Invalid Request" });
  }

  const followingDocRef = firestoreDB.collection('users').doc('following');

  try {
    const doc = await followingDocRef.get();

    if (!doc.exists) {
      return res.status(400).json({ message: "User not found" });
    }

    const followingData = doc.data() as { [key: string]: { council: string[], events: string[], team: string[] } };

    if (!followingData[email]) {
      return res.status(400).json({ message: "User not found" });
    }

    const userData = followingData[email];
    const notFollowing = [];
    const successfullyUnfollowed = [];

    if (council) {
      const wasFollowing = userData.council.includes(council);
      userData.council = userData.council.filter(c => c !== council);
      if (wasFollowing) {
        successfullyUnfollowed.push('council');
      } else {
        notFollowing.push('council');
      }
    }

    if (event) {
      const wasFollowing = userData.events.includes(event);
      userData.events = userData.events.filter(e => e !== event);
      if (wasFollowing) {
        successfullyUnfollowed.push('event');
      } else {
        notFollowing.push('event');
      }
    }

    if (team) {
      const wasFollowing = userData.team.includes(team);
      userData.team = userData.team.filter(t => t !== team);
      if (wasFollowing) {
        successfullyUnfollowed.push('team');
      } else {
        notFollowing.push('team');
      }
    }

    followingData[email] = userData;

    await followingDocRef.set(followingData);

    let message = '';
    if (successfullyUnfollowed.length > 0) {
      message += `Successfully unfollowed ${successfullyUnfollowed.join(', ')}. `;
    }
    if (notFollowing.length > 0) {
      message += `Not following ${notFollowing.join(', ')}.`;
    }

    return res.status(200).json({ message: message.trim() });
  } catch (error) {
    console.error('Error accessing document:', error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});


export default router;
