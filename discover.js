// Load the node-echonet-lite module
var EchonetLite = require('node-echonet-lite');

// Create an EchonetLite object for Wi-SUN Route-B
var el = new EchonetLite({
    'type'   : 'lan',
});

// Initialize the EchonetLite object
el.init((err) => {
    if(err) { // An error was occurred
        showErrorExit(err);
    } else { // Start to discover devices
        discoverDevices();
    }
});

function enumerateDevices(device, address) {
    for (const eoj of device['eoj']) {
        let group_code = eoj[0]; // Class group code
        let class_code = eoj[1]; // Class code
        console.log('Found a device (' + address + ').');
        // print class and group in hexa
        console.log('group: 0x' + group_code.toString(16) + ', class: 0x' + class_code.toString(16));
        let class_name = el.getClassName(group_code, class_code);

        el.getPropertyMaps(address, eoj, (err, res) => {
            for (const propertyCode of res['message']['data']['get']) {
                el.getPropertyValue(address, eoj, propertyCode, (err, res) => {
                    if (err) {
                        console.error(`Error getting property value: ${err.message}`);
                        return;
                    }
                    console.log(`${group_code.toString(16)}:${class_code.toString(16)}:${propertyCode.toString(16)}`);
                    console.dir(res.formatted);
                    // for (const attribute of res.structure) {
                    //     if (attribute.key === 'EPC0') {
                    //         console.log(`EPC0: ${attribute.desc}`);
                    //     }
                    // }
                });
            }
        });

    }
}

function getInt(res) {
    const maybeBuffer = res.message.prop?.[0]?.buffer;
    if (!maybeBuffer) return -1;
    const buffer = Buffer.from(maybeBuffer)
    return buffer.readUInt16BE(0)
}

// Start to discover devices
function discoverDevices() {
    // Start to discover a smart electric energy meter
    // on Wi-SUN B-route using a Wi-SUN USB dongle
    el.startDiscovery((err, res) => {
        // Error handling
        if(err) {
            showErrorExit(err);
        }
        el.stopDiscovery();
        // Determine the type of the found device

        let device = res['device'];
        let address = device['address'];
        console.log(device['eoj']);
        enumerateDevices(device, address);
        // 2:79:e0
            el.getPropertyValue(address, [2, 0x79, 1], 0xe0, (err, res) => {
                console.dir(res.message.prop[0].buffer);
                const generatedElectricity = getInt(res);
                console.log(generatedElectricity);
            })
    });
}

// Get the measured values
function getMeasuredValue(address, eoj) {
    var epc = 0xE7; // An property code which means "Measured instantaneous electric energy"
    el.getPropertyValue(address, eoj, epc, (err, res) => {
        var energy = res['message']['data']['energy'];
        console.log('Measured instantaneous electric energy is ' + energy + ' W.');
        el.close(() => {
            console.log('Closed.');
            process.exit();
        });
    });
}

// Print an error then terminate the process of this script
function showErrorExit(err) {
    console.log('[ERROR] '+ err.toString());
    process.exit();
}