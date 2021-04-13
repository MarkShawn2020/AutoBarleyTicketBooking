// ==UserScript==
// @name         大麦抢票-完整
// @namespace    https://www.jwang0614.top/scripts
// @version      0.0.3
// @description  辅助购买大麦网演唱会门票
// @author       Olivia Wang
// @match        https://buy.damai.cn/*
// @match        https://detail.damai.cn/*
// @match        https://seatsvc.damai.cn/*
// @grant        none
// @require      https://cdn.staticfile.org/jquery/3.5.1/jquery.min.js
// ==/UserScript==

// https://seatsvc.damai.cn/tms/selectSeat?itemId=624499596673&hasPromotion=true&performId=210252620&skuId=4427321477193&projectId=624499596673&spm=a2oeg.project.projectinfo.dbuy
// https://seatsvc.damai.cn/tms/selectSeat?itemId=624499596673&performId=210252601&skuId=4427321477292&projectId=624499596673

var version = "v0.0.3"

var $style = $('<style>'+
    '#control_container{margin: 20px 0; background:#e9e9e9;padding:20px 0;}'+
    'p{margin:10px 0;}'+
    '#control_container button{width:80%;margin:10px 10%;padding:10px 0;font-size:30px;border-style: solid;}'+
    '#start_btn{color:green;}'+
    '#end_btn{color:red;}'+
    '.input_wrapper{display: flex;justify-content:center;font-size: 16px; margin-bottom:10px;}'+
    '.notice{margin:10px 10px;padding:10px 10px;color:darkslategrey;border-style: solid; border-width: 1px; border-color:darkslategrey;}'+
    '#wx{text-align: center;}'+
    '#countdown_wrapper {display:none; font-size: 16px; text-align:center; background:#ffeaf1;}'+
    '#countdown_wrapper p{width:100%;}'+
    '#countdown {font-size: 20px; color:#ff1268;}'+
    '.warning {color:red; font-weight:400;}'+
    'h3 {font-weight:800;}'+
    '</style>');

console.log("domain1", document.domain);
document.domain = "damai.cn";
console.log("domain2", document.domain);

$(document).ready(function(){

    var curr_url = window.location.href;

    if (curr_url.includes("https://detail.damai.cn/")) {
        console.log("detail")

        var order_url = sessionStorage.getItem('order_url');

        if(order_url) {
            window.location.href = order_url;
        } else {

            if($("div.buybtn").text() == "选座购买" || $('.service-note .service-note-name').text().includes("可选座")){
                alert("无法全自动选座，具体方式请看“注意”部分。不要忘了先登录，填好联系人信息，删除多余联系人。");
                detail_seat_ui();
            } else {
                alert("不要忘了先登录，填好联系人信息，删除多余联系人");
                detail_ui();
            }
        }

    }

    if (curr_url.includes("https://buy.damai.cn/")) {
        console.log("buy")

        if($(".error-msg").length > 0) {
            window.location.reload();
        } else {
            setTimeout(fill_form, 300);
        }

    }

    if (curr_url.includes("https://seatsvc.damai.cn/")) {
        console.log("seat")

        var people_num = new URLSearchParams(window.location.href).get('people_num');

        if (people_num == 1) {
            new MutationObserver(function(mutations) {
                if (document.querySelector("#app > div.render-result-container > div.select-result")) {
                    console.log("found ele");
                    $("#app > div.render-result-container > div.select-result").bind("DOMNodeInserted", seat_click_buy_btn);
                }
            }).observe(document, {childList: true, subtree: true});

            // $("#app > div.render-result-container > div.select-result").bind("DOMNodeInserted", seat_click_buy_btn)
        } else {
            document.onkeydown = function() {
                var oEvent = window.event;
                if (oEvent.keyCode == 32) {
                    seat_click_buy_btn()
                }
            }
        }
    }



})

function seat_click_buy_btn()
{
    console.log("click buy");
    $('#app > div.render-result-container > div.select-result > div.tip-order-button > button').click();
}


