# Hackon

### Frontend
- React 18+
- Vite (Build tool)
- Modern CSS/Tailwind CSS
- Socket.io Client

### Backend
- Node.js
- Express.js
- Socket.io Server
- RESTful APIs

### Video Processing
- Python
- AWS Lambda
- Machine Learning libraries
- Video analysis tools

## 🚦 Getting Started

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd Hackon
```

### 2. Install dependencies
**For the frontend:**
```bash
cd Frontend
npm install
```

**For the backend server:**
```bash
cd ../server
npm install
```

**For the video summarization service (optional, if using AWS Lambda):**
```bash
cd ../vedio-Sumarization/src
pip install -r requirements.txt
```

### 3. Environment Configuration

Create `.env` files in the respective directories:

**Frontend (.env):**
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

**Backend (.env):**
```env
PORT=3000
NODE_ENV=development
# Add other environment variables as needed
```

### 4. Start the development servers
**Frontend (Vite + React):**
```bash
cd Frontend
npm run dev
```

**Backend (Express + Socket.io):**
```bash
cd ../server
npm run dev
```

**Video Summarization (if running locally):**
- Deploy the AWS Lambda using the provided `template.yaml` or run scripts as needed.

### 5. Open the app
- Visit [http://localhost:5173](http://localhost:5173) in your browser for the frontend UI.
- Backend API will be available at [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
Hackon/
├── Frontend/                 # React frontend application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── server/                   # Express.js backend
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── package.json
│   └── server.js
├── vedio-Sumarization/       # Video processing service
│   ├── src/
│   ├── requirements.txt
│   └── template.yaml
└── README.md
```

## 🚀 Deployment

### Frontend Deployment
```bash
cd Frontend
npm run build
# Deploy the dist/ folder to your hosting service
```

### Backend Deployment
```bash
cd server
npm start
# Deploy to your preferred cloud platform
```

### AWS Lambda Deployment
```bash
cd vedio-Sumarization
# Follow AWS SAM deployment guidelines
sam build
sam deploy --guided
```

## 🔧 Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests

# 🎥 Co-Watching Platform with Real-Time Sync, Mood-Based Recommendation & Gamification

Welcome to the **Co-Watching Platform** — a scalable, cloud-native solution built for **Amazon HackOn 2025**. This system enables **millions of users** to watch videos together in real time, interact through chat, get personalized content suggestions, and engage with gamified trivia — all in a **serverless and distributed architecture**.

---

## 🚀 Project Highlights

- 🔁 **Synchronized Video Playback** across large user groups
- 💬 **Real-Time Chat Engine** using Redis Pub/Sub
- 🧠 **Mood-Based OTT Recommendations** via Amazon Personalize
- ✂️ **Video Summarization** using Amazon Transcribe & LLM-enhanced phrasing
- 🎮 **Gamification Layer** with leaderboards, streaks, and rewards
- 🔐 **Cognito-based Auth** and user preference tracking

---

## 🧠 System Modules

### 1. 🔄 Co-Watching & Sync Engine
- Real-time **WebSocket servers** (`ws-1` to `ws-n`)
- `room state manager` to sync play/pause/seek across users
- `chat handler` pushing and receiving messages through **Redis**
- Logs stored in Redis for sync playback state restoration

---

### 2. 🧼 Video Summarizer
- Uses **Amazon Transcribe** to convert video speech to text
- Queries **DynamoDB** for pre-summarized content
- LLM prompt construction via custom Phrase Pro Module
- Optionally produces TLDR using **Amazon Polly**

---

### 3. 📊 Mood-Based Recommendation Engine
- Trains on:
  - User behavior
  - OTT item metadata
  - Viewing mood signals
- Uses **Amazon Personalize** to recommend shows/movies
- Delivers **personalized prompts** to the Phrase Pro model
- Output links direct users to external OTT platforms (Prime Video, etc.)

---

### 4. 🎮 Gamification Layer
- **Question Engine** triggers context-aware questions
- **Rule Evaluator** manages engagement criteria
- **Leaderboard Engine** tracks user rank in real time
- **Reward System** grants rewards via **SNS push notifications**
- **Streak Tracker** logs consistency & daily engagement

---

### 5. 👤 User Management
- Authenticated via **Amazon Cognito + JWT**
- **Secrets Manager** securely stores and rotates keys
- `Profile Manager`, `Preferences Manager`, and `Viewing History Logger` track user state
- **Points Manager** handles gamification integration


## ⚖️ Scaling Strategy

| Component            | Scaling Method                                  |
|----------------------|-------------------------------------------------|
| WebSocket Layer      | Auto-scaled containers behind Load Balancer     |
| Redis Pub/Sub        | Horizontally scalable with clustered Redis      |
| Chat Sync            | Sharded channels to reduce write hotspots       |
| Video Summarizer     | Stateless microservices + DynamoDB cache layer |
| Personalization      | Pre-trained model inference on Amazon SageMaker |
| API Gateway          | Rate-limited + multi-tenant                     |
| Auth & User State    | Cognito (serverless) + Secrets Manager          |

---

## 🔐 Security Considerations

- OAuth2 / JWT-based token validation using **Amazon Cognito**
- All inter-service calls secured via IAM roles & scoped policies
- Caching minimizes unnecessary API exposure
- Secrets (e.g., JWT signing keys) handled by **AWS Secrets Manager**

---

## 📦 Tech Stack

| Layer        | Technology               |
|--------------|---------------------------|
| Frontend     | FireTV / Web App (React) |
| API Gateway  | Amazon API Gateway       |
| Auth         | Amazon Cognito           |
| Compute      | AWS Load Balancer + WebSockets |
| Realtime DB  | Redis (Pub/Sub)          |
| Storage      | DynamoDB                 |
| AI Services  | Amazon Transcribe, Personalize, Polly,
|              |     Amazon Rekognition , Amazon Bedrock |
| Messaging    | SNS                      |

---

## 🧪 Test Scenarios

| Use Case                     | Expected Behavior                             |
|------------------------------|-----------------------------------------------|
| 100K+ users join same room   | WebSocket sync remains stable (via sharding)  |
| Chat spam burst              | Redis handles burst via pub/sub architecture  |
| New user joins mid-session   | Receives correct video state + chat backlog   |
| Personalized recommendation | Returns mood-specific OTT titles              |
| Voice summarizer request     | Cached TLDR or generates via Transcribe       |

---

## 🛠 Future Enhancements

- 🎥 Replace OTT stubs with real playback via **MediaConnect / IVS**
- 📊 Add **real-time analytics dashboard** (Grafana + CloudWatch)
- 🎯 Integrate emotion detection to enhance recommendation inputs
- 📦 Convert video summarizer to fully async & queue-driven via SQS

---

## 📜 License

This project is licensed under the **MIT License**. See `LICENSE` file for details.

---

## 🤝 Let's Connect

> Built as part of Amazon HackOn 2025 💡  
If you'd like a live demo, or you're interested in collaborating beyond the hackathon — reach out!

---
