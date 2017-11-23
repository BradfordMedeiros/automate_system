# automate_system
Dependency of automate_core (main web server for automate). 
This is intended to be the interface into main functionality for automate, such as hosting the mqtt broker  + protocol bridges,
being able to add statesconditions/schedules/etc as  well as environment, basesystem/engines scripting, basic logging and history, 

This library does not host general web server code, and only serves one database at a time.
This library has no concept of auxillary (but important) features such as email, tilegrid, multiple database management, 
network configuration.  Generally, outside of environmental variables, if it's not in basesystem or engines, it's probably in 
automate_core

See  automate_system/src/mapSystemToApiLayer.js for the api
