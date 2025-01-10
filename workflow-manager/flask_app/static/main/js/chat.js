
var socket;
var user_id = $('.user_id').data('user-id');
var isOwner = false;
$(document).ready(function () {
    // Connect to the Socket.IO server
    socket = io.connect('https://' + document.domain + ':' + location.port + '/chat');
    const board = $('chat').data('board_id');

    // Emit a "joined" event when the client connects
    socket.on('connect', function () {
        socket.emit('joined', { board_id: $('chat').data('board_id') });

        if (user_id === 'owner@email.com') {
            isOwner = true;
        }
    });

    // Handle "status" messages from the server (e.g., when a user joins the chat)
    socket.on('status', function (data) {
        // alert(`data: ${JSON.stringify(data)} isOwner: ${data.isOwner}`);
        let tag = document.createElement("p");
        let text = document.createTextNode(data.msg);
        let element = document.getElementById("chat");

        if (data.isOwner) {
            tag.classList.add('owner-message');
        } else {
            tag.classList.add('user-message');
        }

        tag.appendChild(text);
        element.appendChild(tag);
        $('#chat').scrollTop($('#chat')[0].scrollHeight);
    });

    // Handle incoming chat messages
    socket.on('message', function (data) {
        let tag = document.createElement("p");
        let text = document.createTextNode(data.msg);
        let element = document.getElementById("chat");

        // Apply conditional styling
        if (data.isOwner) {
            tag.classList.add('owner-message'); 
        } else {
            tag.classList.add('user-message'); 
        }
        tag.appendChild(text);
        element.appendChild(tag);
        $('#chat').scrollTop($('#chat')[0].scrollHeight);
    });

    // Handle sending messages when pressing Enter
    $('#message-box').keydown(function (event) {
        if (event.key === 'Enter'|| event.key === 'Return') {
            event.preventDefault(); // Prevent the default behavior (form submission)
    
            let message = $(this).val().trim(); // Get the message
            if (message) {
                // Emit the message to the server
                socket.emit('message', { msg: message, board_id: $('chat').data('board_id')  });
    
                // Clear the input field after sending the message
                $(this).val('');
            }
        }
    });
    $('#leave-chat').click(function (event) {
        event.preventDefault(); // Prevent default behavior (if it's inside a form)
        window.location.href = '/home'; // Redirect to the home page
        // Emit the "left" event to the server
        socket.emit('left', {board_id: $('chat').data('board_id') });
        if (data.isOwner) {
            tag.classList.add('owner-message');
        } else {

            tag.classList.add('user-message');
        }
        
    });
    

});
