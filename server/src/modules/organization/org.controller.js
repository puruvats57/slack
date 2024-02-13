const Org = require("../../models/org.model.js");
const Group = require("../../models/group.model.js");
const { sendMail } = require("../../utils/sendingMails.js");
const User = require("../../models/user.model.js");
const Email = require("../../models/email.model.js");
const Messages = require("../../models/chatMessages.model.js");
const storeDisconnect = require("../../models/storeDisconnect.model.js");
const groupCount = require("../../models/groupCount.model.js");

const { v4: uuidv4 } = require('uuid');

exports.createOrganization = async (req, res) => {
    try {
        const uid = req.user.id;
        const { name } = req.body;
        const org = await Org.create({
            name: name,
            admin: uid,
            members: [uid]
        });

        const u = await User.findOneAndUpdate({ _id: uid },
            { $addToSet: { organizations: org.id } },
            { new: true });


        res.json({ success: true, data: org, msg: "Organization created successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
};
exports.addPeople = async (req, res) => {
    try {
        const { email, orgId } = req.body;
        console.log(email, orgId);
        const uuid = uuidv4();
        await Email.create({
            uuid: uuid,
            email: email,
            orgId: orgId
        })
        sendMail(email, orgId, uuid);
        res.json({ success: true, msg: "Email sent successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
};
exports.orgJoined = async (req, res) => {
    try {
        const { uuid } = req.body;
        var eml = await Email.findOne({ uuid: uuid });
        const user = await User.findOneAndUpdate({ email: eml.email },
            { $addToSet: { organizations: eml.orgId } },
            { new: true });

        await Org.findOneAndUpdate({ _id: eml.orgId }, { $addToSet: { members: user.id } });
        await Email.deleteOne({ uuid: uuid });
        res.json({ success: true, data: eml.orgId, msg: "you joined Organization successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, msg: "Internal Server Error" });
    }


}
exports.dashboard = async (req, res) => {
    //const { orgId } = req.body;
    try {
        const org = await Org.find().populate({
            path: 'members',
            select: 'fullName'
        });
        res.json({ success: true, data: org, msg: "Organization created successfully" });

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
}

exports.organizations = async (req, res) => {
    try {
        const uid = req.user._id;
        const user = await User.findOne({ _id: uid })
        const orgids = user.organizations;
        const org = await Org.find({ _id: { $in: orgids } });

        res.json({ success: true, data: org, msg: "get Organization successfully" });

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
}
exports.getOrg = async (req, res) => {
    try {
        const uid = req.user.id;
        const { orgId } = req.body;
        console.log("orgId", orgId);
        const org = await Org.findOne({ _id: orgId }).populate('members');

        res.json({ success: true, data: org, uid: uid, msg: "get Organization successfully" });

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
}


exports.fetchDirectMsgs = async (req, res) => {
    try {
        const { memberId, userId } = req.body;
        const user = await User.findById(userId);
        let friend = user.friends.find(friend => friend.friendId.toString() === memberId);
        var msgs = friend.messages;

        const data = await Messages.find({
            _id: { $in: msgs },
            dontDisplay: { $ne: userId }
        });



        //console.log("data", data);

        res.json({ success: true, data: data, msg: "get messages successfully" });

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
}


exports.deleteChat = async (req, res) => {
    const { msgid, memberId, userId, option } = req.body;
    if (option == 1) {
        const del = await Messages.findOneAndUpdate({ _id: msgid },
            { $push: { dontDisplay: userId } });
        res.json({ data: del });
    }
    else if (option == 2) {
        console.log("msgid", msgid);
        // const del = await Messages.findOneAndUpdate({ _id: msgid },
        //     { $push: { dontDisplay: { $each: [userId, memberId] } } });
        // const d = await User.findOneAndUpdate({ _id: userId, 'friends.friendId': memberId },
        //     { $pull: { 'friends.$.messages': { _id: msgid } } }, { new: true }
        // )
        const r = await User.findById(userId);

        let rf = r.friends.find(friend => friend.friendId.toString() === memberId);

        var index = rf.messages.indexOf(msgid);

        if (index !== -1) {
            rf.messages.splice(index, 1);
        }
        await r.save();

        const r1 = await User.findById(memberId);

        let rff = r1.friends.find(friend => friend.friendId.toString() === userId);

        var index = rff.messages.indexOf(msgid);

        if (index !== -1) {
            rff.messages.splice(index, 1);
        }
        await r1.save();

        // const d1 = await User.findOneAndUpdate({ _id: memberId, 'friends.friendId': userId },
        //     { $pull: { 'friends.$.messages': { _id: msgid } } }, { new: true }
        // )

        var d = await Messages.deleteOne({ _id: msgid });

        console.log("mmberId", memberId);
        const k = await storeDisconnect.findOne({ uid: memberId });
        console.log("k", k);
        if (k) {


            let k1 = k.msg.find(friend => friend.sender.toString() === userId);
            if (k1 && k1.messages) {
                var ind = k1.messages.indexOf(msgid);

                if (ind !== -1) {
                    k1.messages.splice(ind, 1);
                }
                await k.save();
            } else {
                console.log("k1 or k1.messages is undefined");
            }
        }
        else {
            console.log("k is undefined");
        }



        //console.log("d", d, d1);

        res.json({ data: d });
    }
}
exports.deleteMsgs = async (req, res) => {
    const d = await Messages.deleteMany();
    res.json({ d });
}

exports.getHomeMembersAndGroups = async (req, res) => {
    try {
        const uid = req.user.id;
        const { orgId } = req.body;
        const org = await Org.findOne({ _id: orgId });
        const OrgMembers = org.members;


        const user = await User.findOne({ _id: uid });

        const friends = user.friends;

        let ids = friends.map((i) => i.friendId);
        const filtered = ids.filter(element => OrgMembers.includes(element));


        const data = await User.find({ _id: { $in: filtered } }).select('_id fullName');
        res.json({ success: true, data: data, msg: "get OrganizationData successfully" });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error, msg: "Internal Server Error" });
    }


}
exports.getDisconnectMsgs = async (req, res) => {
    try {
        const uid = req.user.id;
        const user = await storeDisconnect.findOne({ uid: uid });
        var data = [];
        if (user) {
            var msg = user.msg;

            for (i of msg) {
                let j = {};

                j.senderId = i.sender;
                j.msgId = i.messages[(i.messages.length) - 1];
                j.count = i.messages.length;

                data.push(j);

            }
        }
        res.json({ success: true, data: data, msg: "get messages successfully" });
    }
    catch (err) {
        res.status(500).json({ success: false, error: error, msg: "Internal Server Error" });
    }


}

exports.searchOrgMembers = async (req, res) => {
    try {
        const uid = req.user.id;
        const { orgId, search } = req.body;
        var data = [];

        const members = await Org.findOne({ _id: orgId }).select('members');

        const users = await User.find({ _id: { $in: members.members } });
        if (!search) {
            for (var i of users) {
                var s = {};
                if (i._id != uid) {
                    s.fullName = i.fullName;
                    s._id = i._id;
                    data.push(s);
                }


            }
        }
        else {

            for (var i of users) {
                var s = {};
                if (i.fullName.includes(search)) {
                    s.fullName = i.fullName;
                    s._id = i._id;
                    data.push(s);
                }

            }
        }


        res.json({ success: true, data: data, msg: "get messages successfully" });
    }
    catch (err) {
        res.status(500).json({ success: false, error: error, msg: "Internal Server Error" });
    }
}

exports.CreateGroup = async (req, res) => {
    try {
        const uid = req.user.id;
        const { groupName, mem, orgId } = req.body;
        mem.push(uid);
        let newGroup = await Group.create({ organizationId: orgId, name: groupName, admin: uid, members: mem });


        for (let id of mem) {
            //console.log("id", id);
            let user = await User.findOneAndUpdate({ _id: id }, { $addToSet: { groups: newGroup._id } });
            // console.log("user", user);
        }
        res.json({ success: true, data: newGroup, msg: "group created successfully" });
    }
    catch (err) {
        res.status(500).json({ success: false, error: error, msg: "Internal Server Error" });
    }
}

exports.getYourGroups = async (req, res) => {
    const { orgId } = req.body;
    const uid = req.user.id;
    try {
        var dat;
        const groups = await User.findOne({ _id: uid }).select('groups');

        if (groups.groups.length > 0) {
            dat = await Group.find({ _id: { $in: groups.groups }, organizationId: orgId }).select('name _id');


        }
        var data = [];
        for (let i of dat) {
            let j = {};
            j._id = i._id;
            j.name = i.name;
            data.push(j);
        }
        var d = [];
        var msgs = await groupCount.find({ uid: uid });
        if (msgs) {
            for (var i of msgs) {
                var j = {};
                j.groupId = i.group;
                if (i.messages.length > 0) {
                    j.count = i.messages.length;
                } else {
                    j.count = 0;
                }

                d.push(j);
            }
        }

        for (var i of data) {

            for (var j of d) {

                if (i._id.toString() === j.groupId.toString()) {

                    i.count = j.count;

                    break;
                }
            }

        }

        // console.log("data", data);
        res.json({ success: true, data: data, msg: "get group  successfully" });
    }
    catch(error) {
        res.status(500).json({ success: false, error: error, msg: "Internal Server Error" });
    }

}

exports.getGrpMsgs = async (req, res) => {
    try {
        const uid = req.user.id;
        const { groupId } = req.body;
        const message = await Group.findOne({ _id: groupId });
        const msgIds = message.messages;
        // const data = await Messages.find({
        //     _id: { $in: msgs },
        //     dontDisplay: { $ne: userId }
        // });
        const msgData = await Messages.find({ _id: { $in: msgIds }, dontDisplay: { $ne: uid } }).populate('sender').exec();
        var data = [];
        for (var i of msgData) {
            var j = {};
            j._id = i._id;
            j.senderId = i.sender._id;
            j.sender = i.sender.fullName;
            j.text = i.text;
            data.push(j);
        }
        res.json({ success: true, data: data, msg: "get group msgs successfully" });

    }
    catch (err) {
        res.status(500).json({ success: false, error: error, msg: "Internal Server Error" });
    }




}

exports.getGrpMsgsCount = async (req, res) => {
    try {
        const uid = req.user.id;
        console.log("uid", uid);
        var data = [];
        var msgs = await groupCount.find({ uid: uid });
        if (msgs) {
            for (var i of msgs) {
                var j = {};
                j.groupId = i.group;
                if (i.messages.length > 0) {
                    j.count = i.messages.length;
                } else {
                    j.count = 0;
                }

                data.push(j);
            }
        }
        res.json({ success: true, data: data, msg: "get group count successfully" });
    }
    catch (err) {
        res.status(500).json({ success: false, error: error, msg: "Internal Server Error" });
    }
}

exports.deleteChatForGrp = async (req, res) => {
    const { msgid, groupId, userId, option } = req.body;
    if (option == 1) {
        const del = await Messages.findOneAndUpdate({ _id: msgid },
            { $push: { dontDisplay: userId } });
        res.json({ data: del });
    }
    else {
        await Group.findOneAndUpdate({ _id: groupId }, { $pull: { messages: msgid } });
        await Messages.deleteOne({ _id: msgid });
        var d = await groupCount.updateMany({ group: groupId }, { $pull: { messages: msgid } });
        res.json({ data: d });
        
    }



}

