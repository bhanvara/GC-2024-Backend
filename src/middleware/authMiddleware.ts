import axios from 'axios';
import { firestoreDB } from "../config/config";

function isAdmin(email: string) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!email) {
                reject("Please provide email");
            }
            const adminCollection = await firestoreDB.collection("admin");
            const adminDoc = await adminCollection.doc("allowedEmails").get();
            if (!adminDoc.exists) {
                reject("No admins found");
            }
            const adminData: any = adminDoc.data()?.emails;
            if (adminData.includes(email)) {
                resolve(true);
            }
            resolve(false);
        } catch (err) {
            console.log(err);
            reject("Internal Server Error");
        }
    });
}

export async function attachAccessToken(req: any, res: any, next: any) {
    if (req.user && req.user.accessToken) {
        try {
            const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${req.user.accessToken}` },
            });

            if (response.status === 200 && await isAdmin(response.data.email)) {
                req.accessToken = req.user.accessToken;
                next();
            } else {
                res.status(401).send('Unauthorized: Invalid or expired access token');
            }
        } catch (error) {
            res.status(401).send('Unauthorized: Invalid or expired access token');
        }
    } else {
        res.status(401).send('Unauthorized: Missing access token');
    }
}

// function attachAccessToken(req: any, res: any, next: any) {
//     if (req.user && req.user.accessToken) {
//         req.accessToken = req.user.accessToken;
//         next();
//     } else {
//         res.status(401).send('Unauthorized: Invalid or missing access token');
//     }
// }
