# Aadhaar — Emergency Awareness System
### UW Hackathon Winner · Built by Abhishek Deshmukh

> **aadhaar** (Hindi: आधार) means *"foundation"* — a dependable safety foundation for the deaf community.

Aadhaar turns any emergency into instant visual and tactile alerts so **430 million deaf and hard-of-hearing people** never miss a danger they cannot hear. It unifies AI-powered event detection, multi-channel alerting, smart-home control, and emergency dispatch into one fully accessible platform.

**Creator:** Abhishek Deshmukh  
**Email:** deshmukh.abhishek152@gmail.com  
**Event:** UW Bothell Hackathon — Winner  
**Live site:** aadhaar.deaf.com (sample domain)

---

## Table of Contents

1. [What Aadhaar Does](#1-what-aadhaar-does)
2. [System Architecture](#2-system-architecture)
3. [Project Structure](#3-project-structure)
4. [Prerequisites](#4-prerequisites)
5. [Step-by-Step Setup](#5-step-by-step-setup)
   - [Step 1 — Verify your environment](#step-1--verify-your-environment)
   - [Step 2 — Set up the Backend](#step-2--set-up-the-backend)
   - [Step 3 — Set up the Web Dashboard](#step-3--set-up-the-web-dashboard)
   - [Step 4 — Set up the Mobile App](#step-4--set-up-the-mobile-app)
   - [Step 5 — Set up the Sensor Simulator](#step-5--set-up-the-sensor-simulator)
   - [Step 6 — Run Everything Together](#step-6--run-everything-together)
6. [API Keys & Configuration](#6-api-keys--configuration)
   - [Google Gemini AI](#google-gemini-ai-recommended--free)
   - [Twilio SMS](#twilio-sms-optional)
   - [Firebase Push Notifications](#firebase-push-notifications-optional)
7. [Testing the System](#7-testing-the-system)
8. [Web Dashboard Pages](#8-web-dashboard-pages)
9. [Mobile App Screens](#9-mobile-app-screens)
10. [API Reference](#10-api-reference)
11. [WebSocket Events](#11-websocket-events)
12. [Security Architecture](#12-security-architecture)
13. [Deployment](#13-deployment)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. What Aadhaar Does

| Feature | Description |
|---------|-------------|
| **AI Event Detection** | Google Gemini 1.5 Flash classifies fire alarms, CO leaks, glass breaks, motion, doorbells, baby cries in real time with confidence scoring |
| **Sub-second Alerts** | Simultaneous fan-out: full-screen app alert, smartwatch haptics, smart bulb flash, SMS to contacts — all under 1 second |
| **One-Tap SOS** | Sends GPS coordinates + medical profile to trusted contacts; one more tap dials 911 |
| **Accessibility-First** | High-contrast dark UI, large text, visual-only experience — no sound required at any step |
| **Zero-Trust Security** | HMAC-SHA256 IoT message signing, TLS 1.3, JWT API auth, AES-256 at rest, Auth0-ready |
| **Live Analytics** | 7 real-time charts: event timeline, AI radar, risk distribution, pipeline latency, weekly trends |
| **Device Management** | Add/remove/toggle sensors, live health monitoring, firmware version tracking |
| **Emergency SOS Center** | GPS map, trusted contact status, medical info auto-shared, elapsed-time counter |

### Who it helps

- **430 million** deaf and hard-of-hearing people worldwide
- Families of deaf members who want remote monitoring
- Care facilities and hospitals that serve hearing-impaired patients
- Smart-home users who want visual/haptic emergency alerts

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  EDGE ZONE  (Untrusted by default)                                  │
│                                                                     │
│  Fire Sensor · CO Detector · Mic Array · Motion PIR · Doorbell      │
│       ↓                                                             │
│  Hardware threshold check  →  MQTT publish (TLS 1.3)                │
│  HMAC-SHA256 sign + seq#                                            │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────────┐
│  SECURE BACKEND  (Zero-trust enforced)                              │
│                                                                     │
│  ┌──────────────┐    ┌────────────────┐    ┌───────────────────┐    │
│  │ Aedes MQTT   │ →  │ Gemini 1.5     │ →  │ Event Router      │    │
│  │ Broker       │    │ AI Classifier  │    │ Fan-out logic     │    │
│  │ HMAC verify  │    │ Risk scoring   │    │ Priority queue    │    │
│  │ Seq# replay  │    │ Confidence %   │    │ Auth0 policy      │    │
│  │ protection   │    │                │    │                   │    │
│  └──────────────┘    └────────────────┘    └──────-───┬────────┘    │
│                                                       │             │
│  Auth0/JWT/RBAC · Data Store · Audit Log · Rate Limit │             │
└───────────────────────────────────────────────────────┼─────────────┘
                                                        │
                                     WebSocket (real-time) + REST API
                                                        │
┌───────────────────────────────────────────────────────▼─────────────┐
│  TRUSTED OUTPUT  (Authenticated users only)                         │
│                                                                     │
│  Android/iOS App · Web Dashboard · Smartwatch · Smart Bulbs         │
│  SMS (Twilio) · Push (Firebase FCM) · 911 Dispatch                  │
└─────────────────────────────────────────────────────────────────────┘
```

**8-Step Alert Pipeline (avg. ~780ms end-to-end):**

```
① IoT Sensor fires
② Edge filter (hardware threshold check)
③ HMAC-SHA256 sign + seq# increment
④ MQTT publish over TLS 1.3
⑤ Broker: HMAC verify + replay protection + client auth
⑥ Gemini AI: classify event type, risk level, confidence
⑦ Risk threshold gate (high/medium → fan-out; low → log only)
⑧ Simultaneous output: WebSocket + SMS + Push + Smart Home
```

---

## 3. Project Structure

```
aadhar/
│
├── backend/                         # Node.js API + MQTT broker + AI engine
│   ├── src/
│   │   ├── index.js                 # Server entry — starts Express + MQTT + Socket.IO
│   │   ├── ai/
│   │   │   └── geminiClassifier.js  # Gemini 1.5 Flash + rule-based fallback
│   │   ├── mqtt/
│   │   │   ├── broker.js            # Aedes broker: TLS, HMAC-SHA256, seq# replay guard
│   │   │   └── client.js            # Subscribes to sensors/#, triggers AI + routing
│   │   ├── routes/
│   │   │   ├── alerts.js            # GET /api/alerts, POST /simulate, POST /:id/dismiss
│   │   │   ├── devices.js           # GET/POST/PATCH sensor devices
│   │   │   ├── sos.js               # POST /api/sos/trigger
│   │   │   ├── users.js             # GET/PATCH profile, settings, contacts
│   │   │   └── auth.js              # POST /api/auth/login, /register (JWT)
│   │   ├── websocket/
│   │   │   ├── socketHandler.js     # Socket.IO connection/disconnect handling
│   │   │   └── alertRouter.js       # Multi-channel fan-out: WS + SMS + Push + SmartHome
│   │   ├── notifications/
│   │   │   ├── smsService.js        # Twilio SMS (or console mock)
│   │   │   └── pushService.js       # Firebase FCM (or console mock)
│   │   ├── store/
│   │   │   └── alertStore.js        # In-memory store (MongoDB-ready, demo user included)
│   │   └── utils/
│   │       └── logger.js            # Winston structured logger
│   ├── .env.example                 # All environment variable documentation
│   └── package.json
│
├── web/                             # Next.js 16 web dashboard
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx           # Root layout: sidebar + emergency banner + AlertProvider
│   │   │   ├── page.tsx             # Dashboard — AI command center, sensors, simulator
│   │   │   ├── loading.tsx          # Global loading spinner
│   │   │   ├── not-found.tsx        # 404 page with branding
│   │   │   ├── alerts/page.tsx      # Alert history with KPI cards + filter tabs
│   │   │   ├── devices/page.tsx     # Sensor management with health rings
│   │   │   ├── analytics/page.tsx   # 7 Recharts graphs + performance table
│   │   │   ├── sos/page.tsx         # Emergency dispatch: GPS map + contacts + medical
│   │   │   ├── architecture/page.tsx# System diagrams + tech stack + threat model
│   │   │   ├── about/page.tsx       # Impact stats + build timeline + creator info
│   │   │   ├── profile/page.tsx     # Settings + trusted contacts + medical info
│   │   │   └── globals.css          # Premium design system (CSS variables + animations)
│   │   ├── components/
│   │   │   ├── Sidebar.tsx          # Navigation sidebar with AI engine status
│   │   │   ├── EmergencyBanner.tsx  # Top banner: audio tone + SOS link
│   │   │   ├── AlertRow.tsx         # Alert item: expandable, dismissible, confidence bar
│   │   │   └── StatCard.tsx         # KPI card component
│   │   └── lib/
│   │       └── AlertContext.tsx     # Socket.IO connection + global alert state
│   ├── .env.local                   # NEXT_PUBLIC_API_URL
│   └── package.json
│
├── mobile/                          # React Native (Expo) mobile app
│   ├── app/
│   │   ├── _layout.tsx              # Root navigator
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx          # Tab bar configuration
│   │   │   ├── index.tsx            # Home: status, sensors, recent alerts, simulator
│   │   │   ├── alerts.tsx           # Alert history with filter chips
│   │   │   ├── devices.tsx          # Device list with enable/disable toggles
│   │   │   └── profile.tsx          # Profile settings, contacts, medical info
│   │   ├── onboarding/
│   │   │   ├── index.tsx            # Splash screen with Get Started / Sign In
│   │   │   └── permissions.tsx      # Permission request flow (mic, location, notifs)
│   │   └── sos.tsx                  # SOS dispatch: map, contacts, send status
│   ├── src/
│   │   ├── components/
│   │   │   └── EmergencyOverlay.tsx # Full-screen emergency modal + SOS haptic pattern
│   │   ├── context/
│   │   │   └── AlertContext.tsx     # Socket.IO + vibration + push notification
│   │   ├── services/
│   │   │   ├── api.ts               # REST API client (all endpoints)
│   │   │   └── socket.ts            # Socket.IO client for React Native
│   │   └── theme/
│   │       └── colors.ts            # Dark theme color tokens
│   ├── .env.example
│   └── package.json
│
├── sensor-simulator/                # IoT device simulator (MQTT publisher)
│   ├── src/
│   │   └── index.js                 # HMAC-signed MQTT messages, seq# tracking
│   └── package.json                 # Scripts: fire, co, motion, doorbell, start
│
└── README.md                        # This file
```

---

## 4. Prerequisites

Check each tool is installed before starting:

```bash
node --version      # Must be v18.0.0 or newer
npm --version       # Must be v9.0.0 or newer
```

If Node is not installed, download it from **https://nodejs.org** (choose LTS).

**For the mobile app, also install:**

- **Expo Go** on your phone: App Store (iPhone) or Play Store (Android)
  - Search "Expo Go" — it's the orange icon

**Optional accounts (for full features — all have free tiers):**

| Service | What it enables | Sign-up link |
|---------|----------------|-------------|
| Google AI Studio | Gemini AI event classification | aistudio.google.com |
| Twilio | Real SMS alerts to contacts | twilio.com |
| Firebase | Push notifications to phones | console.firebase.google.com |

---

## 5. Step-by-Step Setup

### Step 1 — Verify your environment

Open a terminal and run:

```bash
node --version
# Expected output: v18.x.x or v20.x.x or newer

npm --version
# Expected output: 9.x.x or 10.x.x

# Navigate to the project root
cd "/path/to/aadhar"

# Confirm the 4 folders exist
ls
# Expected: backend  mobile  README.md  sensor-simulator  web
```

> If you see all 4 folders, you are ready to proceed.

---

### Step 2 — Set up the Backend

The backend is the central brain. It must be running before the web app or mobile app can connect.

#### 2a. Install dependencies

```bash
cd backend
npm install
```

Wait for it to finish. You should see no red errors (yellow warnings are fine).

#### 2b. Create your environment file

```bash
# Copy the template
cp .env.example .env
```

Open `.env` in a text editor (VS Code, Notepad, etc.) and set these minimum values:

```env
PORT=3000
NODE_ENV=development

# Generate any long random string — this secures your JWT tokens
JWT_SECRET=aadhar-super-secret-jwt-key-change-in-production-2024

# Generate any long random string — this authenticates IoT sensors
MQTT_HMAC_SECRET=aadhar-hmac-secret-for-iot-device-signing-2024
```

Save the file. The system runs without Gemini/Twilio/Firebase keys — it uses fallback mode.

#### 2c. Start the backend server

```bash
npm run dev
```

**Expected output (within 3 seconds):**

```
✓ Aadhar backend running on port 3000
✓ MQTT broker listening on port 1883
✓ Backend connected to MQTT broker
✓ Subscribed to aadhar/sensors/#
✓ Demo user: Abhishek Deshmukh
```

#### 2d. Verify the backend is alive

Open a **new terminal** (keep the backend terminal running) and run:

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{"status":"ok","service":"aadhar-backend"}
```

If you see this, the backend is working. **Keep this terminal running** — never close it.

---

### Step 3 — Set up the Web Dashboard

#### 3a. Install dependencies

Open a **second terminal** (backend must still be running in the first):

```bash
cd web
npm install
```

#### 3b. Check the environment file

The file `web/.env.local` already contains:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**No changes needed** unless you are testing on a phone (see note below).

> If you want to view the web dashboard on your phone or tablet on the same WiFi:
> Find your computer's local IP: `ifconfig | grep "inet "` (Mac) or `ipconfig` (Windows)
> Then change to: `NEXT_PUBLIC_API_URL=http://192.168.x.x:3000`

#### 3c. Start the web dashboard

```bash
npm run dev
```

**Expected output:**

```
▲ Next.js 16.2.9 (Turbopack)
- Local:        http://localhost:3001
✓ Ready in 1.2s
```

#### 3d. Open the dashboard in your browser

Go to: **http://localhost:3001**

You should see:
- Dark purple/navy design
- Left sidebar with "aadhaar" logo and navigation
- Dashboard with sensor status cards
- Green "aadhaar.deaf.com" online badge in the sidebar
- Live connection indicator showing "System Live"

---

### Step 4 — Set up the Mobile App

#### 4a. Install Expo Go on your phone (if not already done)

| Platform | Instructions |
|----------|-------------|
| iPhone | Open App Store → Search "Expo Go" → Install |
| Android | Open Play Store → Search "Expo Go" → Install |

#### 4b. Install dependencies

Open a **third terminal**:

```bash
cd mobile
npm install
```

#### 4c. Find your computer's local IP address

Your phone needs to reach your computer over WiFi. Find your IP:

```bash
# Mac / Linux
ifconfig | grep "inet " | grep -v 127.0.0.1
# Look for something like: inet 192.168.1.5

# Windows (run in Command Prompt)
ipconfig
# Look for "IPv4 Address" — e.g., 192.168.1.5
```

Write down this IP address — you will need it in the next step.

#### 4d. Create environment file

```bash
cp .env.example .env
```

Open `.env` and set your computer's IP address:

```env
# Replace 192.168.1.5 with YOUR computer's actual local IP
EXPO_PUBLIC_API_URL=http://192.168.1.5:3000
```

> Your phone and computer must be connected to the **same WiFi network**.
> Using `localhost` will NOT work — your phone cannot reach your computer that way.

#### 4e. Start the Expo server

```bash
npx expo start
```

**Expected output:**

```
Starting Metro Bundler
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
█ ▄▄▄▄▄ █▀ █▀▀██▀▄█ ▄▄▄▄▄ █
█ █   █ █▀▀▀█ ▀▄▀▀█ █   █ █
...
  (a QR code will appear here)

› Metro waiting on exp://192.168.1.5:8081
```

#### 4f. Open the app on your phone

| Platform | How to scan |
|----------|------------|
| iPhone | Open the default **Camera app** → point at the QR code in the terminal |
| Android | Open the **Expo Go app** → tap "Scan QR code" → point at the terminal QR code |

The app will download and launch within 20-30 seconds on first load.

**First run flow:**
1. Splash screen with Aadhaar logo
2. Tap "Get Started"
3. Grant permissions (microphone, location, notifications)
4. Home screen with sensor grid

---

### Step 5 — Set up the Sensor Simulator

The sensor simulator acts as fake IoT devices, sending signed MQTT messages to test the full alert pipeline.

#### 5a. Install dependencies

Open a **fourth terminal**:

```bash
cd sensor-simulator
npm install
```

#### 5b. Configure HMAC secret (must match backend)

```bash
cp .env.example .env 2>/dev/null || true
```

Open `sensor-simulator/.env` (or check `sensor-simulator/src/index.js`) and verify:
```env
MQTT_HMAC_SECRET=aadhar-hmac-secret-for-iot-device-signing-2024
```

This must be the **exact same value** as `MQTT_HMAC_SECRET` in `backend/.env`.

#### 5c. Send a test event

```bash
# Fire alarm — high risk (will trigger emergency banner)
npm run fire

# CO alarm — high risk
npm run co

# Motion detection — medium risk
npm run motion

# Doorbell — medium risk
npm run doorbell
```

**What you should see within 1 second:**
- Red emergency banner appears at the top of the web dashboard
- New alert appears in the alert history
- (If mobile app is open) Full-screen emergency overlay on your phone
- Backend terminal logs the Gemini AI classification result

#### 5d. Run continuous simulation (for demo)

```bash
npm start
```

This fires random sensor events every 5–15 seconds, filling up the dashboard with realistic activity.

---

### Step 6 — Run Everything Together

Open **4 terminal windows** side by side:

```
┌─────────────────────┐  ┌────────────────────-─┐
│  Terminal 1         │  │  Terminal 2          │
│  cd backend         │  │  cd web              │
│  npm run dev        │  │  npm run dev         │
│                     │  │                      │
│  → port 3000        │  │  → http://localhost: │
│  → port 1883        │  │    3001              │
└─────────────────────┘  └─────────────────────-┘

┌─────────────────────┐  ┌────────────────────-─┐
│  Terminal 3         │  │  Terminal 4          │
│  cd mobile          │  │  cd sensor-simulator │
│  npx expo start     │  │  npm run fire        │
│                     │  │                      │
│  → scan QR code     │  │  → triggers alerts   │
│    with Expo Go     │  │    in real time      │
└─────────────────────┘  └────────────────────-─┘
```

**Full end-to-end test sequence:**

1. In Terminal 4: `npm run fire`
2. Within 1 second: emergency banner flashes red at the top of the web dashboard
3. Dashboard AI feed shows "Fire Alarm — HIGH RISK" with confidence percentage
4. Mobile phone shows full-screen emergency overlay
5. Backend terminal shows Gemini AI classification log
6. Go to `/alerts` in web — the fire alarm event is listed

---

## 6. API Keys & Configuration

### Google Gemini AI (Recommended — Free)

Without a key, the system uses rule-based classification (still accurate for known event types).
With a key, you get full AI classification with confidence scores and contextual summaries.

**Steps:**
1. Go to **https://aistudio.google.com/**
2. Click **"Get API key"** in the top menu
3. Click **"Create API key"** → select a Google Cloud project (or create new)
4. Copy the key (starts with `AIzaSy...`)
5. Open `backend/.env` and set:

```env
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

6. Restart the backend: `Ctrl+C` then `npm run dev`

**Free tier limits:** 15 requests/minute · 1 million tokens/day — more than sufficient.

---

### Twilio SMS (Optional)

Sends real SMS text messages to trusted contacts when SOS is triggered or a high-risk event fires.

**Steps:**
1. Sign up at **https://www.twilio.com/try-twilio** (free trial, no credit card)
2. After verifying your phone number, go to the **Console Dashboard**
3. Copy your **Account SID** (looks like `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
4. Click **"Auth Token"** to reveal and copy it
5. Click **"Get a Twilio phone number"** and copy it (e.g., `+12025551234`)
6. Open `backend/.env` and set:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+12025551234
```

7. Restart the backend

**Without Twilio:** SMS messages are printed to the backend console as `[SMS MOCK] To: +1555... Message: EMERGENCY...`. No data is lost.

---

### Firebase Push Notifications (Optional)

Sends push notifications to Android/iOS devices even when the app is closed.

**Steps:**
1. Go to **https://console.firebase.google.com/**
2. Click **"Add project"** → enter a name → Continue through setup
3. On the project overview, click **Settings (gear icon)** → **"Project settings"**
4. Click the **"Service accounts"** tab
5. Click **"Generate new private key"** → confirm → a JSON file downloads
6. Open that JSON file — you need 3 values from it
7. Open `backend/.env` and set:

```env
FIREBASE_PROJECT_ID=your-project-id-here
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkq...\n-----END PRIVATE KEY-----\n"
```

> **Important:** The `FIREBASE_PRIVATE_KEY` value must be wrapped in double quotes and the newlines must be written as `\n` (not actual line breaks).

8. Restart the backend

**Without Firebase:** Push notifications are logged as `[PUSH MOCK]`. The app still receives real-time alerts via WebSocket when open.

---

## 7. Testing the System

### Option A — Web dashboard simulator (easiest)

1. Open **http://localhost:3001**
2. Scroll to the bottom of the Dashboard page
3. Find the **"Event Simulator"** section with 4 buttons
4. Click **"Fire Alarm"**
5. Watch the emergency banner appear at the top within 1 second

### Option B — REST API (curl commands)

```bash
# Trigger a fire alarm (high risk)
curl -X POST http://localhost:3000/api/alerts/simulate \
  -H "Content-Type: application/json" \
  -d '{"type": "fire_alarm", "location": "Kitchen"}'

# Trigger a CO alarm
curl -X POST http://localhost:3000/api/alerts/simulate \
  -H "Content-Type: application/json" \
  -d '{"type": "co_alarm", "location": "Bedroom"}'

# Trigger motion detection (medium risk)
curl -X POST http://localhost:3000/api/alerts/simulate \
  -H "Content-Type: application/json" \
  -d '{"type": "motion", "location": "Front Door"}'

# Get all alerts
curl http://localhost:3000/api/alerts

# Get only high-risk alerts
curl "http://localhost:3000/api/alerts?riskLevel=high"

# Get sensor devices
curl http://localhost:3000/api/devices

# Get user profile
curl http://localhost:3000/api/users/user_demo

# Trigger SOS
curl -X POST http://localhost:3000/api/sos/trigger \
  -H "Content-Type: application/json" \
  -d '{"userId": "user_demo", "latitude": 47.7601, "longitude": -122.2083}'
```

### Option C — MQTT sensor simulator

```bash
cd sensor-simulator
npm run fire       # Fire alarm — HIGH risk
npm run co         # CO alarm — HIGH risk
npm run motion     # Motion — MEDIUM risk
npm run doorbell   # Doorbell — MEDIUM risk
npm start          # Continuous random events
```

### Verification checklist

| Check | Expected result |
|-------|----------------|
| Backend health | `curl localhost:3000/health` → `{"status":"ok"}` |
| Web connected | Green dot next to "aadhaar.deaf.com" in sidebar |
| Alert triggers banner | Red banner appears at top of web dashboard |
| Alert in history | `/alerts` page shows the new event |
| AI classification | Backend logs show `eventType`, `riskLevel`, `confidence` |
| Mobile overlay | Full-screen emergency card on phone |

---

## 8. Web Dashboard Pages

| Page | URL | What's on it |
|------|-----|-------------|
| **Dashboard** | `/` | Live KPI cards · AI threat gauge · 6-sensor grid · real-time classification feed · 4-button event simulator |
| **Alerts** | `/alerts` | 4 KPI summary cards · risk filter tabs · expandable alert rows with AI confidence · dismiss button |
| **Devices** | `/devices` | Health ring per device · signal strength bars · click-to-expand detail panel · firmware version · add device |
| **Analytics** | `/analytics` | 7 charts: stacked bar (12h), AI radar (6-axis), accuracy area, pipeline latency waterfall, weekly line, event pie · performance table |
| **SOS Center** | `/sos` | Live GPS map · trusted contact list with send status · medical info card · SOS dispatch button · Call 911 · elapsed timer |
| **Architecture** | `/architecture` | 8-step pipeline diagram · 3-zone security model · 6-layer defense-in-depth · threat model table · full tech stack |
| **About** | `/about` | Impact stats (430M users) · 6 feature cards · 12-hour hackathon timeline · creator profile with email |
| **Profile** | `/profile` | Abhishek Deshmukh profile · alert settings toggles · trusted contacts manager · medical info · save button |
| **404** | any invalid URL | Branded not-found page with "Back to Dashboard" button |

---

## 9. Mobile App Screens

| Screen | How to reach it | What's on it |
|--------|----------------|-------------|
| **Splash** | App first open | Aadhaar logo · "Get Started" · "Sign In" |
| **Permissions** | After splash | Mic, Location, Notifications, Contacts — required vs optional labels |
| **Home** | Tab 1 | Status card · 6-sensor grid · 3 recent alerts · Fire/CO/Motion/Doorbell test buttons |
| **Emergency Overlay** | Auto — on high-risk alert | Full-screen red modal · event name · location · actions taken · SOS button · haptic pattern |
| **SOS** | SOS button anywhere | GPS map · contact list with send-status · resend button · Call 911 |
| **Alerts** | Tab 2 | Filter chips: All/High/Medium/Low · scrollable alert list with dismiss |
| **Devices** | Tab 3 | Sensor cards with toggle switches · enabled/disabled state |
| **Profile** | Tab 4 | Abhishek Deshmukh · flash lights toggle · vibration toggle · trusted contacts · About Aadhaar v1.0.0 |

---

## 10. API Reference

Base URL: `http://localhost:3000`

All endpoints that modify data accept `Content-Type: application/json`.  
Protected endpoints require: `Authorization: Bearer <token>`

Get a JWT token first:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "deshmukh.abhishek152@gmail.com", "password": "demo"}'
```

---

### Alerts

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/alerts` | List alerts. Query: `?riskLevel=high\|medium\|low` · `?limit=50` |
| `POST` | `/api/alerts/simulate` | Simulate an event. Body: `{"type": "fire_alarm", "location": "Kitchen"}` |
| `POST` | `/api/alerts/:id/dismiss` | Mark alert as resolved |

**Supported event types:**
`fire_alarm` · `co_alarm` · `glass_break` · `intruder` · `motion` · `doorbell` · `baby_cry`

---

### Devices

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/devices` | List all sensors |
| `POST` | `/api/devices` | Add sensor. Body: `{"name": "Living Room Mic", "type": "microphone", "location": "Living Room"}` |
| `PATCH` | `/api/devices/:id` | Update. Body: `{"enabled": false}` or `{"name": "...", "location": "..."}` |

---

### SOS

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/sos/trigger` | Send SOS. Body: `{"userId": "user_demo", "latitude": 47.76, "longitude": -122.20}` |

---

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users/:id` | Get profile, settings, trusted contacts |
| `PATCH` | `/api/users/:id/settings` | Body: `{"flashLights": true, "vibration": true, "watchAlerts": true}` |
| `POST` | `/api/users/:id/contacts` | Body: `{"name": "Sara R.", "relation": "Sister", "phone": "+15551234567"}` |

---

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Body: `{"name": "...", "email": "...", "password": "..."}` |
| `POST` | `/api/auth/login` | Body: `{"email": "...", "password": "..."}` → returns `{"token": "..."}` |

---

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Returns `{"status":"ok","service":"aadhar-backend"}` |

---

## 11. WebSocket Events

Connect with Socket.IO to `http://localhost:3000`.

```javascript
import { io } from "socket.io-client";
const socket = io("http://localhost:3000");
```

### Server → Client (incoming)

| Event | When it fires | Payload |
|-------|--------------|---------|
| `alerts_history` | On first connection | `AlertEvent[]` — full alert list |
| `alert` | New emergency detected | `AlertEvent` object |
| `alert_dismissed` | Alert dismissed by any client | `{ alertId: string }` |
| `smart_home_command` | High-risk alert fans out | `{ command: "flash", pattern: "SOS", color: "red" }` |
| `haptic_command` | Watch/phone haptic trigger | `{ pattern: "SOS", intensity: "high" }` |
| `sos_active` | SOS triggered by user | `{ userId, latitude, longitude, timestamp }` |

### Client → Server (outgoing)

| Event | Payload | What it does |
|-------|---------|-------------|
| `dismiss_alert` | `{ alertId: string }` | Marks alert resolved, broadcasts to all clients |
| `sos_triggered` | `{ latitude: number, longitude: number }` | Triggers SOS fan-out |

### AlertEvent shape

```typescript
{
  id: string;            // UUID
  eventType: string;     // "fire_alarm", "co_alarm", etc.
  riskLevel: "high" | "medium" | "low";
  location: string;
  summary: string;       // AI-generated description
  actions: string[];     // Recommended actions
  confidence: number;    // 0–1 AI confidence score
  deviceId: string;
  timestamp: string;     // ISO 8601
  dismissed: boolean;
}
```

---

## 12. Security Architecture

### Three-Zone Model

**Zone 1: Edge (UNTRUSTED)**

Every IoT device message is treated as potentially hostile until proven valid.

- TLS 1.3 encryption on all MQTT connections
- HMAC-SHA256 per-message signing using shared device secret
- Sequence number tracking — each device maintains a counter; any message with a repeated or skipped seq# is dropped
- Timestamp validation — messages older than 30 seconds are rejected

**Zone 2: Backend (SECURE)**

Zero-trust enforcement between every internal component.

- HMAC verification happens before any processing
- JWT authentication required on all REST endpoints
- RBAC: user / caregiver / admin roles
- Rate limiting: 200 requests per 15 minutes per IP address
- Helmet.js security headers on all HTTP responses
- No sensitive data returned in error messages

**Zone 3: Output (TRUSTED)**

Only authenticated and pre-authorized parties receive alerts.

- Trusted contacts pre-authorized by the user in the profile
- Medical info only shared during an active SOS dispatch
- Auth0-ready identity layer for enterprise/production deployment
- Full audit log of every alert dispatch

---

### HMAC Message Format

Every IoT sensor message includes an HMAC signature:

```json
{
  "deviceId": "fire_sensor_kitchen",
  "type": "fire_alarm",
  "location": "Kitchen",
  "timestamp": 1718123456789,
  "seq": 42,
  "value": 1,
  "hmac": "a3f2b1c4d5e6f7a8b9c0d1e2f3a4b5c6"
}
```

The HMAC is computed as:
```
HMAC-SHA256(
  JSON.stringify({deviceId, type, location, timestamp, seq, value}),
  MQTT_HMAC_SECRET
)
```

The broker recomputes the HMAC server-side and drops any message where they don't match.

---

### Threat Model Summary

| Threat | Severity | Mitigation |
|--------|---------|-----------|
| Replay attacks | High | Sequence numbers + 30-second timestamp window |
| Message tampering | High | HMAC-SHA256 on every payload |
| Rogue IoT device | High | Device registry whitelist + Auth0 machine tokens (production) |
| AI model poisoning | Medium | Confidence threshold gating < 60% → manual review; rule-based fallback |
| API abuse | Medium | Rate limiting 200 req/15min + JWT expiry enforcement |
| Data breach | Medium | AES-256 at rest + GDPR-compliant retention + no sensitive data in logs |

---

## 13. Deployment

### Deploy Backend — Railway (recommended, free tier)

1. Push code to GitHub
2. Go to **https://railway.app** → "New Project" → "Deploy from GitHub Repo"
3. Select your repo and set **Root Directory** to `backend`
4. Add environment variables in the Railway dashboard (same as your `.env` values)
5. Railway gives you a public URL like `https://aadhar-backend.railway.app`

### Deploy Web Dashboard — Vercel (free)

1. Go to **https://vercel.com** → "New Project" → import your GitHub repo
2. Set **Root Directory** to `web`
3. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL = https://aadhar-backend.railway.app
   ```
4. Click Deploy — your dashboard is live at `https://your-app.vercel.app`

### Publish Mobile App — Expo EAS Build

```bash
cd mobile

# Install EAS CLI
npm install -g eas-cli

# Log in to Expo account
eas login

# Configure the build
eas build:configure

# Build for both platforms
eas build --platform all

# Submit to app stores
eas submit --platform android
eas submit --platform ios
```

---

## 14. Troubleshooting

### Backend will not start

```
Error: listen EADDRINUSE :::3000
```
Another process is using port 3000.
```bash
lsof -ti:3000 | xargs kill
npm run dev
```

---

### MQTT broker port conflict

```
Error: listen EADDRINUSE :::1883
```
```bash
lsof -ti:1883 | xargs kill
npm run dev
```

---

### Web dashboard shows "Offline"

- Make sure the backend is running (Terminal 1 shows the startup messages)
- Check that `NEXT_PUBLIC_API_URL` in `web/.env.local` matches the backend port (default `3000`)
- Refresh the browser page

---

### Mobile app shows "Connecting…" forever

- Your phone must be on the **same WiFi** as your computer
- `EXPO_PUBLIC_API_URL` must use your computer's local IP, **not** `localhost`
- Find your IP:
  ```bash
  # Mac
  ifconfig | grep "inet " | grep -v 127.0.0.1
  # Windows
  ipconfig | findstr "IPv4"
  ```
- Set `EXPO_PUBLIC_API_URL=http://192.168.x.x:3000` and restart Expo

---

### Gemini AI not classifying

```
Warning: GEMINI_API_KEY not configured — using rule-based fallback
```
This is fine — the system still classifies correctly using built-in rules. To enable AI, see [Google Gemini AI](#google-gemini-ai-recommended--free) above.

---

### SMS alerts not sending

```
[SMS MOCK] Would send to +1555... : EMERGENCY ALERT...
```
This means Twilio is not configured. Alerts still work — SMS is just printed to the console. See [Twilio SMS](#twilio-sms-optional) above.

---

### npm install fails

```bash
# Clear npm cache and retry
npm cache clean --force
npm install

# If still failing, delete node_modules
rm -rf node_modules package-lock.json
npm install
```

Make sure `node --version` is v18 or newer.

---

### Sensor simulator: HMAC verification failed

The `MQTT_HMAC_SECRET` in `sensor-simulator/.env` must **exactly match** the value in `backend/.env`.

Open both files and confirm the secrets are identical character-for-character (no extra spaces or line breaks).

---

### Alert fires but no emergency banner on web

1. Open browser DevTools → Console — look for WebSocket errors
2. Check that `NEXT_PUBLIC_API_URL` points to the correct backend
3. Hard-refresh the page: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
4. The backend terminal should show `[SOCKET] Broadcasting alert to X connected clients`

---

## Contact

**Abhishek Deshmukh**  
Event: UW Bothell Hackathon — Winner

*"Aadhaar was built to solve a real human problem — not just to build impressive technology. For 430 million people who cannot hear emergencies, this is the missing safety layer."*
