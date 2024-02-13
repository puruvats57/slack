// kafkaConsumer.js
const { Kafka } = require('kafkajs');
const User = require("./models/user.model.js");
const Message = require("./models/chatMessages.model.js");
const Group = require("./models/group.model.js");

async function initializeKafkaConsumer() {
    const kafka = new Kafka({
        clientId: 'my-app',
        brokers: ['localhost:9092'],
    });

    const consumer = kafka.consumer({ groupId: 'test-group' });

    await consumer.connect();
    //await consumer.subscribe({ topic: ['directmsgs','groupsmsgs'] });
    await consumer.subscribe({ topic: 'directmsgs' });
    await consumer.subscribe({ topic: 'groupsmsgs' });


    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            if (topic == 'directmsgs') {

                const kafkaMessage = JSON.parse(message.value.toString());
                const { msgId, senderKey, receiverKey } = kafkaMessage;


                // to save sender

                const user = await User.findById(senderKey);

                // Check if the friendId already exists in the friends array
                let friend = user.friends.find(friend => friend.friendId.toString() === receiverKey);

                if (friend) {
                    // If the friendId exists, push the message
                    friend.messages.push(msgId);
                } else {
                    // If the friendId does not exist, set the friendId and push the message
                    friend = {
                        friendId: receiverKey,
                        messages: [msgId]
                    };
                    user.friends.push(friend);
                }


                await user.save();

                //to save receiver
                const r = await User.findById(receiverKey);

                // Check if the friendId already exists in the friends array
                let rf = r.friends.find(friend => friend.friendId.toString() === senderKey);


                if (rf) {
                    // If the friendId exists, push the message
                    rf.messages.push(msgId);
                } else {
                    // If the friendId does not exist, set the friendId and push the message

                    rf = {
                        friendId: senderKey,
                        messages: [msgId]
                    };
                    r.friends.push(rf);
                }

                // Save the user
                await r.save();
            }
            else if (topic == 'groupsmsgs') {
                const kafkaMessage = JSON.parse(message.value.toString());
                const { grpId, msgId } = kafkaMessage;
                await Group.findOneAndUpdate({ _id: grpId }, { $addToSet: { messages: msgId } });
                

            }






        },
    });

    return consumer;
}

module.exports = initializeKafkaConsumer;