//https://stackoverflow.com/a/31112615
Number.prototype.toHHMMSS = function() {
    var hours = Math.floor(this / 3600) < 10 ? ("00" + Math.floor(this / 3600)).slice(-2) : Math.floor(this / 3600);
    var minutes = ("00" + Math.floor((this % 3600) / 60)).slice(-2);
    var seconds = ("00" + (this % 3600) % 60).slice(-2);
    return hours + ":" + minutes + ":" + seconds;
};

function timedUpdate() {
    // 提前2秒开始
    var current_time = Date.now();
    var time_difference = Math.ceil((window.sellStartTime_timestamp - current_time)/1000);
    if (time_difference < 2) {
        window.location.href = window.order_url;
    } else {
        var time_difference_str = time_difference.toHHMMSS();
        $("#countdown").text(time_difference_str);

        window.timer = setTimeout(timedUpdate, 1000);

    }

}

function generate_confirm_url(event, price, people_num, data_json) {
    // console.log("event", event);
    var performBases = data_json["performBases"];
    var itemId = "";

    for(var i=0; i<performBases.length; i++) {
        // console.log("1");
        var performBase = performBases[i];
        var performs = performBase["performs"];
        for(var j=0; j<performs.length; j++) {
            // console.log("2");
            var perform = performs[j];
            if(perform["performName"] === event) {
                // console.log("3");
                itemId = perform["itemId"];
                window.itemId = itemId;
                var skuList = perform["skuList"];
                for(var k=0; k<skuList.length; k++) {
                    // console.log("4");
                    var skuList_item = skuList[k];
                    if(skuList_item["skuName"] === price) {
                        // console.log("5");
                        var skuId = skuList_item["skuId"];
                        return `https://buy.damai.cn/orderConfirm?exParams=%7B%22damai%22%3A%221%22%2C%22channel%22%3A%22damai_app%22%2C%22umpChannel%22%3A%2210002%22%2C%22atomSplit%22%3A%221%22%2C%22serviceVersion%22%3A%221.8.5%22%7D&buyParam=${itemId}_${people_num}_${skuId}&buyNow=true&spm=a2oeg.project.projectinfo.dbuy`
                        // https://buy.damai.cn/orderConfirm?exParams=%7B%22damai%22%3A%221%22%2C%22channel%22%3A%22damai_app%22%2C%22umpChannel%22%3A%2210002%22%2C%22atomSplit%22%3A%221%22%2C%22serviceVersion%22%3A%221.8.5%22%2C%22umidToken%22%3A%22T2gAPtWBhV9tC67Mptnj5AU_d_KX-57DqykfreYNo38zNk2TgBZssV-gxQlN7aEPYnPc6dXI1re5zNemlLZpfS71%22%2C%22ua%22%3A%22134%23pciI2XXwXGEkxcXNZXkwdJ0D3QROwKOlAOzBtZ26EXkEHKc8qKrQAAmvANaH6n1KGaF4vxWgMEiyvJ8h9bbkRf%2FYEV1hBueE%2BJdqKXL3ZtWwTq1qijRmNyd3OOH8qkuJ%2BJd8qcHAZXnw%2Bcy8qqK7GANE1XazXJmg%2FR%2F5Utf35L2Od6%2FG0dbS1b%2B9L5ktB6IWasdFdaIn%2BqpUTLB8ajSqUVD0dOgouDkm78TjZ0CoGokuqXVsf1xdZ9p%2Fut6sLnyD7zJR7vi3xgho3ZvGI37q7cXGmA1IjAYsrBXU2kdbCbTZygJjLhS6%2FKJ7jMrS32iAng488JzvSMYV4D5o9mt%2BYWWddusAWqInij0%2FLKPSEnpK8MgQLbC8xXqcqv9ojtBm2DseaKe6g0CAXgFjW0XXA1aAhvJVTXDVIjariuT47UsZ94G4Vve%2Byr6FmI1RmtHBHwiiTN4YufCiYcr7UMN40vCkITwrXibXJVe5IW%2BkcuFlRVaK5fToG%2BK%2FDDJNLfO7LA4OoXB5BemruIehBXZPAVBHW5VgnKKG6A7MKWG8VHBsknL77EDMTYo%2FVGR5E9KfJtMNhTuRyPEJUXqIyuBs%2BWMeerkEllrcI4tn6j%2FQvxFo%2BMmoAnu4Gz05k2yBrt45eVj3sndkBqzjSOdocl5f%2BtA18aToWalQuZqLb0x31S4Ac6ZTPkhnqSnt%2BGGodrhKgkR1IyvyfYR85d2Yxnht1kSmE7O4YIEt6srmH2We9UqUdhkkeKByPHsj4MvAe2yejlSN1HcH0Mm0K4JjF59IvjH4Aw3UKv7GGnY1EtOcPvgZ8uNf7HfoWX%3D%3D%22%7D&buyParam=624490600818_1_4598946947036&buyNow=true&spm=a2oeg.project.projectinfo.dbuy
                        // https://buy.damai.cn/orderConfirm?exParams=%7B%22damai%22%3A%221%22%2C%22channel%22%3A%22damai_app%22%2C%22umpChannel%22%3A%2210002%22%2C%22atomSplit%22%3A%221%22%2C%22serviceVersion%22%3A%221.8.5%22%2C%22umidToken%22%3A%22T2gAPtWBhV9tC67Mptnj5AU_d_KX-57DqykfreYNo38zNk2TgBZssV-gxQlN7aEPYnPc6dXI1re5zNemlLZpfS71%22%2C%22ua%22%3A%22134%23pciI2XXwXGEkxcXNZXkwdJ0D3QROwKOlAOzBtZ26EXkEHKc8qKrQAAmvANaH6n1KGaF4vxWgMEiyvJ8h9bbkRf%2FYEV1hBueE%2BJdqKXL3ZtWwTq1qijRmNyd3OOH8qkuJ%2BJd8qcHAZXnw%2Bcy8qqK7GANE1XazXJmg%2FR%2F5Utf35L2Od6%2FG0dbS1b%2B9L5ktB6IWasdFdaIn%2BqpUTLB8ajSqUVD0dOgouDkm78TjZ0CoGokuqXVsf1xdZ9p%2Fut6sLnyD7zJR7vi3xgho3ZvGI37q7cXGmA1IjAYsrBXU2kdbCbTZygJjLhS6%2FKJ7jMrS32iAng488JzvSMYV4D5o9mt%2BYWWddusAWqInij0%2FLKPSEnpK8MgQLbC8xXqcqv9ojtBm2DseaKe6g0CAXgFjW0XXA1aAhvJVTXDVIjariuT47UsZ94G4Vve%2Byr6FmI1RmtHBHwiiTN4YufCiYcr7UMN40vCkITwrXibXJVe5IW%2BkcuFlRVaK5fToG%2BK%2FDDJNLfO7LA4OoXB5BemruIehBXZPAVBHW5VgnKKG6A7MKWG8VHBsknL77EDMTYo%2FVGR5E9KfJtMNhTuRyPEJUXqIyuBs%2BWMeerkEllrcI4tn6j%2FQvxFo%2BMmoAnu4Gz05k2yBrt45eVj3sndkBqzjSOdocl5f%2BtA18aToWalQuZqLb0x31S4Ac6ZTPkhnqSnt%2BGGodrhKgkR1IyvyfYR85d2Yxnht1kSmE7O4YIEt6srmH2We9UqUdhkkeKByPHsj4MvAe2yejlSN1HcH0Mm0K4JjF59IvjH4Aw3UKv7GGnY1EtOcPvgZ8uNf7HfoWX%3D%3D%22%7D&buyParam=624490600818_1_4598946947036&buyNow=true&spm=a2oeg.project.projectinfo.dbuy

                    }
                }

            }
        }

    }
    return null;

}


