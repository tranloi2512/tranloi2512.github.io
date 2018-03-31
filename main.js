///
///     Socket.io Connect
///
const socket = io('https://tmlsocketio.herokuapp.com/');
var remoteID='';



///
///     Check wheather audio or video activation
///
var video_enable = false;
var audio_enable = false;
function video_handleClick(cb1) {
  console.log("Video enable = " + cb1.checked);
  video_enable = cb1.checked;
}

function audio_handleClick(cb2) {
  console.log("Audio enable = " + cb2.checked);
  audio_enable = cb2.checked;
}
///$('#div-chat').hide();

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
              // console.log("ICE List: "+res.v.iceServers);
               customConfig=res.v.iceServers;
              // console.log('customConfig: '+customConfig);
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
var key_count = 0;
var key_max = 20;
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
     //conn.send("cmd_start");

       //keydown listener
       document.addEventListener('keydown', function(e) {
     // console.log("Key down Event");
      if (e.keyCode == 75) conn.send(e.keyCode);
      else {
             key_count++;  
            if (key_count == key_max){
                 key_count = 0;      
                 conn.send(e.keyCode);
            }; // end of check key_count
      } ;//end of else 
      
     });

});

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


///
///     Call-On-Click Handler
///


$('#ulUser').on('click','li',function() {
    
       
        
    }); //end of click function
