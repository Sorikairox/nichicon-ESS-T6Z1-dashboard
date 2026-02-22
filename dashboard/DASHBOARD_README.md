# Echolite Dashboard

A React + TypeScript dashboard for monitoring Echolite smart home devices in real-time.

## Features

- ⚡ Built with Vite for fast development
- 🔄 Real-time updates via Server-Sent Events (SSE)
- 📱 Responsive design
- 🎨 Clean, modern UI
- 🔋 Displays battery, solar, and smart meter data
- 📊 Property visualization with units

## Prerequisites

Make sure the Echolite API is running:

```bash
cd ../api
npm run start:dev
```

The API should be running on `http://localhost:3000`

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

This will start the development server at `http://localhost:5173`

## Building for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

## Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── DeviceCard.tsx      # Device display component
│   ├── DeviceCard.css
│   ├── StatusBar.tsx       # Connection status bar
│   └── StatusBar.css
├── hooks/
│   └── useSSE.ts           # Custom hook for SSE connection
├── types.ts                # TypeScript type definitions
├── App.tsx                 # Main app component
├── App.css
├── main.tsx                # Entry point
└── index.css               # Global styles
```

## How It Works

1. **SSE Connection**: The `useSSE` hook establishes a connection to the API's SSE endpoint
2. **Initial Fetch**: Fetches current status immediately on mount
3. **Real-time Updates**: Receives updates every 30 seconds via SSE
4. **Auto-reconnect**: Automatically handles connection errors and reconnection

## API Configuration

The dashboard connects to the API at `http://localhost:3000` by default. To change this:

Edit `src/App.tsx`:

```typescript
const API_URL = 'http://your-api-url:3000/echolite/status/stream';
```

## Supported Devices

The dashboard displays data for:

- **Storage Battery (0x7D)**
  - Remaining electricity (Wh and %)
  - Battery health
  - Charging/discharging power
  - Voltage and capacity

- **Solar Power Generation (0x79)**
  - Instantaneous power generated
  - Cumulative energy
  - Energy sold

- **Smart Meter (0xA5)**
  - Operation status
  - Fault status

## Technologies Used

- React 18
- TypeScript
- Vite
- Server-Sent Events (EventSource API)
- CSS3
