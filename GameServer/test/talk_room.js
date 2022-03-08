var log = require("../uitl/log.js");
var proto_man = require("../netbus/proto_man.js");

var service = {
	stype: 1, // 服务号
	name: "talk room", // 服务名称

	// 每个服务初始化的时候调用
	init: function () {
		log.info(this.name + " services init!!!");			
	},

	// 每个服务收到数据的时候调用
	on_recv_player_cmd: function(session, ctype, body) {
		log.info(this.name + " on_recv_player_cmd: ", ctype, body);
        	
        var cmd_buf = proto_man.encode_cmd(proto_man.PROTO_JSON, 1, 2, "Hello Talk room from ws!!!");
	    session.send(cmd_buf);	
	},

	// 每个服务连接丢失后调用,被动丢失连接
	on_player_disconnect: function(session) {
		log.info(this.name + " on_player_disconnect: ", session.session_key);	
	},
};

module.exports = service;