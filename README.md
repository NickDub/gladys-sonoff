# Gladys-Sonoff

Gladys hooks to control Sonoff over http.

Need Gladys version >= 3.0.0.

## Prerequisites

To use this module, you must flash your Sonoff module with this firmware:  
https://github.com/arendst/Sonoff-Tasmota

## Documentation

To install this module: 

On the Module / Advanced Gladys screen, manually install the module with the following information:  
Name: Sonoff  
Version: 0.1.0  
URL: https://github.com/NicolasD-62/gladys-sonoff.git  
Slug: sonoff  

Restart Gladys

On the Devices Gladys screen, add a new device with the following information:  
Name: What you want  
Identifier: IP of the Sonoff  
Protocol: wifi  
Service: sonoff  
Room: Where is the Sonoff

Then edit this device and add a devicetype with the following information:  
Identifier: Power (if device has more then 1 switch, add switch number: Power1, Power2, ...)  
Type: binary  
Unity: binary  
Min: 0  
Max: 1
