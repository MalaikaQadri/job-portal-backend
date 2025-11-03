const express = require("express");
const router = express.Router();
const  { saveFcmToken,  markAsRead,  getUnreadNotificationsWithCount, getUnreadNotificationsForAdmin, getUnreadNotificationsForApplicant } = require("../controllers/notificationController");
const {authorize} = require("../middlewares/authMiddleware"); 


router.put("/save-token", authorize, saveFcmToken);

router.get("/unread-notification",authorize, getUnreadNotificationsWithCount);

router.get("/unread-notification-applicant",authorize, getUnreadNotificationsForApplicant);

router.get("/unread-notification-admin",authorize, getUnreadNotificationsForAdmin);


router.put("/mark-read/:id", authorize, markAsRead);

module.exports = router;

// ab tum nay ya karna hy k is response may jo jobId hy is ko jis nay post kiya hy uss ki postedId hy table may or uss ki postedId user table may hy vahan uss ki profile pic hy tum nay vo bhi get kar k uss ka clean url banana hy k url double or triple na hoo raha hoo or is controller may daalna hy 