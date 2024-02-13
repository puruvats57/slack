import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom';
function GroupChat({ socket }) {

    const location = useLocation();
    const groupId = location.state?.groupId || null;
    const userId = location.state?.userId || null;
    var token = localStorage.getItem('token');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    useEffect(() => {
        socket.emit('joinGroup', userId, groupId);

        console.log("hye useeffect");
        async function fun() {
            const grpResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}:5000/api/v1/organization/getGrpMsgs`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    groupId: groupId,
                }),
            });

            if (!grpResponse.ok) {

            }

            const orgData = await grpResponse.json();

            if (orgData.success) {

                setMessages([...orgData.data]);
            } else {

            }
        }
        fun()

        socket.on("receiveGrpMsgs", (msgData) => {
            console.log("msg received");
            setMessages((prevMessages) => [...prevMessages, msgData]);


        })

        return () => {
            socket.off('receiveGrpMsgs'); // Remove the specific event listener
            socket.emit('makeToZero');
        };
    }, [])


    const handleMessageChange = (e) => {
        setMessage(e.target.value);

    };
    const sendMessage = () => {
        if (message.trim() !== '') {
            console.log("seding....");

            socket.emit('sendMsgInGrps', groupId, message, userId);
            setMessage('');
            // setMessage('');

            // setMessages((prevMessages) => [...prevMessages, { msg: message }]);

        }
    };

    socket.on('getdeleteForEveryoneInGrp', (newMessage) => {


        //setMessages((prevMessages) => prevMessages.filter((_, idx) => idx !== newMessage.index));
        setMessages((prevMessages) => prevMessages.filter((m) => m._id != newMessage._id));

    });

    const deleteMsg = (index, msgid, option) => {


        setMessages((prevMessages) => prevMessages.filter((_, idx) => idx !== index));
        fetch(`${process.env.REACT_APP_BACKEND_URL}:5000/api/v1/organization/deleteChatForGrp`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ msgid, groupId, userId, option }),
        })
            .then(response => response.json())
            .then(data => {
                // Do something with the data




            })
            .catch((error) => {
                // Handle the error
                console.error('Error:', error);
            });

        if (option == 2) {


            socket.emit('deleteForEveryoneInGrp', { index, msgid, groupId, userId });
        }
    }

    return (
        <div>
            <div>
                {messages.map((msg, index) => (
                    // <div key={index}>{msg.text}</div>
                    <div key={index}>
                        <p>{msg.msg || msg.text}</p>


                        <button onClick={() => deleteMsg(index, msg._id, 1)}>
                            Delete for me
                        </button>

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
    )
}

export default GroupChat