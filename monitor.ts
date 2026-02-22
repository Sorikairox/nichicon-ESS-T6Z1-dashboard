// Load the node-echonet-lite module
// @ts-ignore
const EchonetLite = require('node-echonet-lite');
const { promisify } = require('node:util');

// Type definitions
interface PropertyDefinition {
    name: string;
    unit: string | null;
    type: 'status' | 'number' | 'signed' | 'code';
}

interface DeviceDefinition {
    name: string;
    properties: Record<number, PropertyDefinition>;
}

interface PropertyValue {
    value: number | Buffer | null;
    unit: string | null;
    code: string;
}

interface DeviceResult {
    deviceType: string;
    deviceClass: string;
    address: string;
    timestamp: string;
    properties: Record<string, PropertyValue>;
    errors?: string[];
}

type EOJ = [number, number, number];

interface EchonetDevice {
    address: string;
    eoj: EOJ[];
}

interface DiscoveryResponse {
    device: EchonetDevice;
}

// Create an EchonetLite object for Wi-SUN Route-B
const el = new EchonetLite({
    'type': 'lan',
});

// Promisified versions of EchonetLite methods
const initAsync = promisify(el.init.bind(el));
const closeAsync = promisify(el.close.bind(el));
const getPropertyValueAsync = promisify(el.getPropertyValue.bind(el));

