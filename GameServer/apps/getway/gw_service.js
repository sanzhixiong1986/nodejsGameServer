const netbus = require('../../netbus/netbus.js');
const proto_man = require('../../netbus/proto_man');
const log = require('../../uitl/log.js');
//使用模版
var service = {

    //收到客户端数据
    on_recv_player_cmd:function(session,stype,ctype,body,utag,proto_type,raw_cmd) {
        log.info(raw_cmd);
        var server_session = netbus.getServerSession(stype);
        if(!server_session){
            return;
        }
        server_session.send_encoded_cmd(raw_cmd);
    },

    //收到我们链接的服务器返回给我们的数据
    on_recv_server_return: function (session, stype, ctype, body, utag, proto_type, raw_cmd) {
        log.info(raw_cmd);
        var client_session = netbus.get_client_session(utag);
        client_session.send_encoded_cmd(raw_cmd);
    },

    //收到客户端断开链接
    on_player_disconnect: function(stype, session) {
        var server_session = netbus.get_server_session(stype);
        if(!server_session){
            return;
        }
        let utag = session.session_key;
        server_session.send_cmd(stype,proto_man.GW_Diconnect,null,utag, proto_man.PROTO_JSON)
    }

}

model.exports = service;