import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

var ws;
var quiz_num;
const sleep = ms => new Promise(res => setTimeout(res, ms))

  function change_hash(){
    if( location.hash === '#Q1'){
    console.log("CHANGE"+location.hash);
      location.hash = "Q1";
      // location.hash = "A1";
    }else if( location.hash === '#Q2'){
      location.hash = "Q2";
      // location.hash = "A2";
    }else if( location.hash === '#Q3'){
      location.hash = "Q3";
      // location.hash = "A3";
    }else if( location.hash === '#Q4'){
      location.hash = "Q4";
      // location.hash = "A4";
    }else if( location.hash === '#Q5'){
      location.hash = "Q5";
      // location.hash = "A5";
    }else if( location.hash === '#Q6'){
      location.hash = "Q6";
      // location.hash = "A6";
    }else if( location.hash === '#A1'){
      location.hash = "A1";
    }else if( location.hash === '#A2'){
      location.hash = "A2";
    }else if( location.hash === '#A3'){
      location.hash = "A3";
    }else if( location.hash === '#A4'){
      location.hash = "A4";
    }else if( location.hash === '#A5'){
      location.hash = "A5";
    }else if( location.hash === '#A6'){
      location.hash = "A6";
    }else if( location.hash === '#result'){
      location.hash = "result";
    }else if( location.hash === '#progress_result'){
      location.hash = "progress_result";
    }else if( location.hash === '#correct'){
        location.hash = "correct";
    }else if( location.hash === '#worng'){
        location.hash = "worng";
    }else{var hash = "#"+$(this).attr('data-hash');
      console.log("here")
      location.hash = hash;
    }    
  };

  // ハッシュが変更されたら呼び出される
  // QがAになるようにしたいけど、今は条件分岐　これいる？？？
  $(window).hashchange(async function(){
    console.log("hash_CHANGE"+location.hash);
    if(location.hash === '#Q1'){
      displayPage(location.hash);
      quiz_num = "1"
    }else if( location.hash ==='#Q2'){
      displayPage(location.hash);
      quiz_num = "2"
    }else if( location.hash === '#Q3'){
      displayPage(location.hash);
      quiz_num = "3"
    }else if( location.hash === '#Q4'){
      displayPage(location.hash);
      quiz_num = "4"
    }else if( location.hash === '#Q5'){
      displayPage(location.hash);
      quiz_num = "5"
    }else if( location.hash === '#Q6'){
      displayPage(location.hash);
      quiz_num = "6"
    }else if( location.hash === '#correct'){
      displayPage(location.hash);
      window.setTimeout(function(){
        location.hash = "#A"+quiz_num
        console.log("check"+location.hash);
    }, 5000);
      await sleep(5000) 
    }else if( location.hash === '#worng'){
      displayPage(location.hash);                 //答え合わせ
      window.setTimeout(function(){               //解答へ
        location.hash = "#A"+quiz_num
        console.log("check"+location.hash);
      }, 5000);
      await sleep(5000)
    }
    else if( location.hash === '#A1'){
      displayPage(location.hash);                 /*解答を見せる*/ 
      window.setTimeout(function(){               /*途中経過へ*/
        location.hash = '#progress_result';
        console.log("time_CHANGE"+location.hash);
      }, 5000);  
    }else if( location.hash === '#A2'){
      displayPage(location.hash);                 /*解答を見せる*/ 
      window.setTimeout(function(){
        location.hash = '#progress_result';
        console.log("time_CHANGE"+location.hash);
    }, 5000);  
    }else if( location.hash === '#A3'){
      displayPage(location.hash);                 /*解答を見せる*/ 
      window.setTimeout(function(){
        location.hash = '#progress_result';
        console.log("time_CHANGE"+location.hash);
    }, 5000);  
    }else if( location.hash === '#A4'){
      displayPage(location.hash);                 /*解答を見せる*/ 
      window.setTimeout(function(){
        location.hash = '#progress_result';
        console.log("time_CHANGE"+location.hash);
    }, 5000);  
    }else if( location.hash === '#A5'){
      displayPage(location.hash);                 /*解答を見せる*/ 
      window.setTimeout(function(){
        location.hash = '#progress_result';
        console.log("time_CHANGE"+location.hash);
      }, 5000);  
    }else if( location.hash === '#A6'){
      displayPage(location.hash);                 /*解答を見せる*/ 
      window.setTimeout(function(){
        location.hash = '#progress_result';
        console.log("time_CHANGE"+location.hash);
    }, 5000);  
    }else if( location.hash == '#progress_result'){
      displayPage(location.hash);        
      window.setTimeout(function(){               /*途中経過へ*/
      location.hash = '#Q'+quiz_num;
      console.log("time_CHANGE"+location.hash);
    }, 5000);  
      ws_A.send(send_message("standby"));
      ws_B.send(send_message("standby"));
    }else{
      displayPage(location.hash);
    }
  });    

  //設定画面から移行

  // ページ初期化処理
  function clearPage(){
      $(".setting").css("display", "none");
      $(".page").css("display", "none");
  };
  // ページ表示処理
  function displayPage(hash){
    clearPage()
      $(hash).css("display", "block");
      $(hash).fadeIn(10000, "linear"); // アニメーションをつけることも出来る
  }; 



