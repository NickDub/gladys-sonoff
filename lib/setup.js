var Promise = require('bluebird');
var nmap = require('node-nmap');
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

module.exports = function setup() {

    // get the range of IP address
    return gladys.param.getValue('SONOFF_NETWORK')
        .then((network) => {
            return new Promise(function (resolve, reject) {
                var quickscan = new nmap.nodenmap.QuickScan(network);

                quickscan.on('complete', function (data) {
                    resolve(data);
                });

                quickscan.on('error', function (error) {
                    console.log(`Sonoff - ${error}`);
                    reject(error);
                });
            });
        })
        .then((data) => {
            return Promise.map(data, function (item) {
                return getSonoff(item.ip)
                    .then((sonoff) => {
                        if (sonoff) createDevice(sonoff);
                    }).catch((error) => {
                        console.log(`Sonoff - ${error}`);
                    });
            });
        });
};


function getSonoff(ip) {

    var req = util.format(powerReq, ip, '');

    return new Promise(function (resolve, reject) {

        gladys.utils.request(req)
            .then((response) => {
                console.log(`Sonoff - Device detected: ${item.ip}`);

                var lines = response.split('\n');
                if (lines[1] && (lines[1].indexOf('ON') > 0 || lines[1].indexOf('OFF') > 0)) {
                    console.log(`Sonoff - ${ip} is a Sonoff !`);

                    var sonoff = new Sonoff(ip);

                    // check if Sonoff has 1, 2 or 4 switch(s)
                    for (let id = 1; id < 5; id++) {
                        getState(ip, id)
                            .then(function (state) {
                                sonoff.addIdState(id, state);
                            });
                    }
                    return resolve(sonoff);
                } else {
                    console.log(`Sonoff - ${ip} is not a Sonoff !`);
                }
            }).catch((error) => {
                return reject(error);
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
            }).catch((error) => {
                return reject(error);
            });
    });
}

function createDevice(sonoffDevice) {

    var ip = sonoffDevice.ip;
    var idStates = sonoffDevice.idStates;
    var types = [];

    if (idStates.length === 1) {
        var idState = idStates[0].split(':');

        // define device
        var newDevice = {
            device: {
                name: 'Sonoff',
                identifier: ip,
                protocol: 'http',
                service: 'sonoff'
            },
            types: [{
                type: 'binary',
                name: 'Power',
                identifier: 'Power',
                sensor: false,
                min: 0,
                max: 1,
                value: idState[1]
            }]
        };

        gladys.device.create(newDevice)
            .then(() => {
                console.log(`Sonoff - Device ${ip} created with success !`);
            });
    } else {
        // define all device
        for (let i = 0; i < idStates.length; i++) {
            var idState = idStates[i].split(':');

            // define device
            var newDevice = {
                device: {
                    name: 'Sonoff',
                    identifier: ip + '_' + idState[0],
                    protocol: 'http',
                    service: 'sonoff'
                },
                types: [{
                    type: 'binary',
                    name: 'Power',
                    identifier: 'Power',
                    sensor: false,
                    min: 0,
                    max: 1,
                    value: idState[1]
                }]
            };

            gladys.device.create(newDevice)
                .then(() => {
                    console.log(`Sonoff - Device ${ip}_${idState[0]} created with success !`);
                });
        }
    }
}