// Wrapper for startDiscovery since it doesn't follow standard callback pattern
function startDiscoveryAsync(): Promise<DiscoveryResponse> {
    return new Promise((resolve, reject) => {
        el.startDiscovery((err: Error | null, res: DiscoveryResponse) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });
}

// Delay helper
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialize and start monitoring
(async () => {
    try {
        await initAsync();
        await monitorDevices();
    } catch (err) {
        showErrorExit(err as Error);
    }
})();

// Property definitions
const PROPERTY_DEFINITIONS: Record<string, DeviceDefinition> = {
    '0x7d': {
        name: 'Storage Battery',
        properties: {
            // 0x80: { name: 'operationStatus', unit: null, type: 'status' },
            0xE2: { name: 'remainingElectricity_Wh', unit: 'Wh', type: 'number' },
            0xE4: { name: 'remainingElectricity_Percent', unit: '%', type: 'number' },
            0xE5: { name: 'batteryStateOfHealth', unit: '%', type: 'number' },
            0xD3: { name: 'instantaneousChargingDischargingPower', unit: 'W', type: 'signed' },
            // 0xD0: { name: 'ratedElectricEnergy', unit: 'Wh', type: 'number' },
            // 0xD2: { name: 'ratedVoltage', unit: 'V', type: 'number' },
            // 0xE6: { name: 'batteryType', unit: null, type: 'code' },
            // 0xD6: { name: 'cumulativeDischargingEnergy', unit: 'Wh', type: 'number' },
            // 0xD8: { name: 'cumulativeChargingEnergy', unit: 'Wh', type: 'number' },
            // 0xDA: { name: 'operationMode', unit: null, type: 'code' },
            // 0x88: { name: 'faultStatus', unit: null, type: 'status' },
            // 0x81: { name: 'installationLocation', unit: null, type: 'code' }
        }
    },
    '0x79': {
        name: 'Solar Power Generation',
        properties: {
            // 0x80: { name: 'operationStatus', unit: null, type: 'status' },
            0xE0: { name: 'instantaneousPowerGenerated', unit: 'W', type: 'number' },
            // 0xE1: { name: 'cumulativeEnergyGenerated', unit: 'kWh', type: 'number' },
            // 0xE3: { name: 'cumulativeEnergySold', unit: 'kWh', type: 'number' },
            // 0xE8: { name: 'ratedPowerOutput', unit: 'W', type: 'number' },
            // 0x88: { name: 'faultStatus', unit: null, type: 'status' },
            // 0x81: { name: 'installationLocation', unit: null, type: 'code' }
        }
    },
    // '0xa5': {
    //     name: 'Low-voltage Smart Electric Energy Meter',
    //     properties: {
    //         0x80: { name: 'operationStatus', unit: null, type: 'status' },
    //         0x88: { name: 'faultStatus', unit: null, type: 'status' },
    //         0x81: { name: 'installationLocation', unit: null, type: 'code' }
    //     }
    // }
};

function parsePropertyValue(buffer: number[] | undefined, type: PropertyDefinition['type']): number | Buffer | null {
    if (!buffer) return null;

    const buf = Buffer.from(buffer);

    switch (type) {
        case 'number':
            if (buf.length === 1) return buf.readUInt8(0);
            if (buf.length === 2) return buf.readUInt16BE(0);
            if (buf.length === 4) return buf.readUInt32BE(0);
            return buf;
        case 'signed':
            if (buf.length === 2) return buf.readInt16BE(0);
            if (buf.length === 4) return buf.readInt32BE(0);
            return buf;
        case 'status':
        case 'code':
            return buf.readUInt8(0);
        default:
            return buf;
    }
}

// Sequential property fetcher - waits for each response before next request
async function getDevicePropertiesJSON(
    address: string,
    eoj: EOJ
): Promise<DeviceResult> {
    const groupCode = eoj[0];
    const classCode = eoj[1];
    const classKey = `0x${classCode.toString(16)}`;

    const deviceDef = PROPERTY_DEFINITIONS[classKey];
    if (!deviceDef) {
        throw new Error(`Unknown device class: ${classKey}`);
    }

    const result: DeviceResult = {
        deviceType: deviceDef.name,
        deviceClass: classKey,
        address: address,
        timestamp: new Date().toISOString(),
        properties: {}
    };

    const propertyKeys = Object.keys(deviceDef.properties);
    const errors: string[] = [];

    // Fetch properties sequentially
    for (const epcStr of propertyKeys) {
        const epc = parseInt(epcStr);
        const propDef = deviceDef.properties[epc];

        if (!propDef) {
            continue;
        }

        try {
            const res: any = await getPropertyValueAsync(address, eoj, epc);

            const buffer = res.message?.prop?.[0]?.buffer;
            const value = parsePropertyValue(buffer, propDef.type);

            result.properties[propDef.name] = {
                value: value,
                unit: propDef.unit,
                code: `0x${epc.toString(16).toUpperCase()}`
            };
        } catch (err) {
            errors.push(`${propDef.name}: ${(err as Error).message}`);
        }

        // Wait before sending next request (50ms delay between requests)
        await delay(50);
    }

    if (errors.length > 0) {
        result.errors = errors;
    }

    return result;
}

async function getSystemStatus(device: EchonetDevice, address: string) {
    const systemStatusJSON: Record<string, DeviceResult> = {};
    // Process devices sequentially
    for (const eoj of device.eoj) {
        if (!eoj) continue;

        try {
            const json = await getDevicePropertiesJSON(address, eoj);
            systemStatusJSON[json.deviceType] = json;
        } catch (err) {
            console.error('Error getting device properties:', err);
        }
    }
    return systemStatusJSON;
}

// Usage example
async function monitorDevices(): Promise<void> {
    try {
        const res = await startDiscoveryAsync();
        el.stopDiscovery();

        const device = res.device;
        const address = device.address;
        const systemStatus = await getSystemStatus(device, address);

        console.log('All devices processed.');
        console.log(JSON.stringify(systemStatus, null, 2));
        await closeAsync();
        process.exit(0);
    } catch (err) {
        throw err;
    }
}

// Print an error then terminate the process of this script
async function showErrorExit(err: Error): Promise<void> {
    console.log('[ERROR] ' + err.toString());
    try {
        await closeAsync();
    } catch (closeErr) {
        console.error('Error closing connection:', closeErr);
    }
    process.exit(1);
}
