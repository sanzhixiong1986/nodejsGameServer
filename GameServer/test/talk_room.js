var log = require("../uitl/log.js");
var proto_man = require("../netbus/proto_man.js");

const STYPE_TALKROOM = 1;//作为主服务器的id号，1号服务器是聊天
const STYPE_NAMES = "talk room";

//规定对应的消息
var TalkCmd = {
	Enter: 1, 		// 用户进入
	Exit: 2, 		//用户离开
	UserArrived: 3, 	//别的用户进来
	UserEixt: 4, 	//别人离开
	SendMsg: 5, //自己发送消息
	UserMsg: 6, //收到别人的发送消息
}

//返回
var Response = {
	ok: 1,
	IS_IN_TALKROOM: -100,//用户在房间内
	NOT_IN_TALKROOM: -101,//不再房间内
	INVALD_OPT: -102,//玩家非法操作
	INVALID_PARAMS: -103,//命令格式不对
}

//用户进来
var room = {};//对用户进行管理
function on_user_enter_talkroom(session, body) {
	//对数据进行判断出错的可能性
	if (typeof (body.uname) == "undefined" || typeof (body.usex) == "undefined") {
		session.send_cmd(STYPE_TALKROOM, TalkCmd.Enter, Response.INVALID_PARAMS);
		return;
	}
	//判断是否在房间
	if (room[session.session_key]) {
		session.send_cmd(STYPE_TALKROOM, TalkCmd.Enter, Response.IS_IN_TALKROOM);
		return;
	}
	//恭喜你进来了
	session.send_cmd(STYPE_TALKROOM, TalkCmd.Enter, Response.ok);
	//发送消息给其他人
	broadcast_cmd(TalkCmd.UserArrived, body, session);

	//所有的聊天发送给刚来的人
	for (var key in room) {
		session.send_cmd(STYPE_TALKROOM, TalkCmd.UserArrived, room[key].info);
	}

	//保存玩家信息
	var talkman = {
		session: session,
		uinfo: body,
	}
	room[session.session_key] = talkman;
}

/**
 * 是否离开
 * @param {*} session			客户端的session 
 * @param {*} is_lost_connect 	是否是主动离开
 */
function on_user_exit_room(session, is_lost_connect) {
	//我不在聊天室
	if (!room[session.session_key] && !is_lost_connect) {
		session.send_cmd(STYPE_TALKROOM, TalkCmd.Exit, Respones.NOT_IN_TALKROOM);
		return;
	}

	//广播到所有人有人离开
	broadcast_cmd(TalkCmd.UserEixt, room[session.session_key].info, session);

	//列表中要删除
	room[session.session_key] = null;
	delete room[session.session_key];
	//end

	if (!is_lost_connect) {
		session.send_cmd(STYPE_TALKROOM, TalkCmd.Exit, Respones.ok);
	}
}

/**
 * 发送消息
 * @param {*} session	客户端引用 
 * @param {*} body 		发送过来的消息
 */
function on_user_send_msg(session, body){
	if(!room[session.session_key]){
		session.send_cmd(STYPE_TALKROOM, TalkCmd.SendMsg, {
			0: Respones.INVALD_OPT,
		});
		return;
	}

	session.send_cmd(STYPE_TALKROOM, TalkCmd.SendMsg,{
		"state":Respones.ok,
		"uname":room[session.session_key].info.uname,
		"sex":room[session.session_key].info.sex,
		"msg":body,
	})

	//转发
	broadcast_cmd(TalkCmd.UserMsg,{
		"uname":room[session.session_key].info.uname,
		"usex":room[session.session_key].info.usex,
		"msg":body,
	})
}

//所有的循环
function broadcast_cmd(ctype, body, noto_user) {
	//json操作
	var json_encoded = null;
	for (var key in this.room) {
		//不包括自己
		if (room[key].session == noto_user) {
			continue;
		}
		var seesion = room[key].session;
		if (session.proto_type == proto_man.PROTO_JSON) {
			if (json_encoded == null) {
				json_encoded = proto_man.encode_cmd(
					proto_man.PROTO_JSON,
					STYPE_TALKROOM,
					ctype,
					body
				)
				session.send_encoded_cmd(json_encoded);
			}
		}
	}
}

var service = {
	stype: STYPE_TALKROOM, // 服务号
	name: STYPE_NAMES, // 服务名称

	// 每个服务初始化的时候调用
	init: function () {
		log.info(this.name + " services init!!!");
	},

	// 每个服务收到数据的时候调用
	on_recv_player_cmd: function (session, ctype, body) {
		log.info(this.name + " on_recv_player_cmd: ", ctype, body);
		//收到消息进行判断
		switch (ctype) {
			case TalkCmd.Enter:
				on_user_enter_room(session, body);
				break;
			case TalkCmd.Exit://主动离开房间（重点）
				on_user_exit_room(session, false);
				break;
			case TalkCmd.SendMsg:
				on_user_send_msg(session, body);
				break;
		}
		var cmd_buf = proto_man.encode_cmd(proto_man.PROTO_JSON, 1, 2, "Hello Talk room from ws!!!");
		session.send(STYPE_TALKROOM,);
	},

	// 每个服务连接丢失后调用,被动丢失连接
	on_player_disconnect: function (session) {
		log.info(this.name + " on_player_disconnect: ", session.session_key);
		on_user_exit_room(session, true);
	},
};

module.exports = service;