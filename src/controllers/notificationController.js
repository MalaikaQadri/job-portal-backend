const { Notification, User, Job } = require("../models");
const admin = require("../config/firebaseAdmin");
require('dotenv').config();


const saveFcmToken = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({ success: false, message: "FCM token is required" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await User.update({ fcmToken }, { where: { id: userId } });

    return res.status(200).json({
      success: true,
      message: "FCM token updated successfully",
    });
  } catch (error) {
    console.error("Error updating FCM token:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const getUnreadNotificationsForApplicant = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const notifications = await Notification.findAll({
  where: { userId, is_read: false },
  include: [
    {
      model: Job,
      as: "job",
      attributes: ["id", "title", "status", "approvalStatus"],
    },
  ],
  order: [["createdAt", "DESC"]],
});


    // // Fetch unread notifications with job relation
    // const notifications = await Notification.findAll({
    //   where: { userId, is_read: false },
    //   include: [
    //     {
    //       model: Job,
    //       as: "job",
    //       attributes: ["id", "title", "status", "approvalStatus"],
    //     },
    //   ],
    //   order: [["createdAt", "DESC"]],
    // });

    const formatted = notifications.map((n) => {
      let payload = {};
      try {
        payload = JSON.parse(n.data_payload || "{}");
      } catch (e) {}

      return {
        id: n.id,
        title: n.title,
        body: n.body,
        userId: n.userId,
        jobId: n.jobId || payload.jobId || n.job?.id || null,
        jobTitle: n.job?.title || payload.jobTitle || "N/A", // fallback if still null
        status: payload.status || n.job?.status || null,
        approvalStatus: n.job?.approvalStatus || payload.approvalStatus || null,
        applicationCount:
          payload.applicationCount !== undefined && payload.applicationCount !== null
            ? `${parseInt(payload.applicationCount, 10)} Applications`
            : null,
        url: payload.url || n.url || null,
        type: payload.type || null,
        is_read: n.is_read,
        read_at: n.read_at,
        createdAt: n.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      unreadCount: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error("❌ Error fetching applicant notifications:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch unread notifications",
    });
  }
};




const getUnreadNotificationsForAdmin = async (req, res) => {
  try {
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(400).json({ success: false, message: "User not authenticated" });
    }

    const notifications = await Notification.findAll({
      where: { userId: adminId, is_read: false },
      include: [
        {
          model: Job,
          as: "job",
          attributes: ["id", "title", "status", "approvalStatus"],
          where: { approvalStatus: "pending" }, 
          required: true,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Format notifications
    const formatted = notifications.map(n => {
      let payload = {};
      try {
        payload = JSON.parse(n.data_payload || "{}");
      } catch {}

      return {
        id: n.id,
        title: n.title,
        body: n.body,
        userId: n.userId,
        jobId: n.jobId || payload.jobId || null,
        jobTitle: n.job?.title || payload.jobTitle || null,
        jobStatus: n.job?.status || payload.jobStatus || null,
        approvalStatus: n.job?.approvalStatus || payload.approvalStatus || null,
        url: payload.url || n.url || null,
        type: n.type || payload.type || null,
        is_read: n.is_read,
        read_at: n.read_at,
        createdAt: n.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      unreadCount: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error("❌ Error fetching admin notifications:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch unread admin notifications",
    });
  }
};



const getUnreadNotificationsWithCount = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const notifications = await Notification.findAll({
      where: { userId, is_read: false },
      attributes: [
        "id",
        "title",
        "body",
        "userId",
        "data_payload",
        "is_read",
        "read_at",
      ],
      order: [["createdAt", "DESC"]],
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const formatted = await Promise.all(
      notifications.map(async (n) => {
        let payload = {};
        try {
          payload = JSON.parse(n.data_payload || "{}");
        } catch (e) {
          console.warn("Invalid JSON payload for notification ID:", n.id);
        }

        // Fetch job and recruiter
        let recruiterData = null;
        if (payload.jobId) {
          const job = await Job.findOne({
            where: { id: payload.jobId },
            include: [
              {
                model: User,
                as: "recruiter",
                attributes: ["id", "fullName", "profilepic"],
              },
            ],
          });

          if (job && job.recruiter) {
            let profileUrl = null;
            if (job.recruiter.profilepic) {
              let pic = job.recruiter.profilepic.trim();
              if (pic.includes("http://") || pic.includes("https://")) {
                pic = pic.split("/").pop();
              }
              profileUrl = `${baseUrl}/images/${pic}`;
            }

            recruiterData = {
              recruiterId: job.recruiter.id,
              recruiterName: job.recruiter.fullName,
              recruiterProfilePic: profileUrl,
            };
          }
        }

        const appCount =
          payload.applicationCount !== undefined &&
          payload.applicationCount !== null
            ? `${parseInt(payload.applicationCount, 10)} Applications`
            : null;

        return {
          id: n.id,
          title: n.title,
          body: n.body,
          userId: n.userId,
          jobId: payload.jobId || null,
          jobTitle: payload.jobTitle || null,
          applicationCount: appCount,
          status: payload.status || null,
          is_read: n.is_read,
          read_at: n.read_at,
          url: payload.url || null,
          type: payload.type || null,
          recruiter: recruiterData,
        };
      })
    );

    const unreadCount = formatted.length;

    return res.status(200).json({
      success: true,
      unreadCount,
      data: formatted,
    });
  } catch (error) {
    console.error("❌ Error fetching unread notifications:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch unread notifications",
    });
  }
};





// const getUnreadNotificationsWithCount = async (req, res) => {
//   try {
//     const userId = req.user?.id;
//     if (!userId) {
//       return res.status(400).json({
//         success: false,
//         message: "User not authenticated",
//       });
//     }

//     const notifications = await Notification.findAll({
//       where: { userId, is_read: false },
//       attributes: [
//         "id",
//         "title",
//         "body",
//         "userId",
//         "data_payload",
//         "is_read",
//         "read_at",
//       ],
//       order: [["createdAt", "DESC"]],
//     });

//     const formatted = await Promise.all(
//       notifications.map(async (n) => {
//         let payload = {};
//         try {
//           payload = JSON.parse(n.data_payload || "{}");
//         } catch (e) {
//           console.warn("Invalid JSON payload for notification ID:", n.id);
//         }

//         // Fetch job and recruiter (postedBy user)
//         let recruiterData = null;
//         if (payload.jobId) {
//           const job = await Job.findOne({
//             where: { id: payload.jobId },
//             include: [
//               {
//                 model: User,
//                 as: "recruiter",
//                 attributes: ["id", "fullName", "profilepic"],
//               },
//             ],
//           });

//           if (job && job.recruiter) {
//             const baseUrl = "http://localhost:5000/uploads/";
//             const cleanProfilePic = job.recruiter.profilepic
//               ? job.recruiter.profilepic.startsWith("http")
//                 ? job.recruiter.profilepic
//                 : `${baseUrl}${job.recruiter.profilepic.replace(/^\/+/, "")}`
//               : null;

//             recruiterData = {
//               recruiterId: job.recruiter.id,
//               recruiterName: job.recruiter.fullName,
//               recruiterProfilePic: cleanProfilePic,
//             };
//           }
//         }

//         // Convert and format
//         const appCount =
//           payload.applicationCount !== undefined &&
//           payload.applicationCount !== null
//             ? `${parseInt(payload.applicationCount, 10)} Applications`
//             : null;

//         return {
//           id: n.id,
//           title: n.title,
//           body: n.body,
//           userId: n.userId,
//           jobId: payload.jobId || null,
//           jobTitle: payload.jobTitle || null,
//           applicationCount: appCount,
//           status: payload.status || null,
//           is_read: n.is_read,
//           read_at: n.read_at,
//           url: payload.url || null,
//           type: payload.type || null,
//           recruiter: recruiterData,
//         };
//       })
//     );

//     const unreadCount = formatted.length;

//     return res.status(200).json({
//       success: true,
//       unreadCount,
//       data: formatted,
//     });
//   } catch (error) {
//     console.error(" Error fetching unread notifications:", error);
//     return res.status(500).json({
//       success: false,
//       error: "Failed to fetch unread notifications",
//     });
//   }
// };



const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByPk(id);

    if (!notification) return res.status(404).json({ success:false, message: "Notification not found" });

    await notification.update({ is_read: true, read_at: new Date() });

    res.json({ success:true, message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ error: "Failed to mark as read" });
  }
};




const sendPushNotification = async (userId, title, body, data_payload = {}) => {
  try {
    const user = await User.findByPk(userId);
    if (!user || !user.fcmToken || user.fcmToken.trim() === "") {
      console.warn(`⚠️ No valid FCM token found for user ${userId}`);
      return;
    }

    const payloadToSave = {
      ...data_payload,
      jobId: data_payload.jobId || null,
      jobTitle: data_payload.jobTitle || null,
      recruiterPic: data_payload.recruiterPic || null, 
    };

    // Create Notification in DB
    await Notification.create({
      userId,
      title,
      body,
      data_payload: JSON.stringify(payloadToSave),
      url: payloadToSave.url || null,
      is_read: false,
      type: payloadToSave.type || null,
      jobId: payloadToSave.jobId,
    });

    // Send FCM notification
    const message = {
      token: user.fcmToken,
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(payloadToSave).map(([k, v]) => [k, String(v)])
      ),
    };

    console.log("📤 Sending to user:", user.id, user.fullName, user.fcmToken);
    const response = await admin.messaging().send(message);
    console.log(`✅ FCM Notification sent to user ${userId}. Message ID: ${response}`);

  } catch (error) {
    console.error("❌ Error in sendPushNotification:", error);
  }
};

const sendApplicantPushNotification = async (applicantId, title, body, job = null, extraData = {}) => {
  try {
    const user = await User.findByPk(applicantId);

    if (!user || !user.fcmToken?.trim()) return;

    const data_payload = {
      jobId: job?.id || null,
      jobTitle: job?.title || "N/A", 
      status: extraData.status || null,
      url: extraData.url || `/applications/${job?.id}` || null,
      type: extraData.type || "applicant_notification",
      ...extraData,
    };

    await Notification.create({
      userId: applicantId,
      title,
      body,
      data_payload: JSON.stringify(data_payload),
      url: data_payload.url,
      is_read: false,
      type: data_payload.type,
      jobId: data_payload.jobId,
    });

    await admin.messaging().send({
      token: user.fcmToken,
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data_payload).map(([k, v]) => [k, v === null ? "" : String(v)])
      ),
    });

  } catch (err) {
    console.error("Error in sendApplicantPushNotification:", err);
  }
};

