var ws = require('ws');
var proto_man = require('../netbus/proto_man.js');

var sock = new ws("ws://127.0.0.1:6081");
sock.on("open", function () {
	console.log("connect success !!!");
	var cmd_buf = proto_man.encode_cmd(proto_man.PROTO_JSON, 1, 2, "Hello Talk room from ws!!!");
	sock.send(cmd_buf);	
});

sock.on("error", function(err) {
	console.log("error: ", err);
});

sock.on("close", function() {
	console.log("close");
});

sock.on("message", function(data) {
	console.log(data);
});