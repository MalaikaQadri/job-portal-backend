const express = require('express');
const router = express.Router();
const { getMessages, deleteMessage, deleteAllMessages,getTotalUnreadMessages } = require('../controllers/messageController');
const { authorize } = require("../middlewares/authMiddleware");


router.get('/messages/allUnreadMessages', authorize,getTotalUnreadMessages)

router.get('/:chatId', authorize, getMessages);
// router.get('/:chatId', authorize, deleteAllMessages);
router.delete('/deleteAllMessages/:chatId', authorize, deleteAllMessages);


router.delete("/:messageId", authorize, deleteMessage);

module.exports = router;

