var log = require('../uitl/log.js');
var netbus = require('../netbus/netbus.js');
var proto_man = require('../netbus/proto_man.js');

var data = {
	uname:"sanzhixiong",
	upwd:"123456",
}

var buf = proto_man.encode_cmd(proto_man.PROTO_JSON,1,1,data);
log.info("encode_cmd"+buf);

var cmd = proto_man.decode_cmd(proto_man.PROTO_JSON,buf);
log.info("decode_cmd"+cmd['stype']);