function connectSocketServer(callback) {
    var support = "MozWebSocket" in window ? 'MozWebSocket' : ("WebSocket" in window ? 'WebSocket' : null);

    if (support == null) {
        return;
    }
    if( ws != null){
      ws.close();
    }


    console.log("* Connecting to server ..");
   
    ws = new window[support]('ws://127.0.0.1/');
    ws_A = new window[support]('ws://127.0.0.1:3000/');


    // when data is comming from the server, this metod is called
    ws.onmessage = function (evt) {
      var json = evt.data;

      //console.log(json);

      var data = JSON.parse(json);
      if( data["command"] == "detect"){

          var spl = data["message"].split(",");
          var serial = spl[0];
          var id = spl[1];             
          // window.location.href = './result.html?idm='+id; 
          read_result_finale(id)
      }
      else if( data["command"] == "lost"){

          $("#_card_message").text("未検出");
          $("#_card_serial").text("--");
          $("#_card_id").text("--");

          $("#_card_message").css("color", "black");
      }
  };

  // when the connection is established, this method is called
  ws.onopen = function () {
      console.log('* Connection open');
      if( typeof callback != "undefined" ){
          callback("open");
      }
  };

  // when the connection is closed, this method is called
  ws.onclose = function () {
      console.log('* Connection closed');
      if( typeof callback != "undefined" ){
          callback("close");
      }
  }

    ws_A.onmessage = function (evt) {
        var json = evt.data;
        console.log("recieve")
        console.log(json);

        var data = JSON.parse(json);
        console.log(data)

        if( data["command"] == "detect"){

            var spl = data["message"].split(",");
            // var serial = spl[0];
            var id = spl[0];
            var answer = spl[1];  
            console.log(id);
            console.log(quiz_num)
            console.log(answer);
            read(id,quiz_num,answer);
            check_answer(quiz_num,answer)
            read_result_progress(id)
            send_message("recieved");
            change_hash();
        }
        else if( data["command"] == "lost"){

            $("#_card_message").text("未検出");
            $("#_card_serial").text("--");
            $("#_card_id").text("--");

            $("#_card_message").css("color", "black");
        }
    };

    // when the connection is established, this method is called
    ws_A.onopen = function () {
        console.log('* Connection_A open');
        if( typeof callback != "undefined" ){
            callback("open");
        }
    };

    // when the connection is closed, this method is called
    ws_A.onclose = function () {
        console.log('* Connection closed');
        if( typeof callback != "undefined" ){
            callback("close");
        }
    }

   
};


function disconnectWebSocket() {
    if (ws_A) {
      ws_A.close();
      console.log("ws_A_close");
    }
    if (ws) {
      ws.close();
      console.log("ws_close");
    }
}

function send_message(command){
  	var send = {
		"command":command,
	};
   return  JSON.stringify(send);
}

function get_time_str(){

	var now = new Date();
	var y = now.getFullYear();
	var m = padding_zero(now.getMonth() + 1, 2);
	var d = padding_zero(now.getDate(), 2);
	var h = padding_zero(now.getHours(), 2);
	var i = padding_zero(now.getMinutes(), 2);
	var s = padding_zero(now.getSeconds(), 2);

	var ret = y + "/" + m + "/" + d + " " + h + ":" + i + ":" + s;

	return ret;
}

