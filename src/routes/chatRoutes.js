const express = require("express");
const router = express.Router();
const { createChatRoom, getUserChats, blockUnblockUser, deleteChat, getChatByUserId, markChatAsRead, } = require("../controllers/chatController");
const { authorize } = require("../middlewares/authMiddleware");

router.post("/", authorize, createChatRoom);

router.get("/", authorize, getUserChats);

router.get("/user/:userId", authorize, getChatByUserId);

router.put("/block-unblock", authorize, blockUnblockUser);

router.delete("/:chatId", authorize, deleteChat);

router.put('/:chatId/mark-as-read', authorize, markChatAsRead )

module.exports = router;


