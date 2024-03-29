import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../App.css';
// import io from 'socket.io-client';

// const socket = io('http://localhost:5000'); 

function ChatPage({ socket }) {
  const location = useLocation();
  const memberId = location.state?.memberId || null;
  const userId = location.state?.userId || null;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [fileUrl, setFileUrl] = useState('');
  const [file, setFile] = useState(null);


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

      // console.log("messages", messages);


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
  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Only taking the first selected file
  };
  const handleFileUpload = () => {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      // Send file to the server for uploading
      fetch(`${process.env.REACT_APP_BACKEND_URL}:5000/api/v1/organization/uploadToS3`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`

        },
        body: formData
      })
        .then(response => response.json())
        .then(data => {
          console.log("file successfully uploaded");
          const fileUrl = data.data;

          setFileUrl(fileUrl);
        })
        .catch(error => {
          console.error('Error uploading file:', error);
        });
    }
  };

  const sendMessage = () => {
    if (message.trim() !== '' || fileUrl != '') {


      socket.emit('sendMessage', { message: message, file: fileUrl, memberId, userId });
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

            {(msg.senderId === userId || msg.sender?._id === userId) ? (
              <p>You-</p>
            ) : (
              <p>sender-{msg.senderName || msg.sender.fullName}</p>
            )}
            {/* <p>msg-{msg.msg || msg.text}</p> */}
            {(msg.msg || msg.text) ? (
              <p>msg-{msg.msg || msg.text}</p>
            ) : (

              <div className="image-container">
                <img src={msg.fileLink || msg.file} />
              </div>


            )}


            <button onClick={() => deleteMsg(index, msg?._id, 1)}>
              Delete for me
            </button>
            {/* <button onClick={() => deleteMsg(index, msg.msgid || msg._id, 2)}>
              Delete for everyone
            </button> */}
            {(msg.senderId === userId || msg.sender?._id === userId) && (
              <button onClick={() => deleteMsg(index, msg?._id, 2)}>
                Delete for everyone
              </button>
            )}
          </div>
        ))}
      </div>

      <input type="file" onChange={handleFileChange} />
      <button onClick={handleFileUpload}>send media</button>
      <input type="text" value={message} onChange={handleMessageChange} />
      <button onClick={sendMessage}>Send</button>

    </div>
  );
}

export default ChatPage;
