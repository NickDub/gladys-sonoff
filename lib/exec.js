var util = require('util');

var regexCheckIp = '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$';

module.exports = function exec(params) {
    var ip = params.deviceType.identifier;

    if (ip.match(regexCheckIp)) {
        if (params.deviceType.type == 'binary') {
            return sendRequest(ip, params.deviceType.deviceTypeIdentifier, params.state.value === 1 ? 'On' : 'off');
        } else {
            console.log(`Sonoff - DeviceType type invalid or unknown: ${params.deviceType.type}`);
        }
    } else {
        console.log(`Sonoff - Device identifier invalid or unknown: ${ip}`);
    }

    return false;
};

function sendRequest(ip, cmd, state) {
    var req = util.format('http://%s/cm?cmnd=%s%20%s', ip, cmd, state);

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
        .catch((err) => {
            console.log(`Sonoff - Error: ${error}`);
            return false;
        });
}
