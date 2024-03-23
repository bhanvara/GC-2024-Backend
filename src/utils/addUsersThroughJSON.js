const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = require('./fsconfig.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function uploadJsonToFirestore(filePath) {
  // Read JSON file
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const jsonData = JSON.parse(fileContent);

  // Transform data structure
  const transformedData = jsonData.reduce((acc, { email, ...rest }) => {
    acc[email] = rest;
    return acc;
  }, {});

  // console.log(transformedData);

  await db.collection('users').doc('userDetails').set({details: transformedData})
  console.log('All users added successfully!');
}

uploadJsonToFirestore('../../data/student-details.json').catch(console.error);
