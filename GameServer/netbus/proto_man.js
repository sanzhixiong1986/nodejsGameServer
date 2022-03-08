/*
设计
stype:那个服务器
cmd:服务器的那个命令
body 消息结构
*/
var log = require('../uitl/log.js');
var netbus = require('./netbus.js');

var proto_man = {
	PROTO_JSON: 1,  
	PROTO_BUF: 2,
	encode_cmd: encode_cmd,
	decode_cmd: decode_cmd,
    encrypt_cmd:encrypt_cmd,
    decrypt_cmd:decrypt_cmd
};

//加密
function encrypt_cmd(str_of_buf) {
    return str_of_buf;
}

//解密
function decrypt_cmd(str_of_buf) {
    return str_of_buf;
}

//json编码
function _json_encode(stype,ctype,body){
    var cmd = {};
    cmd['stype'] = stype;
    cmd['ctype'] = ctype;
    cmd['body'] = body;
    var str = JSON.stringify(cmd);
    return str;
}

//json解码
function json_decode(cmd_json){
    let cmd = null;
    cmd = JSON.parse(cmd_json);
    if (!cmd || 
		typeof(cmd['stype'])=="undefined" ||
		typeof(cmd['ctype'])=="undefined" ||
		typeof(cmd['body'])=="undefined") {
		return null;
	}
    return cmd;
}

function get_key(stype,ctype){
    return (styp*65536+ctype);
}

/**
 * 操作
 * @param {*} proto_type 
 * @param {*} stype 
 * @param {*} ctype 
 * @param {*} body 
 */
function encode_cmd(proto_type,stype,ctype,body){
    var buf = null;
    if(proto_type == proto_man.PROTO_JSON){
        buf = _json_encode(stype,ctype,body);
    }

    if(buf){
        buf = encrypt_cmd(buf);
    }
    return buf;
}

/**
 * 解密操作
 * @param {*} proto_type 
 * @param {*} str_of_buf 
 * @returns 
 */
function decode_cmd(proto_type,str_of_buf){
    //解密
    str_of_buf = decrypt_cmd(str_of_buf);
    if(proto_type == proto_man.PROTO_JSON){
        return json_decode(str_of_buf);
    }
}

module.exports = proto_man;