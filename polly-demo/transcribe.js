require('dotenv').config();
const { TranscribeClient, StartTranscriptionJobCommand, GetTranscriptionJobCommand } = require('@aws-sdk/client-transcribe');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');

// AWS Region, Bucket, and File Details
const REGION = process.env.AWS_REGION;
const bucket = 'tts-sst-bucket';
const audioFileKey = 'speech.mp3';
const jobName = `transcribe-job-${Date.now()}`;

// Clients
const transcribeClient = new TranscribeClient({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Start Transcription Job
async function startTranscriptionJob() {
  const input = {
    TranscriptionJobName: jobName,
    LanguageCode: 'en-US',
    MediaFormat: 'mp3',
    Media: {
      MediaFileUri: `s3://${bucket}/${audioFileKey}`
    },
    OutputBucketName: bucket
  };

  try {
    const command = new StartTranscriptionJobCommand(input);
    await transcribeClient.send(command);
    console.log(`🕐 Started transcription job: ${jobName}`);
    await pollForResult();
  } catch (err) {
    console.error('❌ Error starting transcription job:', err);
  }
}

// Polling for Completion
async function pollForResult() {
  const command = new GetTranscriptionJobCommand({ TranscriptionJobName: jobName });

  const poll = async () => {
    const response = await transcribeClient.send(command);
    const { TranscriptionJob } = response;
    const status = TranscriptionJob.TranscriptionJobStatus;

    console.log(`📄 Status: ${status}`);

    if (status === 'IN_PROGRESS') {
      setTimeout(poll, 5000); // Retry in 5 seconds
    } else if (status === 'COMPLETED') {
        const transcriptUri = TranscriptionJob.Transcript.TranscriptFileUri;
  console.log('✅ Transcript ready at:', transcriptUri);

  const url = new URL(transcriptUri);
  const key = url.pathname.split('/').slice(2).join('/');

  await downloadTranscriptFromS3(bucket, key);

  await downloadTranscriptFromS3(bucket, key);
    } else {
      console.error('❌ Transcription failed:', status);
    }
  };

  poll();
}

// Securely download transcript from S3
async function downloadTranscriptFromS3(bucket, key) {
  try {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const response = await s3Client.send(command);

    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }

    const body = Buffer.concat(chunks).toString('utf8');
    const json = JSON.parse(body);
    const transcriptText = json.results.transcripts[0].transcript;

    console.log('\n📝 TRANSCRIPT:\n', transcriptText);
  } catch (err) {
    console.error('❌ Error reading transcript from S3:', err);
  }
}

// Run
startTranscriptionJob();
