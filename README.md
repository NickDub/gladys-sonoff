# Gladys-Sonoff

Gladys hooks to control Sonoff over http.

Need Gladys version >= 3.0.0.

## Prerequisites

To use this module, you must flash your Sonoff module with this firmware:  
https://github.com/arendst/Sonoff-Tasmota

Be sure nmap is installed on your system.  
If not, execute _sudo apt-get -y install nmap_ on your machine.

## Documentation

To install this module: 

Create a Gladys Param in Parametres => Parametres with name SONOFF_NETWORK.  
Put inside the IP range you want to scan at home.  
For example, you can put 192.168.1.0/25 if your IP looks like 192.168.1.1 in your local network.  
You can put several IP separated with comas.

On the Module / Advanced Gladys screen, manually install the module with the following information:  
Name: Sonoff  
Version: 0.1.0  
URL: https://github.com/NicolasD-62/gladys-sonoff.git  
Slug: sonoff  

Restart Gladys

### Automatically add a device

On the Gladys Devices screen, push "Configuration" button.

### Manually add a device

On the Gladys Devices screen, add a new device with the following information:  
Name: What you want  
Identifier: IP of the Sonoff (if device has more then 1 switch, add switch number: IP\_1, IP\_2, ...)  
Protocol: wifi  
Service: sonoff  
Room: Where is the Sonoff

Then edit this device and add a devicetype with the following information:  
Identifier: Power  
Type: binary  
Unity: binary  
Min: 0  
Max: 1
