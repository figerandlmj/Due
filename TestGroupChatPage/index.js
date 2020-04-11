// import Due from './core/index.js';
import Due from '../core/index.js';
// var chat = new Vue({
var chat = new Due({
    // el: "#chat",
    el: "chat",
    data: {
        name: "",
        msgList: [],
        sendText: ""
    },
    methods: {
        sendMsg: function () {
            axios({
                method: "get",
                url: "https://developer.duyiedu.com/edu/groupChat/sendMsg?name=" + this.name + "&msg=" + this.sendText
            }).then(function (resp) {
                console.log("发送成功");
            }, (resp) => {
                console.log(resp);
            }).catch(function (resp) {
            });
            this.sendText = "";
        }
    },
    computed: {
        getDate: function () {
            return function (time) {
                var date = new Date(time);
                return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
            }
        }
    },
    created: function () {
        setInterval(function () {
            axios({
                method: "get",
                url: "https://developer.duyiedu.com/edu/groupChat/getMsgList"
            }).then(function (resp) {
                var needScroll = false;
                var ul = document.getElementsByTagName("ul")[0];
                if (ul.scrollTop == ul.scrollHeight) {
                    needScroll = true;
                }
                chat.msgList = resp.data;
                if (needScroll) {
                    ul = document.getElementsByTagName("ul")[0];
                    ul.scrollTop = ul.scrollHeight;
                }
            }).catch(function () {
                console.log("发送失败");
            });
        }, 1000);
    }
});