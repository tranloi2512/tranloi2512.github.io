$('#div_Control').hide();
///
///     Socket.io Connect
///
const socket = io('https://tmlsocketio.herokuapp.com/');
var remoteID='';
var recognizing;
var final_transcript = '';
var imshow_transcript = '';
var recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.lang = 'en-PH';
recognition.interimResults = true;


///
///     Check wheather audio or video activation
///
var video_enable = true;
var audio_enable = false;
function video_handleClick(cb1) {
  console.log("Video enable = " + cb1.checked);
  video_enable = cb1.checked;
}

function audio_handleClick(cb2) {
  console.log("Audio enable = " + cb2.checked);
  audio_enable = cb2.checked;
}


///
///     Deply TURN Server via Ajax
///
let customConfig;
 $.ajax ({
             url: "https://global.xirsys.net/_turn/tranloi2512.github.io/",
             type: "PUT",
             async: false,
             headers: {
               "Authorization": "Basic " + btoa("tranloi2512:1504b54e-a2d9-11e7-b628-1c12c2a160ac")
             },
             success: function (res){
               console.log("ICE List: "+res.v.iceServers);
               customConfig = res.v.iceServers;
             }
         });


///
///     Get Online User List From Socket.io Server
///
socket.on('ONLINE_USER_LIST',arrUserInfo => {
    $('#div-chat').show();
    $('#div-assign').hide();
    arrUserInfo.forEach(user =>{
        const {name,peerId} = user;
        $('#ulUser').append(`<li id="${peerId}">${name}</li>`);
     });

    socket.on('NEW_USER',user => {
        const {name,peerId} = user;
        $('#ulUser').append(`<li id="${peerId}">${name}</li>`);
    });
    
    socket.on('USER_DISCONNECT',peerId => {
        $(`#${peerId}`).remove();
    });
});

///
///     Check Dupplicate User Name
///
socket.on('ASSIGN_FAIL',() =>{
    alert('This UserName Is Already Assigned!');
});

///
///		Creat Peerjs Connect
///
var my_peer;
var peer = new Peer({
    key: 'peerjs', 
    host: 'tmlpeerjs.herokuapp.com', 
    secure: true, 
    port: 443,
    config: customConfig
    });
peer.on('open', id => {
    my_peer=id;
    $('#my-peer').append(id);
    $('#btnSignUp').click(() => {
        const username = $('#txtUsername').val();
        socket.emit('NEW_USER_ASSIGN', { name: username, peerId: id });
    });
});


///
///     Window Closing Handler
///
window.onunload = window.onbeforeunload = function(e) {
  if (!!peer && !peer.destroyed) {
    peer.destroy();
  }
};





///
///		Caller Event Handler
///

