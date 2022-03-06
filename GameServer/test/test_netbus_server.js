var netbus = require("../netbus/netbus.js");
var proto_man = require("../netbus/proto_man.js");
var service_manager = require("../netbus/service_manager.js");
var talk_room = require("./talk_room");
netbus.start_ws_server("127.0.0.1", 6081, proto_man.PROTO_JSON);

service_manager.register_service(1, talk_room);
