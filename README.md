![gladys version](https://badgen.net/badge/Gladys/%3E=%203.0.0/purple)
![license](https://badgen.net/github/license/NickDub/gladys-sonoff)
[![dependencies Status](https://badgen.net/david/dep/NickDub/gladys-sonoff)](https://david-dm.org/NickDub/gladys-sonoff)

# gladys-sonoff

Gladys module to control Sonoff over http or mqtt.

Need Gladys version >= 3.0.0.

## Prerequisites

To use this module, you must flash your Sonoff module with this firmware:  
https://github.com/arendst/Sonoff-Tasmota

## Installation

1. Install the module through Gladys modules panel and reboot Gladys when it's done. 

1. Manually add a device:  
    On the Gladys Devices screen, add a new device with the following information:  
    **Name:** what you want  
    **Identifier:**  
    + **for HTTP** : IP of the Sonoff (if device has more then 1 switch, add switch number: IP\_1, IP\_2,    ...)  
    + **for MQTT** : %topic% (of the sonoff config screen) (if device has more then 1 switch, add switch    number: %topic%\_1, %topic%\_2, ...)  

    **Protocol:** http or mqtt  
    **Service:** sonoff  
    **Room:** where is the Sonoff

    Then edit this device and add a devicetype with the following information:  
    **Identifier:** Power  
    **Type:** binary  
    **Unity:** binary  
    **Min:** 0  
    **Max:** 1

    If you want to use the Sonoff module with the MQTT protocol, config it like this:  
    **Host:** your MQTT server  
    **Port:** your MQTT server port  
    **Client:** unique name of the Sonoff  
    **User:** user name  
    **Password:** user password  
    **Topic:** unique topic name _(same as the Identifier in Gladys)_  
    **Full Topic:** leave %prefix%/%topic%/
