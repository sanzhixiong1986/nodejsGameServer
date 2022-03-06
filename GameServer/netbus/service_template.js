var service = {
    stype:1,//服务器号码
    name:"service tempalte",
    init:function(){},

    //每个服务收到数据的跳用
    on_recv_player_cmd(session,ctype,body){
    },

    //每个服务器连接丢失的时候，被动丢失连接
    on_player_disconnect:function(session){
    }
}

module.exports = service;