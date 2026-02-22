# Echolite Smart Home Monitoring API

A NestJS-based API for monitoring smart home devices using the ECHONET Lite protocol.

## Features

- 🔌 Automatic device discovery and connection on startup
- 📊 Real-time monitoring via Server-Sent Events (SSE)
- 🔋 Support for Storage Battery, Solar Power Generation, and Smart Meter devices
- 🚀 RESTful API endpoints for on-demand status queries

## Installation

```bash
npm install
```

## Running the Application

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## API Endpoints

### 1. Get Current Status (One-time)
```bash
GET http://localhost:3000/echolite/status
```

Returns the current status of all discovered devices.

**Response:**
```json
{
  "timestamp": "2026-02-22T22:30:00.000Z",
  "connected": true,
  "devices": [
    {
      "deviceType": "Storage Battery",
      "deviceClass": "0x7d",
      "address": "192.168.0.243",
      "timestamp": "2026-02-22T22:30:00.000Z",
      "properties": {
        "remainingElectricity_Wh": {
          "value": 14500,
          "unit": "Wh",
          "code": "0xE2"
        },
        "batteryStateOfHealth": {
          "value": 100,
          "unit": "%",
          "code": "0xE5"
        }
      }
    }
  ]
}
```

### 2. Check Connection Status
```bash
GET http://localhost:3000/echolite/connection
```

Returns whether the service is connected to devices.

**Response:**
```json
{
  "connected": true
}
```

### 3. Stream Status Updates (SSE)
```bash
GET http://localhost:3000/echolite/status/stream
```

Opens a Server-Sent Events stream that emits device status every 30 seconds.

**Usage with curl:**
```bash
curl -N http://localhost:3000/echolite/status/stream
```

**Usage with JavaScript:**
```javascript
const eventSource = new EventSource('http://localhost:3000/echolite/status/stream');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('System Status:', data);
};
```

## Web Dashboard

Open `public/index.html` in your browser to view a real-time dashboard:

```bash
open public/index.html
```

The dashboard automatically connects to the SSE endpoint and displays:
- Connection status
- Real-time device properties
- Battery status, solar generation, and more
- Auto-updating every 30 seconds

## Supported Devices

### Storage Battery (0x7D)
- Operation Status
- Remaining Electricity (Wh and %)
- Battery State of Health
- Instantaneous Charging/Discharging Power
- Rated Electric Energy
- Rated Voltage
- Cumulative Charging/Discharging Energy

### Solar Power Generation (0x79)
- Operation Status
- Instantaneous Power Generated
- Cumulative Energy Generated
- Cumulative Energy Sold
- Rated Power Output

### Smart Electric Energy Meter (0xA5)
- Operation Status
- Fault Status
- Installation Location

## Configuration

The service automatically discovers devices on the local network using the ECHONET Lite protocol. The discovery runs on startup.

### Environment Variables

```bash
PORT=3000  # API server port (default: 3000)
```

## Architecture

- **EcholiteService**: Handles device discovery, connection, and property reading
- **EcholiteController**: Provides REST and SSE endpoints
- **Sequential Requests**: Respects device limitations by sending requests sequentially with 50ms delays

## Notes

- Devices are discovered automatically on startup
- Property requests are sent sequentially to avoid overwhelming embedded devices
- SSE updates are sent every 30 seconds by default
- CORS is enabled for cross-origin requests
