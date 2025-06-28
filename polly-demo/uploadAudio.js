// upload.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const bucketName = 'tts-sst-bucket';
const filePath = path.join(__dirname, 'speech.mp3');
const key = 'speech.mp3'; // this is the S3 object name

async function uploadFile() {
  try {
    const fileContent = fs.readFileSync(filePath);

    await s3.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: fileContent,
      ContentType: 'audio/mpeg',
    }));

    console.log(`✅ File uploaded to S3: s3://${bucketName}/${key}`);
  } catch (err) {
    console.error('❌ Error uploading to S3:', err);
  }
}

uploadFile();
