const { where } = require('sequelize');
const { Application, Job, User,Notification,Location, StructuredResume } = require('../models');
const { sendPushNotification,sendApplicantPushNotification  } = require('./notificationController');
const transporter = require("../config/transporter");
const { Op } = require("sequelize");


// const applyJob = async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const { coverLetter } = req.body;
//     const userId = req.user.id; 

//     const job = await Job.findByPk(jobId);
//     if (!job) return res.status(404).json({ message: "Job not found" });

//     if(!job.status === "expired" || new Date(job.jobExpirationDate) < new Date()){
//       return res.status(400).json({error: 'This job has expired. You cannot apply'});
//     }

//     const existing = await Application.findOne({ where: { userId, jobId } });
//     if (existing) return res.status(200).json({ message: "Already applied" });

//     const application = await Application.create({
//       userId,
//       jobId,
//       coverLetter
//     });

//     res.status(201).json({
//       message: "Application submitted successfully",
//       application
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };



const applyJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;
    const userId = req.user.id;

    const job = await Job.findByPk(jobId, {
      include: [{ model: User, as: "recruiter" }],
    });
    if (!job) return res.status(404).json({ success:false, message: "Job not found" });

    if (job.approvalStatus === "expired" || new Date(job.jobExpirationDate) < new Date()) {
      return res.status(400).json({ success:false, message: "This job has expired. You cannot apply." });
    }

    const existing = await Application.findOne({ where: { userId, jobId } });
    if (existing) return res.status(400).json({ success:false,  message: "Already applied" });

    const application = await Application.create({
      userId,
      jobId,
      coverLetter,
    });

    const totalApplications = await Application.count({ where: { jobId } });

    const recruiter = job.recruiter;
    if (recruiter) {
      const title = "New Application Received";
      const body = `Your job "${job.title}" now has ${totalApplications} applications.`;

      await sendPushNotification(recruiter.id, title, body, {
        jobId: job.id,
        jobTitle: job.title,
        applicationCount: totalApplications,
        type: "application_received",
        url: `${process.env.CLIENT_URL}/recruiter/jobs/${job.id}`,
      });

      const latestNotif = await Notification.findOne({
  where: { userId: recruiter.id },
  order: [["createdAt", "DESC"]],
});

if (latestNotif) {
  console.log("Stored Notification Payload:", latestNotif.data_payload);
} else {
  console.log("⚠️ No notification found for recruiter yet.");
}

// const latestNotif = await Notification.findOne({
//   where: { userId: recruiter.id },
//   order: [["createdAt", "DESC"]],
// });
// console.log(" Stored Notification Payload:", latestNotif.data_payload);


      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recruiter.email,
        subject: title,
        text: `Hello ${recruiter.fullName},\n\n${body}\n\nBest regards,\nMy Job Portal Team`,
      };
      await transporter.sendMail(mailOptions);
    }

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully, recruiter notified.",
      application,
      job: {
        id: job.id,
        title: job.title,
        totalApplications,
      },
    });
  } catch (err) {
    console.error("applyJob error:", err);
    res.status(500).json({ error: err.message });
  }
};





// const getJobApplicationDetail = async (req, res) => {
//   try {
//     const { jobId, applicationId } = req.params;

//     const job = await Job.findOne({ 
//       where: { id: jobId, postedBy: req.user.id } 
//     });

//     if (!job) {
//       return res.status(403).json({ success: false, message: 'Not authorized to view applications for this job' });
//     }

//     // Specific applicant ki application fetch karo
//     const application = await Application.findOne({
//       where: { jobId, id: applicationId },
//       include: [
//         {
//           model: User,
//           as: "applicant",
//           attributes: [
//             "id", "fullName", "email", "title", "experience", 
//             "education", "personalwebsite", "profilepic", 
//             "resume", "location", "phoneNumber", "bioGraphy"
//           ]
//         }
//       ]
//     });

//     if (!application) {
//       return res.status(404).json({ success: false, message: 'Application not found for this applicant' });
//     }
      
