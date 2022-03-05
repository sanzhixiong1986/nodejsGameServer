var netbus = require("../netbus/netbus.js");


//netbus.start_tcp_server("127.0.0.1", 6080, netbus.PROTO_BUF);
// netbus.start_tcp_server("127.0.0.1", 6080, netbus.PROTO_JSON);
 netbus.start_ws_server("127.0.0.1", 6081, netbus.PROTO_JSON);
//netbus.start_ws_server("127.0.0.1", 6081, netbus.PROTO_BUF);
