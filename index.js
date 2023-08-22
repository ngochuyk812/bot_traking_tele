const express = require('express')
const expressApp = express()
const axios = require("axios");
const path = require("path")
const port = process.env.PORT || 3000;
expressApp.use(express.static('static'))
expressApp.use(express.json());
var request = require('request');
const crypto = require('crypto');
var webdriver = require('selenium-webdriver');
require('dotenv').config();
const chrome = require('selenium-webdriver/chrome');

const { Telegraf } = require('telegraf');
const { log } = require('console');

const bot = new Telegraf(process.env.BOT_TOKEN);
let arrUser = ["1444108975","5423842710"]
expressApp.get("/", (req, res) => {

});
//get sàn : cex_dict.0x77d0e608f09e1761da857b16146e21fcf0d7b7a2.name
bot.launch()
// const message = '<i>A new transaction (<a href="https://etherscan.io/tx/0x6f1c57db0983278dc8b727cdc7eef76dab271d20719debf0899c22a28d24d5a6">Etherscan</a>) \n</i> '+
//     '<i><b>Binance</b> send 5 ETH (price) to <b>0xsdsdb210...</b> </i>';

// bot.telegram.sendMessage("5423842710",message,  { parse_mode: 'HTML', disable_web_page_preview: true });

const filterBy = (history, min)=>{
    return arr = history.filter(tmp=>{
        let money = tmp.receives.length > 0 ? tmp.receives[0] : tmp.sends[0]
        let price = 0
        if(money?.amount && money?.price)
        price = money.amount * money.price
        if(price > Number(min))
        return tmp
    })
}
let USDollar = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

// runChatBot()
function generateRandomString() {
    const hash = '0c4f70999c484547a61b11375ae2b9a6';

    // Chuyển đổi mã hash thành buffer
    const buffer = Buffer.from(hash, 'hex');
  
    // Tạo chuỗi ngẫu nhiên từ buffer
    const randomString = crypto.randomBytes(buffer.length).toString('hex');
  
    return randomString;
  }
  
const getNameTokenById = async (id)=>{
    const resp = await fetch('https://etherscan.io/address/'+id);
    let text = await resp.text();
      let name = text.split("title>")[1]
      return name.split("|")[0].trim();
}
  const usignRequst = async(id, min)=>{
    console.log("Start Get Data", id, min);
    let getNameById = await getNameTokenById(id)
    var headers = {
        'authority': 'api.debank.com',
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9,vi;q=0.8',
        'account': '{"random_at":1691978250,"random_id":"'+generateRandomString()+'","user_addr":null}',
        'origin': 'https://debank.com',
        'referer': 'https://debank.com/',
        'sec-ch-ua': '"Not/A)Brand";v="99", "Google Chrome";v="115", "Chromium";v="115"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'source': 'web',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'x-api-nonce': generateRandomString(),
        'x-api-sign': generateRandomString(),
        'x-api-ts': generateRandomString(),
        'x-api-ver': 'v2'
    };
    
    var options = {
        url: 'https://api.debank.com/history/list?user_addr='+id+'&chain=&start_time=0&page_count=20',
        headers: headers
    };
    
    function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log("Send data success");
            let res = JSON.parse(body)?.data

            if(res){
                let nameSan = res.cex_dict  
                for (const property in nameSan) {
                     nameSan = nameSan[property]?.name
                     break
                  }
                let listTokenId = res.token_dict
                let history = res?.history_list
                let tokenDetail = res?.token_dict
                let filterData =filterBy(history, min)
                filterData.map(tmp=>{
                    console.log("Send");
                    let money = tmp.receives.length > 0 ? tmp.receives[0] : tmp.sends[0]
                    let tokenName = money.token_id
                    if(tokenName.includes("0x")){
                        tokenName = listTokenId[tokenName]?.name
                    }
                    let price = 0
                    if(money.amount && money.price)
                    price = money.amount * money.price

                    const message = '<i>A new transaction (<a href="https://etherscan.io/tx/'+tmp.id+'">Etherscan</a>) \n</i> '+
                    '<i><b>'+getNameById+'</b> send '+(USDollar.format(money.amount) + "").replace('$', "").split('.')[0]+' '+tokenName+' ('+(USDollar.format(price) + "").split('.')[0]+') to <b>'+tmp.other_addr?.substring(0,6)+'...</b> </i>';
                    arrUser.map(tmp=>{
                        bot.telegram.sendMessage(tmp,message,  { parse_mode: 'HTML', disable_web_page_preview: true });
                    })
                })
            }
        }
    }
    
    request(options, callback);
}
bot.command('huongdan', (msg) => {
    const chatId = msg.chat.id;
    console.log("sdsdsdasda");
    // send a message to the chat acknowledging receipt of their message
    
    bot.telegram.sendMessage(chatId, "Đăng ký theo dõi địa chỉ: register|address-minPrice   Ví dụ: register|0x28c6c06298d514db089934071355e5743bf21d60-1000000" );
    bot.telegram.sendMessage(chatId, "Hủy theo dõi địa chỉ: remove|address    Ví dụ: remove|0x28c6c06298d514db089934071355e5743bf21d60"  );
    bot.telegram.sendMessage(chatId, "Xem danh sách ví đang theo dõi: /list"  );

  });
let listInterval = []
bot.command('list', (msg) => {
    const chatId = msg.chat.id;
    console.log("sdsdsdasda");
    let message = '<i>Danh sách ví đang theo dõi \n</i>';

    listInterval.map(tmp=>{
        message += "<i>" + tmp.id + "\n </i>"
    })
    // send a message to the chat acknowledging receipt of their message
    arrUser.map(tmp=>{
        bot.telegram.sendMessage(tmp,message,  { parse_mode: 'HTML', disable_web_page_preview: true });
    })

  });

bot.on((msg) => {
    let action = msg.message.text.split("|")[0]
    let mess =msg.message.text.split("|")[1]
    if(action === "register"){
        mess = mess.split("-")
        if(mess.length === 2 && !Number.isNaN(Number(mess[1]))){
            if(listInterval.filter(tmp=>tmp.id === mess[0]).length !== 0){
                bot.telegram.sendMessage(msg.message.from.id, "Địa chỉ ví đã đăng ký theo dõi trước đó")
                return
            }
            usignRequst(mess[0], Number(mess[1]))
            const interval =  setInterval(()=>{
                                console.log("Get Data.....: ",mess[0] );
                                usignRequst(mess[0], Number(mess[1]))
                            }, 40000)
            listInterval.push({id: mess[0],interval});
            bot.telegram.sendMessage(msg.message.from.id, "Đăng ký theo dõi địa chỉ ví " + mess[0] + " thành công")
            bot.telegram.sendMessage(msg.message.from.id, "Cách hủy theo dõi địa chỉ ví: remove|" + mess[0])

        }else{
            bot.telegram.sendMessage(msg.message.from.id, "Không đúng định dạng /huongdan để được hướng dẫn")
        }
    }
    if(action === "remove"){
        let filter = listInterval.filter(tmp=>tmp.id == mess)
        if(filter.length !== 0){
            clearInterval(filter[0].interval)
            bot.telegram.sendMessage(msg.message.from.id, "Hủy theo dõi địa chỉ ví " + filter[0].id)
        }else{
            bot.telegram.sendMessage(msg.message.from.id, "Địa chỉ ví chưa đăng ký " )
        }
    }
  });

//  const runChatBot = ()=>{
//     console.log("Running.....");
//     console.log("Get Data.....");
//     usignRequst()
//     setInterval(()=>{
//         console.log("Get Data.....");
//         usignRequst()
//     }, 60000)
// }
// runChatBot()