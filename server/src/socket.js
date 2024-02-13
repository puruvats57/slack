const socketIO = require('socket.io');
const User = require("./models/user.model.js");
const Message = require("./models/chatMessages.model.js");
const storeDisconnect = require("./models/storeDisconnect.model.js");
const groupCount = require("./models/groupCount.model.js");
const group = require("./models/group.model.js");
async function initializeSocket(server, corsOptions, redis, kafka) {
    const io = socketIO(server, corsOptions);
    const producer = kafka.producer();

    await producer.connect();

    io.on('connection', (socket) => {

        console.log("user connecred");

        // for direct chatting
        socket.on('join', async (data) => {

            // redis.set(data.memberId || data.userId, socket.id,data.page);
            var key;
            if (data.userId) {
                key = data.userId;
            }
            else {
                key = data.memberId;
            }
            redis.hmset(key, {
                socketId: socket.id,
                page: data.page,
                group: 0
            });

            await User.findOneAndUpdate({ _id: data.memberId }, { $set: { disconnectedTime: null } });
            let uid = data.userId;
            let senderId = data.memberId;

            //apply case 3
            if (data.page == 'chat') {

                await deleteFromStoreDisconnectedModel(uid, senderId);

            }
            // else {

            //     let uid = data.memberId;
            //     const user = await storeDisconnect.findOne({ uid: uid });

            //     if (user) {
            //         var msg = user.msg;
            //         for (i of msg) {
            //             let j = {};

            //             j.senderId = i.sender;
            //             j.text = i.messages[(i.messages.length) - 1];
            //             j.count = i.messages.length;

            //             socket.emit('HomePageMessages', j);

            //         }
            //     }
            // }

        });
        async function deleteFromStoreDisconnectedModel(uid, senderId) {
            try {

                const query = { uid };
                const update = { $pull: { "msg": { sender: senderId } } };
                const options = { new: true };

                let disconnectDoc = await storeDisconnect.findOneAndUpdate(query, update, options);
            } catch (error) {
                console.error("Error occurred while updating disconnect document:", error);
            }
        }
        // send msgs in grps
        socket.on('joinGroup', async (userId, room) => {
            socket.join(room);
            await groupCount.findOneAndUpdate({ uid: userId, group: room }, { $set: { messages: [] } });
            const senderKey = await getRedisKeyBySocketId(socket.id);
            redis.hset(senderKey, "group", 1, function (err, reply) {
                if (err) {
                    console.error(err);
                } else {
                    console.log("Field overwritten successfully!");
                }
            });

            console.log(`User joined room: ${room}`);
        });
        socket.on('makeToZero', async () => {
            const senderKey = await getRedisKeyBySocketId(socket.id);
            redis.hset(senderKey, "group", 0, function (err, reply) {
                if (err) {
                    console.error(err);
                } else {
                    console.log("Field overwritten successfully!");
                }
            });
        })
        socket.on('sendMsgInGrps', async (room, message, userId) => {
            const u = await User.findOne({ _id: userId }).select('fullName');
            const sender = u.fullName;

            const chat = await Message.create({ sender: userId, text: message });
            await sendMsgsinGrp(room, userId, message, chat._id);
            console.log("hye snding");
            var data = {};
            const memb = await group.findOne({ _id: room }).select('members');
            const members = memb.members;
            var data = [];
            for (var i of members) {
                var j = {};
                var sId = await getRedisValue(i);

                const groupPage = await getRedisGroupPage(i);
                // io.to(room).emit('receiveGrpMsgs', { sender: userId, text: message, msgid: chat._id });
                if (groupPage == '1') {


                    // io.to(room).emit('receiveGrpMsgs', { sender: userId, text: message, msgid: chat._id });
                    socket.to(sId).emit('receiveGrpMsgs', { sender: userId, text: message, _id: chat._id });

                }
                else {
                    await groupCount.findOneAndUpdate({ uid: i, group: room }, {
                        $push: { messages: chat._id }
                    }, { upsert: true });
                    const updatedDocument = await groupCount.findOne({ uid: i, group: room });


                    const messageCount = updatedDocument.messages.length;

                    j.groupId = room;
                    j.count = messageCount;
                    socket.to(sId).emit('grpCount', j);


                }
            }

            socket.emit('receiveGrpMsgs', { sender: userId, text: message, _id: chat._id });


        });
        socket.on('deleteForEveryoneInGrp', async (data) => {
            
            io.to(data.groupId).emit('getdeleteForEveryoneInGrp', { userId: data.userId, _id: data.msgid, groupId: data.groupId });

        })

        async function sendMsgsinGrp(grpId, senderKey, msg, chatId) {


            const kafkaMessage = {
                value: JSON.stringify({
                    grpId: grpId,
                    msgId: chatId
                }),
            };

            await producer.send({
                topic: 'groupsmsgs',
                messages: [kafkaMessage],
            });


        }

        // send message in direct messages
        socket.on('sendMessage', async (data) => {
            try {
                var isConnect = 1;

                // console.log("meeId", data.memberId); //receiver uid



                var sId = await getRedisValue(data.memberId);
                var page = await getRedisPage(data.memberId);

                if (!sId) {
                    isConnect = 0;
                }

                // const senderKey = await getRedisKeyBySocketId(socket.id); //sender uid
                let senderKey = data.userId;

                handleSId(sId, data.message, senderKey, data.memberId, isConnect, page);
            } catch (err) {
                console.error(err);
            }
        });

        async function getRedisValue(memberId) {
            return new Promise((resolve, reject) => {
                redis.hget(memberId, 'socketId', (err, value) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(value);
                    }
                });
            });
        }
        async function getRedisPage(memberId) {
            return new Promise((resolve, reject) => {
                redis.hget(memberId, 'page', (err, value) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(value);
                    }
                });
            });
        }
        async function getRedisGroupPage(memberId) {
            return new Promise((resolve, reject) => {
                redis.hget(memberId, 'group', (err, value) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(value);
                    }
                });
            });
        }

        async function getRedisKeyBySocketId(socketId) {
            let foundKey;
            return new Promise((resolve, reject) => {
                redis.keys('*', (err, keys) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    let stopIteration = false;

                    for (const key of keys) {
                        if (stopIteration) {
                            break; // Stop iterating if the flag is set
                        }

                        redis.hget(key, 'socketId', (err, value) => {
                            if (err) {
                                console.error(err);
                            } else {
                                if (value === socketId) {
                                    foundKey = key;
                                    stopIteration = true;
                                    resolve(foundKey); // Resolve inside the loop when a match is found
                                }
                            }
                        });
                    }
                });
            });
        }


        async function handleSId(sId, msg, senderKey, receiverKey, isConnect, page) {

            const chat = await Message.create({ sender: senderKey, text: msg });

            if (isConnect && page == 'chat') {
                socket.to(sId).emit('message', { senderId: senderKey, msg, _id: chat._id });
            }
            else if (isConnect && page == 'home') {
                var data = await storeMessagesForHomePage(receiverKey, senderKey, chat._id);


                socket.to(sId).emit('HomePageMessages', data);
            }

            // socket.emit('message', { senderId: senderKey, msg, msgid: chat._id });


            const kafkaMessage = {
                value: JSON.stringify({
                    msgId: chat._id,

                    senderKey: senderKey,
                    receiverKey: receiverKey,
                }),
            };

            await producer.send({
                topic: 'directmsgs',
                messages: [kafkaMessage],
            });
            socket.emit('message', { senderId: senderKey, msg, msgid: chat._id });

        }
        async function storeMessagesForHomePage(uid, senderId, msgid) {

            try {
                // Check if document exists for the given uid
                let disconnectDoc = await storeDisconnect.findOne({ uid });

                // If document doesn't exist, create it
                if (!disconnectDoc) {
                    disconnectDoc = new storeDisconnect({ uid });
                }

                // Check if sender exists in msg array
                let senderIndex = disconnectDoc.msg.findIndex(msgObj => msgObj.sender.equals(senderId));

                // If sender doesn't exist, create it
                if (senderIndex === -1) {
                    disconnectDoc.msg.push({ sender: senderId, messages: [msgid] });
                    senderIndex = disconnectDoc.msg.length - 1;
                } else {
                    // If sender exists, push the message
                    disconnectDoc.msg[senderIndex].messages.push(msgid);
                }
                var count = disconnectDoc.msg[senderIndex].messages.length
                console.log("count", count);
                // Save the updated document
                await disconnectDoc.save();



                var data = {};
                data.senderId = senderId;
                data.msgId = msgid;
                data.count = count;
                return data;

            } catch (error) {
                console.error("Error occurred while updating disconnect document:", error);
            }

        }
        socket.on('deleteForEveryone', async (data) => {

            var sId = await getRedisValue(data.memberId);

            socket.to(sId).emit('getDeleteForEveryone', { index: data.index, _id: data.msgid });
        })

        // send message end

        socket.on('disconnect', async () => {
            console.log('User disconnected');
            redis.keys('*', (err, keys) => {
                let stopIteration = false;

                for (key of keys) {
                    if (stopIteration) {
                        break; // Stop iterating if the flag is set
                    }
                    redis.hget(key, 'socketId', (err, value) => {
                        if (err) {
                            console.error(err);
                        } else {

                            if (value == socket.id) {
                                redis.del(key);
                                stopIteration = true;
                            }

                        }
                    });
                }
            })
            const senderKey = await getRedisKeyBySocketId(socket.id);
            await User.findOneAndUpdate({ _id: senderKey }, { $set: { disconnectedTime: Date.now() } });






        });
    });

    return io;
}



module.exports = initializeSocket;


