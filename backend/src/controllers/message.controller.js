import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
export const getAllContacts = async(req, res) => {
    try{
        const loggedInUserId = req.user.id;
        const filteredUsers = await User.find({_id: {$ne: loggedInUserId}}).select('-password');
        res.status(200).json(filteredUsers);

    }catch(error){
        console.error("Error in getAllContacts:", error);
        res.status(500).json({message: "Internal server error"});
    }
}
export const getMessagesByUserId = async(req, res) => {
    try{
        const myId=req.user.id;
        const {id:userToChatId}= req.params;
        const messages = await Message.find({
            $or:[
                {senderId:myId, receiverId:userToChatId},
                {senderId:userToChatId, receiverId:myId}
            ]
        }).sort({createdAt:1});
        res.status(200).json(messages);

    }catch(error){
        console.error("Error in getMessagesByUserId:", error);
        res.status(500).json({message: "Internal server error"});
    }
}
export const sendMessage = async(req, res) => {
    try{
        const senderId = req.user.id;
        const {id:receiverId} = req.params;
        const {text,image} = req.body;
        let imageUrl = null;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl
        });
        await newMessage.save();
        //todo:send message to receiver in real-time using socket.io
        res.status(201).json(newMessage);

    }catch(error){
        console.error("Error in sendMessage:", error);
        res.status(500).json({message: "Internal server error"});
    }

}

export const getChatPartners = async(req, res) => {
    try{
        const loggedInUserId = req.user.id;
        const messages = await Message.find({
            $or:[
                {senderId:loggedInUserId},
                {receiverId:loggedInUserId}
            ]
        });
        const chatPartnerIds = [...new Set(messages.map(msg => (msg.senderId.toString() === loggedInUserId ? msg.receiverId : msg.senderId.toString())))];
        const chatPartners = await User.find({_id: {$in: chatPartnerIds}}).select('-password');
        res.status(200).json(chatPartners);

    }catch(error){
        console.error("Error in getChatPartners:", error);
        res.status(500).json({message: "Internal server error"});
    }
}