$('#btnCall').click(() => {
    const id = $('#remoteId').val();
    openStream()
    .then(stream => {
       // playStream('localStream', stream);
        const call = peer.call(id, stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });


    remoteID=id;
    console.log('Click on User List');
    console.log('Call to remoteID: '+id);         

       //open data connect to transfer text
    var conn = peer.connect(remoteID);
    console.log('remoteID in line 303',remoteID)
    conn.on('open', function() {
      // Receive messages
        conn.on('data', function(data) {
        console.log('Received', data);
        });
      // Send messages
      conn.send(my_peer);
    });

          //Button MOVE UP event
          document.getElementById("btnUP").onclick= function() 
          {
            console.log("MOVE UP");
            document.getElementById("label_test").innerHTML="MOVE UP";
            conn.send(73);
          };
        //Button LEFT event
          document.getElementById("btnLEFT").onclick= function()
           {
              console.log("MOVE LEFT");
              document.getElementById("label_test").innerHTML="MOVE LEFT";
              conn.send(74);
            };
        //Button RIGHT event
          document.getElementById("btnRIGHT").onclick= function() 
          {
            console.log("MOVE RIGHT");
            document.getElementById("label_test").innerHTML="MOVE RIGHT";
            conn.send(76);
          };
        //Button DOWN event
          document.getElementById("btnDOWN").onclick= function() 
          {
            console.log("MOVE DOWN");
            document.getElementById("label_test").innerHTML="MOVE DOWN";
            conn.send(188);
          };
        //Button STOP event
        document.getElementById("btnSTOP").onclick= function()
         {
          console.log("STOP");
          document.getElementById("label_test").innerHTML="STOP";
          conn.send(75);
        };

       document.addEventListener('keydown', function(e) {
       switch (e.keyCode) {
        case 73:   
        if (check_key(e.keyCode))  
          {
            conn.send(e.keyCode);  
            console.log('UP'); 
          }        
        break; // end of case UP
        
        case 74:  
        if (check_key(e.keyCode))  
          {
            conn.send(e.keyCode);
            console.log('LEFT');
          }     
        break; // end of case LEFT
        
        case 188:   
        if (check_key(e.keyCode))  
         {
            conn.send(e.keyCode); 
            console.log('DOWN');
         }    
      
        break; //end of case DOWN
    
        case 76:   
        if (check_key(e.keyCode))  
         {
            conn.send(e.keyCode); 
            console.log('RIGHT');
         }      
        break;
        
        case 75:   
         {
            conn.send(e.keyCode); 
            console.log('STOP');
         }   
         break;  

        case 85:   
        if (check_key(e.keyCode))  
         {
            conn.send(e.keyCode); 
            console.log('UP - LEFT');
         }  
         break;

        case 79:   
        console.log('UP - RIGHT');
        if (check_key(e.keyCode))  
         {
            conn.send(e.keyCode); 
            console.log('UP - RIGHT');
         } 
        break;

        case 77:   
        if (check_key(e.keyCode))  
         {
            conn.send(e.keyCode); 
            console.log('DOWN - LEFT');
         } 
        break;

        case 190:   
        if (check_key(e.keyCode))  
         {
            conn.send(e.keyCode); 
            console.log('DOWN - RIGHT');
         }
        break;

        case 87: 
        
          console.log('Increase Linear Speed:');
          conn.send(e.keyCode); 
          break;
        
        case 83:        
          console.log('Decrease Linear Speed:');
          conn.send(e.keyCode); 
          break;

        case 82:         
          console.log('Increase Angular Speed:');
          conn.send(e.keyCode); 
          break;
       
        case 70:         
          console.log('Decrease Angular Speed:');
          conn.send(e.keyCode); 
          break;


        default: 
        {
          console.log('out of desired key '+e.keyCode)
        }; //end of default
      }; //emd of switch

      
     }); //end of keydown event

    document.addEventListener('keyup', function(e) {
      conn.send(75); 
    })//end of key
  
  	//HIDE UI div for larger Control UI
  	toggle_div();

	// speech recogintion
	reset();
	recognition.onend = reset;
	recognition.onresult = function (event) {
	var interim_transcript = '';
	for (var i = event.resultIndex; i < event.results.length; ++i) {
	if (event.results[i].isFinal) {
	  final_transcript += event.results[i][0].transcript;
	}
	else {
	  interim_transcript += event.results[i][0].transcript;
	}
	}
	final_transcript = final_transcript.toLowerCase(final_transcript);
	console.log("%s\r\n", final_transcript);
	if(final_transcript == "turn right" || final_transcript == " turn right" || final_transcript == "rẽ trái" || final_transcript == " rẽ trái")
	{
		conn.send(76);
		console.log("RIGHT");
	}
	else if(final_transcript == "turn left" || final_transcript == " turn left" || final_transcript == "rẽ phải" || final_transcript == " rẽ phải")
	{
		conn.send(74);
		console.log("LEFT");
	}
	else if(final_transcript == "forward" || final_transcript == " forward" || final_transcript == "đi tới" || final_transcript == " đi tới")
	{
		conn.send(73);
		console.log("FORWARD");
	}
	else if(final_transcript == "backward" || final_transcript == " backward" || final_transcript == "lùi lại" || final_transcript == " lùi lại")
	{
		conn.send(188);
		console.log("BACKWARD");
	}
	else if(final_transcript == "stop" || final_transcript == " stop" || final_transcript == "dừng lại" || final_transcript == " dừng lại")
	{
		conn.send(75);
		console.log("LEFT");
	}
	imshow_transcript = final_transcript;
	final_transcript = '';
	imshow_transcript = capitalize(imshow_transcript);
	final_span.innerHTML = linebreak(imshow_transcript);
	interim_span.innerHTML = linebreak(interim_transcript);
}

});

///
/// Function to HIDE and SHOW UI div
///
function toggle_div() {
    var x = document.getElementById("div_UI");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }

    var x = document.getElementById("div_Control");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
    return 1;
    return 1;
}


function updateCountry() {
	var x = document.getElementById("select_language").value;
	recognition.stop();
	reset();
	if(x == "English") {
		recognition.lang = 'en-PH';
	}
	else if(x == "Việt Nam") {
		recognition.lang = 'vi-VN';
	}
}

function reset() {
  recognizing = false;
  bt_img.src = "mic_static.gif";
}

var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
  return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}
var first_char = /\S/;
function capitalize(s) {
  return s.replace(first_char, function(m) { return m.toUpperCase(); });
}
function toggleStartStop() {
  if (recognizing) {
    recognition.stop();
    reset();
  } else {
    recognition.start();
    bt_img.src = "mic_dinamic.gif";
    recognizing = true;
  }
}

///
/// only send 1 command after a number of same command
///
var old_key = '';
var key_count=0;
var key_max = 20; 
function  check_key(key_code) {
  if (key_code != old_key) 
    {   console.log('key has been changed');
        old_key = key_code;
        key_count = 0;
        return false;
    }
  else
    {
        key_count++;
        if (key_count == key_max) 
        { console.log('key max');
          key_count = 0;
          return true;
        }
        else return false;

    }

}

///
///		Callee Event Handler
///
peer.on('call', call => {
    openStream()
    .then(stream => {
        call.answer(stream);
       // playStream('localStream', stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
  
	 });



});


 
///
///     Sign Up UserName for Socket.io
///


///
///		Get Media Stream
///
function openStream(){
	console.log('Debug: video:'+video_enable);
  console.log('Debug: audio'+audio_enable);
  const config = {audio:audio_enable,video:video_enable};
	return navigator.mediaDevices.getUserMedia(config);
}

///
///		Play Media on canvas
///
function playStream(idVideoTag,stream){
	const video = document.getElementById(idVideoTag);
	video.srcObject = stream;
	video.play();
}
