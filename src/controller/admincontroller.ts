// router.get("/isAdmin/:email", async (req, res) => {
//   try {
//     const email = req.params.email;
//     if (!email) {
//       return res.status(400).json({ message: "Please provide email" });
//     }
//     const adminCollection = await firestoreDB.collection("admin");
//     const adminDoc = await adminCollection.doc("allowedEmails").get();
//     if (!adminDoc.exists) {
//       return res.status(404).json({ message: "No admins found" });
//     }
//     const adminData: any = adminDoc.data()?.emails;
//     if (adminData.includes(email)) {
//       return res.status(200).json({ isAdmin: true });
//     }
//     return res.status(200).json({ isAdmin: false });
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// });

import { firestoreDB } from "../config/config";

export const isAdmin = async (email: any) => {
  try {
    if (!email) {
      return false;
    }
    const adminCollection = await firestoreDB.collection("admin");
    const adminDoc = await adminCollection.doc("allowedEmails").get();
    if (!adminDoc.exists) {
      return false;
    }
    const adminData: any = adminDoc.data()?.emails;
    if (adminData.includes(email)) {
      return true;
    }
    return false;
  } catch (err) {
    console.log(err);
    return false;
  }
};
