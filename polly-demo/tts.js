// tts.js
require('dotenv').config();
const fs = require('fs');
const {
  PollyClient,
  SynthesizeSpeechCommand,
} = require('@aws-sdk/client-polly');

const polly = new PollyClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const params = {
  OutputFormat: 'mp3',
  Text: 'Hello! everyone , i am a text to speech demo using AWS Polly.',
  VoiceId: 'Joanna',
};

async function speak() {
  try {
    const command = new SynthesizeSpeechCommand(params);
    const data = await polly.send(command);

    if (data.AudioStream) {
      const writeStream = fs.createWriteStream('speech.mp3');
      data.AudioStream.pipe(writeStream);
      console.log('✅ speech.mp3 file written successfully!');
    } else {
      console.error('❌ No AudioStream in response.');
    }
  } catch (err) {
    console.error('❌ AWS Polly error:', err);
  }
}


speak();
