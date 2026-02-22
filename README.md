# Echolite Home Battery Monitoring System

A comprehensive monitoring system for the **Nichicon ESS-T6Z1** home battery storage system using the ECHONET Lite protocol. This project provides real-time monitoring of battery status, solar power generation, and energy metrics through a modern web dashboard.

## Quick Start

### Prerequisites

- Node.js (v18+)
- pnpm (v10.11.0+)
- Nichicon ESS-T6Z1 system connected to your local network
- Network access to ECHONET Lite devices

### Running the System

**1. Install dependencies (first time only):**

```bash
# Install root dependencies
pnpm install

# Install API dependencies
cd api
npm install

# Install dashboard dependencies
cd ../dashboard
npm install
```

**2. Start the API server:**

```bash
cd api
npm run start:dev
```

The API will be available at `http://localhost:3000`

**3. Start the dashboard (in a new terminal):**

```bash
cd dashboard
npm run dev
```

The dashboard will be available at `http://localhost:5173`

**4. Monitor devices via CLI (optional):**

```bash
# From the root directory
pnpm run monitor
```

## What Data is Visible

### Battery Storage (ESS-T6Z1)

- **Remaining Electricity**: Current charge in Wh and percentage
- **State of Health**: Battery health status (%)
- **Instantaneous Power**: Current charging (+) or discharging (-) power in watts
- **Real-time Status**: Updated every 30 seconds via live dashboard

### Solar Power Generation

- **Instantaneous Power**: Current solar generation in watts
- **Live Production**: Real-time monitoring of solar output

### Screenshots

[Screenshot: Dashboard Overview - Shows connection status and all devices]
<img width="1920" height="1028" alt="Screenshot 2026-02-22 at 22 28 19" src="https://github.com/user-attachments/assets/5f315ab6-8005-4dcf-b589-52707e1c1d30" />

## Architecture

### System Overview

```
┌─────────────────┐
│  Nichicon       │
│  ESS-T6Z1       │◄────┐
│  Home Battery   │     │
└─────────────────┘     │
                        │ ECHONET Lite
┌─────────────────┐     │ Protocol (LAN)
│  Solar Power    │     │
│  Generation     │◄────┤
└─────────────────┘     │
                        │
        ┌───────────────┴────────────┐
        │                            │
        │   Echolite System          │
        │                            │
        │  ┌──────────────────────┐  │
        │  │  NestJS API          │  │
        │  │  (Port 3000)         │  │
        │  │                      │  │
        │  │  • Device Discovery  │  │
        │  │  • REST Endpoints    │  │
        │  │  • SSE Streaming     │  │
        │  └──────┬───────────────┘  │
        │         │ HTTP/SSE         │
        │  ┌──────┴───────────────┐  │
        │  │  React Dashboard     │  │
        │  │  (Port 5173)         │  │
        │  │                      │  │
        │  │  • Real-time Updates │  │
        │  │  • Device Cards      │  │
        │  │  • Connection Status │  │
        │  └──────────────────────┘  │
        └────────────────────────────┘
```

### Project Structure

```
echolite/
├── api/                      # NestJS backend API
│   ├── src/
│   │   ├── echolite/        # ECHONET Lite module
│   │   │   ├── echolite.controller.ts  # REST & SSE endpoints
│   │   │   ├── echolite.service.ts     # Device communication logic
│   │   │   └── echolite.module.ts      # Module configuration
│   │   └── main.ts          # Application entry point
│   └── package.json
│
├── dashboard/               # React + TypeScript frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── DeviceCard.tsx    # Device display component
│   │   │   └── StatusBar.tsx     # Connection status
│   │   ├── hooks/
│   │   │   └── useSSE.ts         # Server-Sent Events hook
│   │   ├── types.ts         # TypeScript definitions
│   │   └── App.tsx          # Main application
│   └── package.json
│
├── monitor.ts               # CLI monitoring script
├── discover.js              # Device discovery utility
└── package.json             # Root package configuration
```

### Technology Stack