function generate_seat_url(is_calendar, event, price, people_num, data_json) {
    var performBases = [];
    if(is_calendar) {
        var month = event.slice(0, 7);
        var calendarPerforms = data_json["calendarPerforms"];

        for (var i = 0; i < calendarPerforms.length; i++) {
            var calendarPerform = calendarPerforms[i];
            if (calendarPerform["month"] == month) {
                performBases = calendarPerform["performBases"];
            }
        }
    } else {
        performBases = data_json["performBases"];

    }

    var itemId = "";

    for(var i=0; i<performBases.length; i++) {
        var performBase = performBases[i];
        var performs = performBase["performs"];


        for(var j=0; j<performs.length; j++) {
            var perform = performs[j];
            var performId = perform.performId;
            var projectId = new URLSearchParams(window.location.href).get('id');
            if(perform["performName"] === event) {
                itemId = perform["itemId"];
                window.itemId = itemId;
                var skuList = perform["skuList"];
                for(var k=0; k<skuList.length; k++) {
                    var skuList_item = skuList[k];
                    if(skuList_item["skuName"] === price) {
                        var skuId = skuList_item["skuId"];
                        return `https://seatsvc.damai.cn/tms/selectSeat?itemId=${itemId}&performId=${performId}&skuId=${skuId}&projectId=${projectId}`

                    }
                }

            }
        }

    }
    return null;

}

