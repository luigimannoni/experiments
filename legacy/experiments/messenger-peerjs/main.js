var cons = $('.console');

// Peer Object
var peer = new Peer({
    key: '3w5tfu4qs013v7vi',
    // Set highest debug level (log everything!).
    debug: 0,

    // Set a logging function:
    logFunction: function() {
        var copy = Array.prototype.slice.call(arguments).join(' ');
        cons.append(copy + '<br>');
    },

    // Google STUN servers
    config: {'iceServers': [
        { url: 'stun:stun.l.google.com:19302' },
        { url: 'stun:stun1.l.google.com:19302' },
        { url: 'stun:stun2.l.google.com:19302' },
        { url: 'stun:stun3.l.google.com:19302' },
        { url: 'stun:stun4.l.google.com:19302' },
    ]}
});
// Show this peer's ID.
peer.on('open', function(id){
    $('#mine').text('My peer ID: ' + id);
    $('#mine').fadeIn();
});
        
// Await connections from others
peer.on('connection', connect);
var c; // Connection variable
        
        
// Connect funciton
function connect(c) {
    // Handle a chat connection.

    c.on('data', function(data) { 
        $('.center').hide();
        $('body').addClass('pulse');
        setTimeout(function(){
            $('body').removeClass('pulse');
        }, 50);
    });
    c.on('close', function() {
        cons.append('<br>' + c.peer + ' has left the chat.'); 
    });
};
(function($){

    $(document).ready(function() {

          // Connect to a peer
          $('#connectToButton').click(function() {
            remotePeer = $('#connectToValue').val();

            // Create 2 connections, one labelled chat and another labelled file.
            c = peer.connect(remotePeer, {
                label: 'chat',
                serialization: 'none',
                reliable: false   
            });
            c.on('open', function() {
                $('.center').fadeOut();
                connect(c);
            });
            c.on('error', function(err) { alert(err); });

          });
          $('#send').click(function(e){
                e.preventDefault();
                var msg = 'hello';
                // For each active connection, send the message.
                c.send(msg);
          });


    });

})(jQuery);

// Closing cleanup
window.onunload = window.onbeforeunload = function(e) {
  if (!!peer && !peer.destroyed) {
    peer.destroy();
  }
};