#### Backend (API)
- **NestJS**: Modern Node.js framework for the API server
- **node-echonet-lite**: ECHONET Lite protocol implementation
- **Server-Sent Events (SSE)**: Real-time data streaming
- **TypeScript**: Type-safe development

#### Frontend (Dashboard)
- **React 18**: UI framework
- **TypeScript**: Type safety and developer experience
- **Vite**: Fast build tool and dev server
- **EventSource API**: SSE client for real-time updates
- **CSS3**: Modern styling

#### Protocol
- **ECHONET Lite**: Japanese smart home protocol standard
- **LAN Communication**: Local network device discovery
- **Sequential Requests**: 50ms delays between requests to respect device limitations

### Data Flow

1. **Device Discovery**
   - API starts and initiates ECHONET Lite device discovery
   - Discovers ESS-T6Z1 battery and solar devices on local network
   - Stores device addresses and capabilities

2. **Real-time Monitoring**
   - Dashboard connects to API via SSE endpoint
   - API polls devices every 30 seconds for current status
   - Properties read sequentially with 50ms delays between requests
   - Data streamed to dashboard via SSE

3. **Data Processing**
   - Raw ECHONET Lite property codes (EPCs) mapped to human-readable names
   - Binary buffers parsed according to property type (unsigned, signed, status codes)
   - JSON formatted with values, units, and property codes
   - Timestamp added for each reading

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/echolite/status` | GET | Current device status (one-time) |
| `/echolite/status/stream` | GET | SSE stream with updates every 30s |
| `/echolite/connection` | GET | Check connection status |

### Key Design Decisions

1. **Sequential Requests**: ECHONET Lite devices (especially ESS-T6Z1) are embedded systems with limited processing power. Requests are sent sequentially with delays to prevent overwhelming the device.

2. **SSE over WebSocket**: Server-Sent Events provide simpler one-way communication for status updates, with automatic reconnection handling.

3. **Monorepo Structure**: Keeps API and dashboard together while maintaining clear separation of concerns.

4. **Type Safety**: Full TypeScript implementation ensures data consistency between backend and frontend.

## Supported ECHONET Lite Devices

### Storage Battery (0x7D) - Nichicon ESS-T6Z1
- Property 0xE2: Remaining electricity (Wh)
- Property 0xE4: Remaining electricity (%)
- Property 0xE5: Battery state of health (%)
- Property 0xD3: Instantaneous charging/discharging power (W)

### Solar Power Generation (0x79)
- Property 0xE0: Instantaneous power generated (W)

## Development

### CLI Monitoring Tool

```bash
pnpm run monitor
```

Outputs JSON with current device status to console.

### Device Discovery

```bash
node discover.js
```

Enumerates all ECHONET Lite devices and their properties on the network.

### API Development

```bash
cd api
npm run start:dev    # Watch mode with auto-reload
npm run build        # Production build
npm run start:prod   # Run production build
```

### Dashboard Development

```bash
cd dashboard
npm run dev          # Development server with HMR
npm run build        # Production build
npm run preview      # Preview production build
```

## Configuration

### API Configuration
- Default port: 3000
- CORS enabled for cross-origin requests
- SSE update interval: 30 seconds

### Dashboard Configuration
Edit `src/App.tsx` to change API URL:
```typescript
const API_URL = 'http://localhost:3000/echolite/status/stream';
```

## Troubleshooting

**Devices not discovered:**
- Ensure ESS-T6Z1 is connected to the same network
- Check that ECHONET Lite is enabled on your Nichicon system
- Verify no firewall is blocking UDP broadcasts

**API connection errors:**
- Confirm API is running on port 3000
- Check network connectivity between API and devices
- Review API logs for ECHONET Lite errors

**Dashboard not updating:**
- Verify SSE connection in browser dev tools (Network tab)
- Ensure API is running and accessible
- Check browser console for connection errors

## License

ISC

## Notes

- Property requests respect the ESS-T6Z1's processing limitations with sequential execution
- The system uses the ECHONET Lite LAN protocol, not Wi-SUN
- Real-time updates are push-based via SSE for efficient data delivery
- All timestamps are in ISO 8601 format (UTC)