function detail_ui() {
    var $service = $(".content-right .service");

    var $control_container = $("<div id='control_container'></div>");

    var $wx = $(`<div id="wx" class="notice"><p>公众号：伪装程序大佬(wzcxdl_cs)</p><p>完整版 ${version}</p></div>`);

    var $number_input = $('<div class="input_wrapper" id="number_input_wrapper">请输入人数：<input id="number_input" type="number" value="1" min="1" max="6"></div>');
    // var $email_input = $('<div class="input_wrapper" id="email_input_wrapper">email：<input id="email_input" type="email" value="example@hotmail.com"></div>');
    // var $name_input = $('<div class="input_wrapper" id="name_input_wrapper">联系人姓名：<input id="name_input" type="text" value="小明"></div>');
    // var $duration_input = $('<div class="input_wrapper" id="duration_input_wrapper">刷新间隔(ms)：<input id="duration_input" type="text" value="5000"></div>');

    var $start_btn = $('<button id="start_btn">开始抢票</button>');
    var $end_btn = $('<button id="end_btn">停止抢票</button>');
    var $notice = $('<div id="notice" class="notice"><h3>使用步骤</h3><p>0.登录，填写购票人信息</p><p>1.选择场次</p><p>2.选择价格</p><p>3.填写人数</p><p>4.点击‘开始抢票’</p></div>');

    var $notice2 = $('<div id="notice2" class="notice"><p>倒计时相差1-2秒是四舍五入造成的正常现象</p><p>若误差过大请校准计算机时间，刷新页面</p></div>');

    var $countdown = $('<div id="countdown_wrapper"><p id="selected_event">event1</p><p id="selected_price">price2</p><p id="selected_number">1人</p><br><p>倒计时:</p><p id="countdown">00:00:00</p></div>');

    $control_container.append($style);
    $control_container.append($wx);
    $control_container.append($number_input);
    // $control_container.append($email_input);
    // $control_container.append($name_input);
    // $control_container.append($duration_input);
    $control_container.append($start_btn);
    $control_container.append($end_btn);
    $control_container.append($notice);
    $control_container.append($notice2);
    // $control_container.append($countdown);

    $control_container.insertBefore($service);
    $countdown.insertBefore($control_container);

    $("#start_btn").click(function(){
        var event = get_event();
        var price = get_price();
        var people_num = $("#number_input").val();

        var data_json = JSON.parse($("#dataDefault").text());
        window.sellStartTime_timestamp = data_json["sellStartTime"];

        $("#selected_event").text(event);
        $("#selected_price").text(price);
        $("#selected_number").text(people_num + "人");

        $("#countdown_wrapper").show();

        console.log(data_json)

        var result = generate_confirm_url(event, price, people_num,data_json);


        if(result) {
            window.order_url = result;
            sessionStorage.setItem('order_url', result);

            console.log("countdown and go to confirm page");
            timedUpdate();


        } else {
            console.error("不知道为什么获取场次票价人数出错了呢。");
            alert("不知道为什么获取场次票价人数出错了呢。");

        }

    });

    $("#end_btn").click(function(){
        clearTimeout(window.timer);
        $("#countdown_wrapper").hide();
        sessionStorage.clear();
    });

}
// http://cncc.bingj.com/cache.aspx?q=jquery+ignore+inner+most&d=4555311081654245&mkt=en-US&setlang=en-US&w=FZ-aM6oeDz4XhBZleDN79HoRb7ybox0E
function get_text_exclude_children(css_selector_str) {
    return $(css_selector_str).contents().not($(css_selector_str).children()).text().trim();
}

