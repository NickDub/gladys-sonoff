var Promise = require('bluebird');
var ping = require ("net-ping");
var util = require('util');

var powerReq = 'http://%s/cm?cmnd=Power%s';

class Sonoff {
    constructor(ip) {
        this.ip = ip;
        this.idStates = [];
    }

    addIdState(id, state) {
        this.idStates.push(id + ':' + state);
    }
}

module.exports = function () {
    // get network where is Gladys
    return getNetwork()
        .then(function (network) {
            // first, we list all connected Sonoff devices
            return listSonoffDevices(network)
                .then(function (sonoffDevices) {
                    // foreach Sonoffs, we create a device
                    return createDevices(sonoffDevices);
                })
                .catch(function (error) {
                    console.log(error);
                });
        })
        .catch(function (error) {
            console.log(error);
        });
};

function getNetwork() {
    return new Promise(function (resolve, reject) {
        gladys.machine.get()
            .then((machines) => {
                machines.forEach(machine => {
                    if (machine.me === 1) {
                        // get the first 3 parts of Gladys IP
                        var network = machine.host.split('.', 3).join('.');
                        return resolve(network);
                    }
                });
            });
        //return reject(new Error('Sonoff - No network found !'));
    });
}

function listSonoffDevices(network) {
    return new Promise(function (resolve, reject) {
        var options = {
            retries: 1,
            timeout: 2000
        };
        var session = ping.createSession (options);

        session.on ("error", function (error) {
            return reject(new Error(`Sonoff - Error: ${error}`));
        });

        var sonoffDevices = [];
        // check each IP of the network
        for (let i = 1; i < 255; i++) {
            var ip = util.format('%s.%s', network, i);

            session.pingHost(ip, function (error, target) {
                if (error) {
                    // do nothing
                } else {
                    // IP exists
                    getDevice(target)
                        .then(function (device) {
                            // add device to list
                            sonoffDevices.push(device);
                    });
                }
            });
        }

        // return list of devices
        return resolve(sonoffDevices);
    });
}

function getDevice(ip) {
    var req = util.format(powerReq, ip, '');

    return new Promise(function (resolve, reject) {
        gladys.utils.request(req)
            .then((response) => {
                var lines = response.split('\n');
                if (lines[1] && (lines[1].indexOf('ON') > 0 || lines[1].indexOf('OFF') > 0)) {
                    // device is a Sonoff
                    var device = new Sonoff(ip);

                    // check if Sonoff has 1, 2 or 4 switch(s)
                    for (let id = 1; id < 5; id++) {
                        getState(ip, id)
                            .then(function (state) {
                                device.addIdState(id, state);
                            });
                    }
                    return resolve(device);
                }
            });
    });
}

function getState(ip, id) {
    var req = util.format(powerReq, ip, id > 1 ? id : '');

    return new Promise(function (resolve, reject) {
        gladys.utils.request(req)
            .then((response) => {
                var lines = response.split('\n');
                var state = lines[1].indexOf('ON') > 0 ? 1 : 0;
                return resolve(state);
            });
    });
}

function createDevices(sonoffDevices) {
    return Promise.map(sonoffDevices, function (sonoffDevice) {
        var ip = sonoffDevice.ip;
        var idStates = sonoffDevice.idStates;

        var types = [];
        if (idStates.length === 1) {
            // define devicetype
            var idState = idStates[0].split(':');
            types.push({
                type: 'binary',
                name: 'Power',
                identifier: 'Power',
                sensor: false,
                min: 0,
                max: 1,
                value: idState[1]
            });
        } else {
            // define all devicetypes
            for (let i = 0; i < idStates.length; i++) {
                // define devicetype
                var idState = idStates[i].split(':');
                types.push({
                    type: 'binary',
                    name: 'Power' + idState[0],
                    identifier: 'Power' + idState[0],
                    sensor: false,
                    min: 0,
                    max: 1,
                    value: idState[1]
                });
            }
        }

        // create new device
        var newDevice = {
            device: {
                name: 'Sonoff',
                identifier: ip,
                protocol: 'http',
                service: 'sonoff'
            },
            types: types
        };

        return gladys.device.create(newDevice);
    });
}