//     // const baseUrl = `${req.protocol}://${req.get("host")}`;

//     return res.status(200).json({
//       success: true,
//       jobId,
//       applicant: {
//                 coverLetter: application.coverLetter,
//         id: application.applicant.id,
//         fullName: application.applicant.fullName,
//         email: application.applicant.email,
//         title: application.applicant.title,
//         experience: application.applicant.experience,
//         education: application.applicant.education,
//         personalwebsite: application.applicant.personalwebsite,
//         // profilepic: application.profilepic
//         //   ? `${baseUrl}/images/${application.profilepic}`
//         //   : null,
//         // resume: application.resume
//         //  ? `${baseUrl}/resume/${application.resume}` 
//         //  : null,
//         profilepic: application.applicant.profilepic,
//         resume: application.applicant.resume,
//         location: application.applicant.location,
//         phoneNumber: application.applicant.phoneNumber,
//         // coverLetter: application.coverLetter,
//         bioGraphy: application.applicant.bioGraphy,
//         appliedAt: application.appliedAt
//       }
//     });
//   } catch (err) {
//     console.error("Error fetching specific job application:", err);
//     return res.status(500).json({ error: err.message });
//   }
// };



const getJobApplicationDetail = async (req, res) => {
  try {
    const { jobId, applicationId } = req.params;

    // Verify job ownership
    const job = await Job.findOne({ 
      where: { id: jobId, postedBy: req.user.id } 
    });

    if (!job) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to view applications for this job" 
      });
    }

    // Fetch application + applicant info
    const application = await Application.findOne({
      where: { jobId, id: applicationId },
      include: [
        {
          model: User,
          as: "applicant",
          attributes: [
            "id",
            "fullName",
            "email",
            "title",
            "experience",
            "education",
            "personalwebsite",
            "profilepic",
            "resume",
            "location",
            "phoneNumber",
            "bioGraphy"
          ]
        }
      ]
    });

    if (!application) {
      return res.status(404).json({ 
        success: false, 
        message: "Application not found for this applicant" 
      });
    }

    const structuredResume = await StructuredResume.findOne({
      where: { userId: application.applicant.id },
    });

    const hasStructuredResume = !!structuredResume;
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // 🧹 Fix profile pic URL duplication
    let profilePic = application.applicant.profilepic;
    if (profilePic) {
      profilePic = profilePic.trim();
      if (profilePic.includes("http://") || profilePic.includes("https://")) {
        profilePic = profilePic.split("/").pop(); // Extract only filename
      }
      profilePic = `${baseUrl}/images/${profilePic}`;
    }

    // 🧹 Fix resume URL duplication
    let resumeUrl = application.applicant.resume;
    if (resumeUrl) {
      resumeUrl = resumeUrl.trim();
      if (resumeUrl.includes("http://") || resumeUrl.includes("https://")) {
        resumeUrl = resumeUrl.split("/").pop(); // Extract only filename
      }
      resumeUrl = `${baseUrl}/resume/${resumeUrl}`;
    }

    return res.status(200).json({
      success: true,
      jobId,
      applicant: {
        coverLetter: application.coverLetter,
        id: application.applicant.id,
        fullName: application.applicant.fullName,
        email: application.applicant.email,
        title: application.applicant.title,
        experience: application.applicant.experience,
        education: application.applicant.education,
        personalwebsite: application.applicant.personalwebsite,
        profilepic: profilePic,
        resume: resumeUrl,
        location: application.applicant.location,
        phoneNumber: application.applicant.phoneNumber,
        bioGraphy: application.applicant.bioGraphy,
        appliedAt: application.appliedAt,
        hasStructuredResume,
      },
    });
  } catch (err) {
    console.error("Error fetching specific job application:", err);
    return res.status(500).json({ error: err.message });
  }
};







