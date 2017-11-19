var util = require('util');

var regexCheckIp = '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$';
var powerReq = 'http://%s/cm?cmnd=Power%s%20%s';

module.exports = function exec(params) {

    var identifier = params.deviceType.identifier.split('_');
    var ip = identifier[0];
    var id = identifier.length > 1 ? identifier[1] : '';

    if (ip.match(regexCheckIp)) {
        if (params.deviceType.type == 'binary') {
            return sendRequest(ip, id, params.state.value === 1 ? 'on' : 'off');
        } else {
            console.log(`Sonoff - DeviceType type invalid or unknown: ${params.deviceType.type}`);
        }
    } else {
        console.log(`Sonoff - Device identifier invalid or unknown: ${ip}`);
    }

    return false;
};

function sendRequest(ip, id, state) {

    var req = util.format(powerReq, ip, id, state);
    console.log(`Sonoff - Sending ${req}`);

    return gladys.utils.request(req)
        .then((response) => {
            var lines = response.split('\n');
            var state = lines[1];
            console.log(`Sonoff - New state: ${state}`);

            if (state == 'POWER = OFF') {
                return 0;
            } else if (state == 'POWER = ON') {
                return 1;
            } else {
                console.log(`Sonoff - HTTP response: ${response}`);
                return false;
            }
        })
        .catch((error) => {
            console.log(`Sonoff - Error: ${error}`);
            return false;
        });
}
