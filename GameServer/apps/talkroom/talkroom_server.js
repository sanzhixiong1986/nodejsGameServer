var proto_man = require("../../netbus/proto_man.js");
var netbus = require("../../netbus/netbus.js");
var service_manager = require("../../service_manager.js");
var talk_room = require("../../talk_room.js");

netbus.start_ws_server("127.0.0.1",6084,proto_man.PROTO_JSON, false);

service_manager.register_service(1,talk_room);
