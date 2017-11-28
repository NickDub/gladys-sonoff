# Gladys-Sonoff

Gladys hooks to control Sonoff over http or mqtt.

Need Gladys version >= 3.0.0.

## Prerequisites

To use this module, you must flash your Sonoff module with this firmware:  
https://github.com/arendst/Sonoff-Tasmota

## Documentation

To install this module:

On the Module / Advanced Gladys screen, manually install the module with the following information:  
**Name:** Sonoff  
**Version:** 0.1.0  
**URL:** https://github.com/NicolasD-62/gladys-sonoff.git  
**Slug:** sonoff  

Restart Gladys

To manually add a device:

On the Gladys Devices screen, add a new device with the following information:  
**Name:** What you want  
**Identifier:**  
+ **for HTTP** : IP of the Sonoff (if device has more then 1 switch, add switch number: IP\_1, IP\_2, ...)  
+ **for MQTT** : %topic% (of the sonoff config screen) (if device has more then 1 switch, add switch number: %topic%\_1, %topic%\_2, ...)  

**Protocol:** http or mqtt  
**Service:** sonoff  
**Room:** Where is the Sonoff

Then edit this device and add a devicetype with the following information:  
**Identifier:** Power  
**Type:** binary  
**Unity:** binary  
**Min:** 0  
**Max:** 1

If you want to use the Sonoff module with the MQTT protocol, config it like this:  
**Host:** Your MQTT server  
**Port:** Your MQTT server port  
**Client:** Unique name of the Sonoff  
**User:** User name  
**Password:** User password  
**Topic:** Unique topic name _(same as the Identifier in Gladys)_  
**Full Topic:** Leave %prefix%/%topic%/
