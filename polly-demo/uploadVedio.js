require("dotenv").config();
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const axios = require("axios");

const REGION = process.env.AWS_REGION;
const BUCKET_NAME = process.env.BUCKET_NAME;
const VIDEO_URL = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
const S3_KEY = "BigBuckBunny.mp4";

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function uploadVideoFromUrl() {
  try {
    console.log("⬇️  Downloading video from:", VIDEO_URL);
    const response = await axios.get(VIDEO_URL, { responseType: "arraybuffer" });

    const buffer = Buffer.from(response.data);

    console.log("⬆️  Uploading to S3 bucket:", BUCKET_NAME);

    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: S3_KEY,
      Body: buffer,
      ContentType: "video/mp4",
      ContentLength: buffer.length,
    });

    await s3.send(uploadCommand);
    console.log(`✅ Uploaded successfully to s3://${BUCKET_NAME}/${S3_KEY}`);
  } catch (err) {
    console.error("❌ Upload failed:", err.message);
  }
}

uploadVideoFromUrl();