const sendAdminPushNotification = async (adminId, title, body, data_payload = {}) => {
  try {
    const adminUser = await User.findByPk(adminId); 
    if (!adminUser || !admin.fcmToken || admin.fcmToken.trim() === "") {
      console.warn(` 👀 No valid FCM token found for admin ${adminId}`);
      return;
    }

    await Notification.create({
      userId: adminId,
      title,
      body,
      data_payload: JSON.stringify(data_payload),
      url: data_payload.url || null,
      is_read: false,
      type: data_payload.type || "admin_job_pending",
      jobId: data_payload.jobId || null,
    });

    const message = {
      token: admin.fcmToken,
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data_payload).map(([k, v]) => [k, String(v)])
      ),
    };

    console.log("🍔 Sending admin notification:", admin.id, admin.fullName);
    const response = await admin.messaging().send(message);
    console.log(`Admin notification sent. Message ID: ${response}`);
  } catch (error) {
    console.error("Error sending admin push notification:", error);
  }
};




const sendMessagePushNotification = async (receiverId, senderId, messageContent) => {
  try {
    const receiver = await User.findByPk(receiverId);
    const sender = await User.findByPk(senderId);

    if (!receiver || !receiver.fcmToken) {
      console.log(" Receiver FCM token not found.");
      return;
    }

    let profileUrl = null;
    if (sender.profilepic) {
      profileUrl = sender.profilepic.startsWith("http")
        ? sender.profilepic
        : `${process.env.BASE_URL}/images/${sender.profilepic}`;
    }

    const payload = {
      token: receiver.fcmToken,
      notification: {
        title: sender.name || "New Message for you ",
        body: messageContent,
        image: profileUrl || undefined,
      },
      data: {
        senderId: senderId.toString(),
        receiverId: receiverId.toString(),
        profileUrl: profileUrl || "",
        name: sender.name || "",
        message: messageContent || "",
      },
    };

    const response = await admin.messaging().send(payload);
    console.log(" Push notification sent successfully:", response);
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
};








// const sendMessagePushNotification = async (receiverId, senderId, messageContent) => {
//   try {
//     const receiver = await User.findByPk(receiverId);
//     const sender = await User.findByPk(senderId);

//     if (!receiver || !receiver.fcmToken) {
//       console.log("Receiver FCM token not found.");
//       return;
//     }

//     const baseUrl = process.env.BASE_URL || "http://localhost:5000";
//     let profileUrl = null;

//     if (sender.profilepic) {
//       let pic = sender.profilepic.trim();
//       if (pic.includes("http://") || pic.includes("https://")) {
//         pic = pic.split("/").pop();
//       }
//       profileUrl = `${baseUrl}/images/${pic}`;
//     }

//     const messagePayload = {
//       notification: {
//         title: sender.name || "New Message",
//         body: messageContent,
//         image: profileUrl || undefined,
//       },
//       data: {
//         senderId: senderId.toString(),
//         receiverId: receiverId.toString(),
//         profileUrl: profileUrl || "",
//         name: sender.name || "",
//         message: messageContent || "",
//       },
//       token: receiver.fcmToken,
//     };

//     await admin.messaging().send(messagePayload);
//     console.log(" Push notification sent successfully.");

//   } catch (error) {
//     console.error(" Error sending push notification:", error);

//     // Handle token invalidation
//     if (error.code === "messaging/registration-token-not-registered") {
//       console.log(" Removing invalid FCM token from DB...");
//       await User.update({ fcmToken: null }, { where: { id: receiverId } });
//     }
//   }
// };




module.exports = { saveFcmToken,  markAsRead, sendPushNotification,  getUnreadNotificationsWithCount, getUnreadNotificationsForApplicant, sendAdminPushNotification, getUnreadNotificationsForAdmin, sendApplicantPushNotification, sendMessagePushNotification }