function padding_zero(src, len){
	return ("0" + src).slice(-len);
}

$(document).ready(function(){
	
	connectSocketServer();

});


const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
};

// const firebaseConfig = { 
//     databaseURL: "https://setafesic2022-default-rtdb.asia-southeast1.firebasedatabase.app",
//     measurementId: "G-MYHQ4H44S3"
//   }
  
  firebase.initializeApp(firebaseConfig);
  var db = firebase.firestore();
  var LIST = [];  //ID保管用
  
  // Create操作
  function create(idm){
    db.collection("user").doc(idm).set({
      "1": "0",
      "2": "0",
      "3": "0",
      "4": "0",
      "5": "0",
      "6": "0"
  })
  .then((doc)=>{
    console.log("追加に成功しました");
  })
  .catch((error)=>{
    console.log(`追加に失敗しました (${error})`);
  }); 
  }
  // Read操作
  function read(idm,quiz_num,answer){
    doc_id = String(idm);
    var docRef = db.collection("user").doc(idm);
    // console.log(docRef);
    docRef.get().then((doc)=>{
      if (doc.exists) {
        console.log( doc.data() );
        console.log(idm)
        update(idm,quiz_num,answer)
      }
      else {
        console.log("存在しません");
        console.log(idm)
        create(idm)
        update(idm,quiz_num,answer)
      }
    })
    .catch( (error) => {
        console.log(`データを取得できませんでした (${error})`);
    });

    // return readStatus;
  }
  
  //結果確認用
  async function read_result(idm){
    var docRef = db.collection("user").doc(idm);
    console.log(result);  // count = 0;
    docRef.get().then((doc)=>{
      place_count = 5;  //場所数
      touch_count = 0; //タッチ数を計算
      // console.log(doc.data());
      result = doc.data();      
      if (doc.exists) {
        if (result[1] == "1"){
          $("#_result1").attr("src", "./img/OK.png");
          correct_count++;
        }
        if (result[2] == "A"){
          $("#_result2").attr("src", "./img/OK.png");
          correct_count++;
        }
        if (result[3] == "A"){
          $("#_result3").attr("src", "./img/OK.png");
          correct_count++;
        }
        if (result[4] == "B"){
          $("#_result4").attr("src", "./img/OK.png");
          correct_count++;
        }
        if (result[5] == "A"){
          $("#_result5").attr("src", "./img/OK.png");
          correct_count++;
        }
        if (result[6] == "A"){
          $("#_result6").attr("src", "./img/OK.png");
          correct_count++;
        }
      }else {
        console.log("存在しません");
        console.log(idm)
      } 
      console.log(touch_count+"箇所中"+place_count+"箇所タッチ")
      document.getElementById("_touch_count").innerText = touch_count;
      document.getElementById("_place_count").innerText = place_count;
   })
    .catch( (error) => {
        console.log(`データを取得できませんでした (${error})`);
    });
    await sleep(5000);
    reset_result()
    delete_flag = window.confirm("データを削除しますか。");
    if (delete_flag==true){
      // console.log(idm)
      delete_user(idm)
    }
  }

  function reset_result(){
    $("#_result1").attr("src", "./img/nothing.png");
    $("#_result2").attr("src", "./img/nothing.png");
    $("#_result3").attr("src", "./img/nothing.png");
    $("#_result4").attr("src", "./img/nothing.png");
    $("#_result5").attr("src", "./img/nothing.png");
    $("#_result6").attr("src", "./img/nothing.png");
  }
  
  
  // Update操作