const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findOne({ where:{id:jobId, postedBy: req.user.id} });
    if(!job) return res.status(403).json({ success:false, message: 'Not authorized to view applications for this job'});


    const applications = await Application.findAll({
      where: { jobId },
      include: [
        {
          model: User,
          as: "applicant",
          attributes: ["id", "fullName", "email" , "title", "experience", "education", "personalwebsite" , "profilepic", "resume", "location", "phoneNumber"]
        }
      ]
    });

    res.status(200).json({ success:true, applications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;
    const recruiterId = req.user.id;

    // Fetch application with job and recruiter
    const application = await Application.findByPk(applicationId, {
      include: [
        {
          model: Job,
          as: "job",
          attributes: ["id", "title", "postedBy"],
          include: [
            {
              model: User,
              as: "recruiter",
              attributes: ["id", "fullName", "profilepic"],
            },
          ],
        },
      ],
    });

    if (!application) {
      return res.status(404).json({ success:false, message: "Application not found" });
    }

    // Recruiter authorization
    if (application.job.postedBy !== recruiterId) {
      return res.status(403).json({ success:false, message: "You are not allowed to update this application" });
    }

    // Update application status
    application.status = status;
    await application.save();

    const applicantId = application.userId;
    const job = application.job;
    const recruiter = job.recruiter;

    // Notification content
    let notificationTitle = "";
    let notificationBody = "";

    switch (status) {
      case "shortlisted":
        notificationTitle = "Shortlisted for Job!";
        notificationBody = `Good news! You have been shortlisted for "${job.title}".`;
        break;
      case "selected":
        notificationTitle = "Selected for the Job!";
        notificationBody = `Congratulations! You have been selected for "${job.title}".`;
        break;
      case "rejected":
        notificationTitle = "Application Rejected";
        notificationBody = `Unfortunately, your application for "${job.title}" has been rejected.`;
        break;
      default:
        notificationTitle = "Application Update";
        notificationBody = `Your application status for "${job.title}" is now ${status}.`;
        break;
    }
      
    await sendApplicantPushNotification(
  applicantId,
  notificationTitle,
  notificationBody,
  job, 
  {
    status,
    type: "application_status",
    recruiterPic: recruiter?.profilePic || null,
    recruiterName: recruiter?.fullName || null,
    url: `${process.env.CLIENT_URL}/applicant/applications/${applicationId}`,
  }
);

    return res.status(200).json({
      success: true,
      message: "Application status updated and applicant notified successfully",
      application,
    });
  } catch (err) {
    console.error("Error in updateApplicationStatus:", err);
    return res.status(500).json({ error: err.message });
  }
};





const getMyApplications = async (req, res) => {
  try {
    const userId = req.user.id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: applications } = await Application.findAndCountAll({
      where: { userId },
      attributes: ["id", "status", "appliedAt"],
      include: [
        {
          model: Job,
          as: "job",
          attributes: [
            "id",
            "title",
            "locationId",
            "jobType",
            "salaryMin",
            "salaryMax",
            "jobExpirationDate",
            "status"
          ],
          include: [
            {
              model: User,
              as: "recruiter",
              attributes: ["id", "profilepic"]
            },
                    {
                      model: Location,
                      as: "location",
                      attributes: ["id", "name"],
                    }
          ]
        }
      ],
      limit,
      offset
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    applications.forEach(app => {
  if (!app.job) {
    console.warn(`⚠️ Application ${app.id} has no related job record.`);
  }
});


    const formattedApplications = applications.filter(app => app.job).map(app => {
      const recruiter = app.job?.recruiter;
      let profileUrl = null;

      if (recruiter?.profilepic) {
        let pic = recruiter.profilepic.trim();

        if (pic.includes("http://") || pic.includes("https://")) {
          pic = pic.split("/").pop();
        }

        profileUrl = `${baseUrl}/images/${pic}`;
      }

      let jobExpirationDisplay = null;
      if (app.job?.jobExpirationDate) {
        const currentDate = new Date();
        const expirationDate = new Date(app.job.jobExpirationDate);

        const diffTime = expirationDate - currentDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
          jobExpirationDisplay = `${diffDays} day${diffDays > 1 ? "s" : ""} remaining`;
        } else {
          jobExpirationDisplay = "Job has expired";
        }
      }

      return {
        id: app.id,
        status: app.status,
        appliedAt: app.appliedAt,
        job: app.job ?  {
          id: app.job.id ,
          title: app.job.title,
          locationId: app.job.location?.name || null,
          jobType: app.job.jobType,
          salaryMin: app.job.salaryMin,
          salaryMax: app.job.salaryMax,
          jobExpirationDate: jobExpirationDisplay, 
          status: app.job.status,
          profilepic: profileUrl
        } :null,
      }; 
    });

    return res.status(200).json({
      success: true,
      totalApplications: count,
      currentPage: page,
      itemsPerPage: limit,
      totalPages: Math.ceil(count / limit),
      applications: formattedApplications
    });

  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching your applications."
    });
  }
};












