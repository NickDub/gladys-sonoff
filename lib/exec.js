module.exports = function exec(params) {
    var regexCheckIp = "^(25[0–5]|2[0–4][0–9]|[01]?[0–9][0–9]?).(25[0–5]|2[0–4][0–9]|[01]?[0–9][0–9]?).(25[0–5]|2[0–4][0–9]|[01]?[0–9][0–9]?).(25[0–5]|2[0–4][0–9]|[01]?[0–9][0–9]?)$";
    var ip = params.identifier;

    if (ip.match(regexCheckIp)) {
        var req = "http://" + ip + "/cm?cmnd=Power%20";

        switch (params.state.value) {
            case 0:
                gladys.utils.request(req + "off");
                console.log(`Sonoff - Sending ${req}off`);
                break;

            case 1:
                gladys.utils.request(req + "On");
                console.log(`Sonoff - Sending ${req}On`);
                break;

            default:
                console.log(`Sonoff - Wrong data send to Sonoff : ${value}`);
        }
    } else {
        console.log(`Sonoff - Device identifier invalid or unknown`);
    }

    return;
};
