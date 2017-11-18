var Promise = require('bluebird');
var util = require('util');

module.exports = function () {
    return gladys.machine.get()
        .then((machines) => {
            machines.forEach(machine => {
                if (machine.me === 1) {
                    var network = machine.host.split('.', 3).join('.');

                    // First, we list all connected Sonoff devices
                    return listSonoffDevices(network)
                        .then(function (sonoffDevices) {
                            // foreach Sonoff, we create a device
                            return createDevices(sonoffDevices);
                        });
                }
            });
        })
        .catch((err) => {
            return null;
        });
};

function listSonoffDevices(network) {
    return new Promise(function (resolve, reject) {

        var sonoffDevices = [];
        for (let i = 1; i < 256; i++) {
            var ip = util.format('%s.%s', network, i);
            var req = util.format('http://%s/cm?cmnd=Power', ip);

            gladys.utils.request(req)
                .then((response) => {
                    console.log(`Sonoff - Device detected: ${ip}`);
                    var state = -1;
                    var lines = response.split('\n');
                    if (lines[1] == 'POWER = OFF') {
                        state = 0;
                    } else if (lines[1] == 'POWER = ON') {
                        state = 1;
                    } else {
                        console.log(`Sonoff - Error, HTTP response: ${response}`);
                        continue;
                    }
                    sonoffDevices.push(ip + ':' + state);
                })
                .catch((err) => {
                    console.log(`Sonoff - Error: ${err}`);
                });
        }

        return resolve(sonoffDevices);
    });
}

function createDevices(sonoffDevices) {
    return Promise.map(sonoffDevices, function (sonoffDevice) {
        var data = sonoffDevice.split(':');
        var ip = data[0];
        var state = data[1];

        var newDevice = {
            device: {
                name: 'Sonoff',
                identifier: ip,
                protocol: 'http',
                service: 'sonoff'
            },
            types: [{
                type: 'binary',
                name: 'power',
                identifier: 'power',
                sensor: false,
                min: 0,
                max: 1,
                value: state
            }]
        };

        return gladys.device.create(newDevice);
    });
}