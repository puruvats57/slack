import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
// import io from 'socket.io-client';

// const socket = io('http://localhost:5000'); 

function ChatPage({ socket }) {
  const location = useLocation();
  const memberId = location.state?.memberId || null;
  const userId = location.state?.userId || null;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);


  var token = localStorage.getItem('token');
  useEffect(() => {
    socket.emit('join', { userId, memberId, page: 'chat' });
    const token = localStorage.getItem('token');
    fetch(`${process.env.REACT_APP_BACKEND_URL}:5000/api/v1/organization/fetchDirectMsgs`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ memberId, userId }),
    })
      .then(response => response.json())
      .then(data => {
        // Do something with the data
        //console.log("messages", data.data);
        //setmsgs(data.data);

        if (Array.isArray(data.data)) {
          setMessages([...data.data]);


        } else {
          console.error('data.data is not an array');
        }

      })
      .catch((error) => {

        // Handle the error
        console.error('Error:', error);
      });

    socket.on('message', (newMessage) => {

      console.log("hye message", newMessage);

      //setMessages([newMessage]);
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      console.log("messages", messages);


    });
    
    
    return () => {
      socket.off('message');
      
    };

  }, []);

  socket.on('getDeleteForEveryone', (newMessage) => {


    //setMessages((prevMessages) => prevMessages.filter((_, idx) => idx !== newMessage.index));
    setMessages((prevMessages) => prevMessages.filter((m) => m._id != newMessage._id));
    
  });

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const sendMessage = () => {
    if (message.trim() !== '') {

      socket.emit('sendMessage', { message, memberId, userId });
      // setMessage('');

      // setMessages((prevMessages) => [...prevMessages, { msg: message }]);

    }
  };
  const deleteMsg = (index, msgid, option) => {


    setMessages((prevMessages) => prevMessages.filter((_, idx) => idx !== index));

    fetch(`${process.env.REACT_APP_BACKEND_URL}:5000/api/v1/organization/deleteChat`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ msgid, memberId, userId, option }),
    })
      .then(response => response.json())
      .then(data => {
        // Do something with the data
        console.log("messages", data.data);



      })
      .catch((error) => {
        // Handle the error
        console.error('Error:', error);
      });

    if (option == 2) {

      socket.emit('deleteForEveryone', { index, msgid, memberId, userId });
    }





    //console.log("msgs", messages);
  };

  return (
    <div>
      <div>




        {messages.map((msg, index) => (
          <div key={index}>
            <p>{msg.msg || msg.text}</p>
            {/* <p>{msg.msgid || msg._id}</p> */}

            <button onClick={() => deleteMsg(index, msg._id, 1)}>
              Delete for me
            </button>
            {/* <button onClick={() => deleteMsg(index, msg.msgid || msg._id, 2)}>
              Delete for everyone
            </button> */}
            {(msg.senderId === userId || msg.sender === userId) && (
              <button onClick={() => deleteMsg(index, msg._id, 2)}>
                Delete for everyone
              </button>
            )}
          </div>
        ))}
      </div>


      <input type="text" value={message} onChange={handleMessageChange} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default ChatPage;