function update(idm,quiz_num,answer){ 
  if(quiz_num==1){
    db.collection("user").doc(idm).update({"1" : answer})
    .then((doc) => {
      console.log(`更新に成功しました`);
    })
    .catch((error) => {
      console.log(`更新に失敗しました`);
    });
  }else if(quiz_num==2){
  db.collection("user").doc(idm).update({"2" : answer})
  .then((doc) => {
    console.log(`更新に成功しました`);
  })
  .catch((error) => {
    console.log(`更新に失敗しました`);
  });
  }else if(quiz_num==3){
  db.collection("user").doc(idm).update({"3" : answer})
  .then((doc) => {
    console.log(`更新に成功しました`);
  })
  .catch((error) => {
    console.log(`更新に失敗しました`);
  });
  }else if(quiz_num==4){
  db.collection("user").doc(idm).update({"4" : answer})
  .then((doc) => {
    console.log(`更新に成功しました`);
  })
  .catch((error) => {
    console.log(`更新に失敗しました`);
  });
  }else if(quiz_num==5){
  db.collection("user").doc(idm).update({"5" : answer})
  .then((doc) => {
    console.log(`更新に成功しました`);
  })
  .catch((error) => {
    console.log(`更新に失敗しました`);
  });
  }else if(quiz_num==6){
  db.collection("user").doc(idm).update({"6" : answer})
  .then((doc) => {
    console.log(`更新に成功しました`);
  })
  .catch((error) => {
    console.log(`更新に失敗しました`);
  });
  }
}

function delete_user(idm){
    db.collection("user").doc(idm).delete().then(() => {
    console.log("削除しました");
  })
  .catch((error) => {
    console.log(`削除に失敗しました (${error})`);
  });
}

function check_answer(quiz_num,answer){
  
  console.log("Q:"+quiz_num)
  console.log("A:"+answer)
  switch(quiz_num){
    case "1":
      if (answer == "B"){
        console.log("correct")
        window.location.hash = "correct"
        change_hash()
      }else{
        console.log("worng")
        window.location.hash = "worng"
        console.log(location.hash)
        change_hash()
      }
      break;    case "2":
      if (answer == "A"){
        console.log("correct")
        window.location.hash = "correct"
        change_hash()
      }else{
        console.log("worng")
        window.location.hash = "worng"
        console.log(location.hash)
        change_hash()
      }
      break;
    case "3":
      if (answer == "A"){
        console.log("correct")
        window.location.hash = "correct"
        change_hash()
      }else{
        console.log("worng")
        window.location.hash = "worng"
        console.log(location.hash)
        change_hash()
      }
      break;
    case "4":
      if (answer == "B"){
        console.log("correct")
        window.location.hash = "correct"
        change_hash()
      }else{
        console.log("worng")
        window.location.hash = "worng"
        console.log(location.hash)
        change_hash()
      }
      break;
    case "5":
      if (answer == "A"){
        console.log("correct")
        window.location.hash = "correct"
        change_hash()
      }else{
        console.log("worng")
        window.location.hash = "worng"
        console.log(location.hash)
        change_hash()
      }
      break;
    case 6:
      if (answer == "A"){
        console.log("correct")
        window.location.hash = "correct"
        change_hash()
      }else{
        console.log("worng")
        window.location.hash = "worng"
        console.log(location.hash)
        change_hash()
      }
      break;

  }

}

function App() {
  const [count, setCount] = useState(0)
  return (
    <>
        {/* 設定画面 */}
        <div class="container setting" id="setting" >
            <h1 class = "message_title">ICトレジャーハント</h1>
            <h2 class = "message_setting">配置場所を選択</h2>
                
            <button id = "button1" class = "btn btn_rally"  onclick = "location.hash = '#P1'"> <div> 1 </div> 1号館 </button>
            <button id = "button2" class = "btn btn_rally"  onclick = "location.hash = '#P2'"> <div> 2 </div> 7号館 B教室 </button>
            <button id = "button3" class = "btn btn_rally"  onclick = "location.hash = '#P3'"> <div> 3 </div> 6号館 </button>
            <button id = "button4" class = "btn btn_rally"  onclick = "location.hash = '#P4'"> <div> 4 </div> 7号館 1</button>
            <button id = "button5" class = "btn btn_rally"  onclick = "location.hash = '#P5'"> <div> 5 </div>  9号館 </button>
            {/* <button id = "button6" class = "btn btn_rally"  onclick = "location.hash = '#P6'"> <div> 6 </div> 4号館 1F </button> */}
            <button id = "button7" class = "btn btn_result"  onclick = "location.hash = '#result'"> <div> Result </div> 1号館 2F </button>
            <button id = "button8" class = "btn btn_result"  onclick = "location.href = './html/test.html?#Q1'"> <div> Test </div> 読み取り </button>
        </div>

    </>
  )
}

export default App