function get_event() {
    var event_css_selector = ".perform__order__select.perform__order__select__performs .select_right_list .active>*";
    return get_text_exclude_children(event_css_selector);

}

function get_price() {
    var price_css_selector = ".select_right_list_item.sku_item.active .skuname";
    return get_text_exclude_children(price_css_selector);
}

function detail_seat_ui() {
    var $service = $(".content-right .service");
    var $control_container = $("<div id='control_container'></div>");


    var $wx = $(`<div id="wx" class="notice"><p>公众号：伪装程序大佬(wzcxdl_cs)</p><p>完整版 ${version}</p></div>`);
    var $number_input = $('<div class="input_wrapper" id="number_input_wrapper">请输入人数：<input id="number_input" type="number" value="1" min="1" max="6"></div>');
    var $start_btn = $('<button id="start_btn">开始抢票</button>');
    var $end_btn = $('<button id="end_btn">停止抢票</button>');
    var $notice = $('<div id="notice" class="notice"><h3>使用步骤</h3><p>0.登录，填写购票人信息</p><p>1.选择场次</p><p>2.选择价格</p><p>3.填写人数</p><p>4.点击‘开始抢票’</p></div>');

    var $notice2 = $('<div id="notice" class="notice warning"><h3>注意</h3><p>若人数为1，选座页面手动选座后自动进入下一步</p><p>人数多于1时，选座页面手动选座后点击“确认选座”按钮或按下空格键进入下一步</p></div>');
    var $notice3 = $('<div id="notice2" class="notice"><p>倒计时相差1-2秒是四舍五入造成的正常现象</p><p>若误差过大请校准计算机时间，刷新页面</p></div>');

    var $countdown = $('<div id="countdown_wrapper"><p id="selected_event">event1</p><p id="selected_price">price2</p><p id="selected_number">1人</p><br><p>倒计时:</p><p id="countdown">00:00:00</p></div>');

    $control_container.append($style);
    $control_container.append($wx);
    $control_container.append($number_input);

    $control_container.append($start_btn);
    $control_container.append($end_btn);
    $control_container.append($notice);
    $control_container.append($notice2);
    $control_container.append($notice3);

    $control_container.insertBefore($service);
    $countdown.insertBefore($control_container);

    $("#start_btn").click(function(){
        var event = get_event();
        var price = get_price();
        var people_num = $("#number_input").val();


        var data_json = JSON.parse($("#dataDefault").text());
        window.sellStartTime_timestamp = data_json["sellStartTime"];

        $("#selected_event").text(event);
        $("#selected_price").text(price);
        $("#selected_number").text(people_num + "人");

        $("#countdown_wrapper").show();

        if($("#dataDefault").text().includes("calendarPerforms")) {
            var result = generate_seat_url(true, event, price, people_num,data_json);

        } else {
            var result = generate_seat_url(false, event, price, people_num,data_json);

        }



        if(result) {
            window.order_url = `${result}&people_num=${people_num}`;
            sessionStorage.setItem('seat_url', result);


            console.log("countdown and go to confirm page");
            timedUpdate();


        } else {
            console.error("不知道为什么获取场次票价人数出错了呢。");
            alert("不知道为什么获取场次票价人数出错了呢。");

        }

    });

    $("#end_btn").click(function(){
        clearTimeout(window.timer);
        $("#countdown_wrapper").hide();
        sessionStorage.clear();
    });

}


function check_alert() {
    var alerts = $(".next-dialog-alert");
    if(alerts.length > 0 || window.current_time >= window.max_time) {
        window.location.reload();
    } else {
        window.current_time = window.current_time + 500;
        setTimeout(check_alert, 500);
    }
}

function fill_form() {

    var buyer_number = parseInt($(".ticket-buyer-title em").text());
    window.buyer_number = buyer_number;
    window.curr_buyer = 0;
    console.log(buyer_number);
    var buyer_list = $(".buyer-list-item input");
    for(var i=0; i < buyer_number; i++) {
        console.log(buyer_list[i]);
        buyer_list[i].click();
    }

    setTimeout(submit_order, 200);

}

function submit_order() {
    $(".submit-wrapper button").click();
    setTimeout(check_alert, 500);

}