const getJobApplicationsForRecruiter = async (req, res) => {
  try {
    const recruiterId = req.user?.id;
    const role = req.user?.role;
    const { jobId } = req.params;

    if (!recruiterId || role !== "recruiter") {
      return res
        .status(401)
        .json({ success: false, error: "Unauthorized: Only recruiters can view applications" });
    }

    if (!jobId) {
      return res.status(400).json({ error: "Job ID is required" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: applications } = await Application.findAndCountAll({
      where: { jobId },
      include: [
        {
          model: User,
          as: "applicant",
          attributes: [
            "id",
            "fullName",
            "profilepic",
            "title",
            "experience",
            "education",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // Format data
    const mapped = applications.map((app) => ({
      id: app.id,
      status: app.status,
      fullName: app.applicant.fullName,
      title: app.applicant.title,
      experience: app.applicant.experience,
      education: app.applicant.education,
      profilepic: app.applicant.profilepic
        ? `${baseUrl}/images/${app.applicant.profilepic}`
        : null,
    }));

const [allPending, shortlistedApps, selectedApps] = await Promise.all([
  Application.findAndCountAll({
    where: { jobId, status: "pending" },
    include: [
      {
        model: User,
        as: "applicant",
        attributes: ["id", "fullName", "profilepic", "title", "experience", "education"],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  }),
  Application.findAndCountAll({
    where: { jobId, status: "shortlisted" },
    include: [
      {
        model: User,
        as: "applicant",
        attributes: ["id", "fullName", "profilepic", "title", "experience", "education"],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  }),
  Application.findAndCountAll({
    where: { jobId, status: "selected" },
    include: [
      {
        model: User,
        as: "applicant",
        attributes: ["id", "fullName", "profilepic", "title", "experience", "education"],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  }),
]);

const formatApps = (apps) =>
  apps.rows.map((app) => ({
    id: app.id,
    status: app.status,
    fullName: app.applicant.fullName,
    title: app.applicant.title,
    experience: app.applicant.experience,
    education: app.applicant.education,
    profilepic: app.applicant.profilepic
      ? `${req.protocol}://${req.get("host")}/images/${app.applicant.profilepic}`
      : null,
  }));

return res.status(200).json({
  success: true,
  jobId,
  totalApplications: count,
  currentPage: page,
  itemsPerPage: limit,
  totalPages: Math.ceil(count / limit),

  all: {
    currentPage: page,
    itemsPerPage: limit,
    totalItems: allPending.count,
    totalPages: Math.ceil(allPending.count / limit),
    data: formatApps(allPending),
  },
  shortlisted: {
    currentPage: page,
    itemsPerPage: limit,
    totalItems: shortlistedApps.count,
    totalPages: Math.ceil(shortlistedApps.count / limit),
    data: formatApps(shortlistedApps),
  },
  selected: {
    currentPage: page,
    itemsPerPage: limit,
    totalItems: selectedApps.count,
    totalPages: Math.ceil(selectedApps.count / limit),
    data: formatApps(selectedApps),
  },
});

  } catch (err) {
    console.error("Error fetching job applications for recruiter:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};



module.exports = { getMyApplications, updateApplicationStatus, getJobApplications, applyJob, getJobApplicationsForRecruiter, getJobApplicationDetail }













