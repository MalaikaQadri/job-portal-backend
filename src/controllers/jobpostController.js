const { where } = require('sequelize');
const {User, Job,Application,Industry, Location, Sequelize } = require('../models');
const { Op } = Sequelize;
const { validationResult } = require('express-validator');
const transporter = require('../config/transporter');
const {sendPushNotification, sendAdminPushNotification} = require("../controllers/notificationController");
 
const getRecruiterOnlyJobs = async (req, res) => {
  try {
    const recruiterId = req.user?.id;
    if (!recruiterId) {
      return res.status(401).json({ success: false, error: "Unauthorized: Recruiter not found" });
    }

    // Pagination setup
    let { page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const offset = (page - 1) * limit;

    // Fetch all jobs of the recruiter
    const { rows: allJobs, count: totalJobs } = await Job.findAndCountAll({
      where: { postedBy: recruiterId },
      attributes: [
        "id",
        "title",
        "jobType",
        "jobExpirationDate",
        "approvalStatus",
        "createdAt",
      ],
      order: [["createdAt", "DESC"]],
    });

    // Categorize jobs
    const pendingJobs = allJobs.filter((job) => job.approvalStatus === "pending");
    const rejectedJobs = allJobs.filter((job) => job.approvalStatus === "rejected");
    const reportedJobs = allJobs.filter((job) => job.approvalStatus === "reported");

    // Pagination for each category
    const paginate = (items) => {
      const start = offset;
      const end = offset + limit;
      return items.slice(start, end);
    };

    const pendingPaginated = paginate(pendingJobs);
    const rejectedPaginated = paginate(rejectedJobs);
    const reportedPaginated = paginate(reportedJobs);

    // Total pages for each category
    const pendingPages = Math.ceil(pendingJobs.length / limit);
    const rejectedPages = Math.ceil(rejectedJobs.length / limit);
    const reportedPages = Math.ceil(reportedJobs.length / limit);

    return res.status(200).json({
      success: true,
      totalJobs,
      itemsPerPage: limit,
      currentPage: page,
      categories: {
        pending: {
          totalpendingJobs: pendingJobs.length,
          currentPage: page,
          totalPages: pendingPages,
          jobs: pendingPaginated,
        },
        rejected: {
          totalrejectedJobs: rejectedJobs.length,
          currentPage: page,
          totalPages: rejectedPages,
          jobs: rejectedPaginated,
        },
        reported: {
          totalreportedJobs: reportedJobs.length,
          currentPage: page,
          totalPages: reportedPages,
          jobs: reportedPaginated,
        },
      },
    });
  } catch (err) {
    console.error("Error fetching recruiter jobs:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};


const getReportedJobById = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const { jobId } = req.params;

    const job = await Job.findOne({
      where: {
        id: jobId,
        postedBy: recruiterId,
        // approvalStatus: "reported", "pending", "rejected", "accepted",
      },
      attributes: [
        "id",
        "title",
        "locationId",
        "experience",
        "salaryMin",
        "salaryMax",
        "industryId",
        "jobType",
        "tags",
        "education",
        "jobExpirationDate",
        "description",
        "responsibilities",
        "approvalStatus",
        "status"
      ]
    });

    if (!job) {
      return res.status(404).json({ success: false, error: "Reported job not found" });
    }

    return res.status(200).json({
      success: true,
      job
    });
  } catch (err) {
    console.error("Error fetching reported job:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

const updateReportedJob = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const { jobId } = req.params;

    const job = await Job.findOne({
      where: {
        id: jobId,
        postedBy: recruiterId,
        // approvalStatus: "reported"
      }
    });

    if (!job) {
      return res.status(404).json({ success:false, error: "Reported job not found or not owned by recruiter" });
    }

    const {
      title,
      locationId,
      experience,
      salaryMin,
      salaryMax,
      industryId,
      jobType,
      tags,
      education,
      jobExpirationDate,
      description,
      responsibilities
    } = req.body;

    if (title) job.title = title;
    if (locationId) job.locationId = locationId;
    if (experience) job.experience = experience;
    if (salaryMin) job.salaryMin = salaryMin;
    if (salaryMax) job.salaryMax = salaryMax;
    if (industryId) job.industryId = industryId;
    if (jobType) job.jobType = jobType;
    if (tags) job.tags = tags;
    if (education) job.education = education;
    if (jobExpirationDate) job.jobExpirationDate = jobExpirationDate;
    if (description) job.description = description;
    if (responsibilities) job.responsibilities = responsibilities;

    job.approvalStatus = "pending";

    await job.save();

    return res.status(200).json({
      success: true,
      message: "Job updated successfully and sent for re-approval",
      job
    });
  } catch (err) {
    console.error("Error updating reported job:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};


const createJobPending = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, errors: errors.array() });

    const {
      title,
      tags,
      education,
      jobType,
      experience,
      jobExpirationDate,
      locationId,
      salaryMin,
      salaryMax,
      description,
      responsibilities,
      industryId,
    } = req.body;

    if (
      !title ||
      !tags ||
      !education ||
      !jobType ||
      !experience ||
      !jobExpirationDate ||
      !locationId ||
      !salaryMin ||
      !salaryMax ||
      !description ||
      !responsibilities ||
      !industryId
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required. Please fill in every field before submitting.",
      });
    }

    const postedBy = req.user?.id;
    if (!postedBy) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const parsedSalaryMin = parseInt(salaryMin);
    const parsedSalaryMax = parseInt(salaryMax);

    if (isNaN(parsedSalaryMin) || isNaN(parsedSalaryMax)) {
      return res.status(400).json({
        success: false,
        message: "Salary values must be valid numbers.",
      });
    }

    if (parsedSalaryMax <= parsedSalaryMin) {
      return res.status(400).json({
        success: false,
        message: "Maximum salary must be greater than minimum salary.",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(jobExpirationDate);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate <= today) {
      return res.status(400).json({
        success: false,
        message: "Job expiration date must be at least one day after today.",
      });
    }

    const jobTags = Array.isArray(tags)
      ? tags
      : tags.split(",").map((tag) => tag.trim());

    const recruiterJobStatus =
      new Date(jobExpirationDate) < new Date() ? "expired" : "active";

    const job = await Job.create({
      title,
      tags: jobTags,
      education,
      jobType,
      experience,
      jobExpirationDate,
      salaryMin: parsedSalaryMin,
      salaryMax: parsedSalaryMax,
      locationId,
      description,
      responsibilities,
      industryId,
      postedBy,
      status: recruiterJobStatus,
      approvalStatus: "pending",
    });

    const admins = await User.findAll({ where: { role: "admin" } });
    const notificationPayload = {
      jobId: job.id,
      jobTitle: job.title,
      jobStatus: job.status,
      type: "admin_job_pending",
      url: `/admin/jobs/${job.id}`,
    };

    admins.forEach((admin) => {
      sendPushNotification(
        admin.id,
        "New Job Pending Approval",
        `Job "${job.title}" is pending approval.`,
        notificationPayload
      );
    });

    return res.status(201).json({
      success: true,
      message: "Job created successfully and sent for admin approval.",
      job,
    });
  } catch (error) {
    console.error("CreateJobPending error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};




// const createJobPending = async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

//     const {
//       title,
//       tags,
//       education,
//       jobType,
//       experience,
//       jobExpirationDate,
//       locationId,
//       salaryMin,
//       salaryMax,
//       description,
//       responsibilities,
//       industryId,
//     } = req.body;

//     let jobTags = Array.isArray(tags) ? tags : tags.split(",").map(tag => tag.trim());

//     const parsedSalaryMin = parseInt(salaryMin);
//     const parsedSalaryMax = parseInt(salaryMax);

//     const postedBy = req.user?.id;
//     if (!postedBy) return res.status(401).json({ error: "Unauthorized" });

//     const recruiterJobStatus = new Date(jobExpirationDate) < new Date() ? "expired" : "active";

//     const job = await Job.create({
//       title,
//       tags: jobTags,
//       education,
//       jobType,
//       experience,
//       jobExpirationDate,
//       salaryMin: parsedSalaryMin,
//       salaryMax: parsedSalaryMax,
//       locationId,
//       description,
//       responsibilities,
//       industryId,
//       postedBy,
//       status: recruiterJobStatus,
//       approvalStatus: "pending",
//     });

//     const admins = await User.findAll({ where: { role: "admin" } });
//     const notificationPayload = {
//       jobId: job.id,
//       jobTitle: job.title,
//       jobStatus: job.status,
//       type: "admin_job_pending",
//       url: `/admin/jobs/${job.id}`, 
//     };

//     admins.forEach(admin => {
//       sendPushNotification(admin.id, "New Job Pending Approval", `Job "${job.title}" is pending approval.`, notificationPayload);
//     });

//     return res.status(201).json({
//       message: "Job created successfully and sent for admin approval",
//       job,
//     });
//   } catch (error) {
//     console.error("CreateJobPending error:", error);
//     return res.status(500).json({ error: "Server error" });
//   }
// };


const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: `"My Job Portal" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(" Error sending email:", error);
  }
};


const updateJobApprovalStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status } = req.body;

    if (!["accepted", "rejected", "reported"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid approval status" });
    }

    const job = await Job.findByPk(jobId, {
      include: [{ model: User, as: "recruiter" }],
    });

    if (!job) {
      return res.status(404).json({ success:false, message: "Job not found" });
    }

    // Update job status
    job.approvalStatus = status;
    await job.save();

    const recruiter = await User.findByPk(job.postedBy);
    console.log("Recruiter Found:", recruiter?.fullName, recruiter?.fcmToken);

    if (recruiter) {
      let title, body, emailMessage;

      if (status === "accepted") {
        title= "Your Job Has Been Accepted!";
        body = `Congratulations! Your job "${job.title}" has been accepted and is now live on the platform.`;
        emailMessage = `Hello ${recruiter.fullName},\n\nGreat news! Your job "${job.title}" has been accepted and posted successfully.\n\nBest regards,\nMy Job Portal Team`;
      } else {
        title = "Job Approval Status Updated";
        body = `Your job "${job.title}" has been ${status} by the admin.`;
        emailMessage = `Hello ${recruiter.fullName},\n\nYour job "${job.title}" has been ${status} by the admin.\n\nBest regards,\nMy Job Portal Team`;
      }
      

      await sendPushNotification(recruiter.id, title, body, {
        jobId: job.id,
        jobTitle: job.title, 
        status: job.approvalStatus,
         type: "job_status",
        url: `${process.env.CLIENT_URL}/recruiter/jobs/${job.id}`,
      });

      await sendEmail(recruiter.email, title, emailMessage);
    }

    return res.status(200).json({
      success: true,
      message: `Job ${status} by Admin, notificationsx Email sent to Recruiter.`,
      job: {
        id: job.id,
        recruiterId: job.postedBy,
        title: job.title,
        approvalStatus: job.approvalStatus,
      },
    });
  } catch (error) {
    console.error("updateJobApprovalStatus error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};


const getJobsOnAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count: totalJobs, rows: jobs } = await Job.findAndCountAll({
            where: {
        approvalStatus: {
          [Op.ne]: "accepted", 
        },
      },
      attributes: ["id", "title", "jobType", "jobExpirationDate", "approvalStatus"],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const formattedJobs = jobs.map(job => {
      let expirationDisplay = null;

      if (job.jobExpirationDate) {
        const currentDate = new Date();
        const expirationDate = new Date(job.jobExpirationDate);

        const diffTime = expirationDate - currentDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
          expirationDisplay = `${diffDays} day${diffDays > 1 ? "s" : ""} remaining`;
        } else {
          expirationDisplay = "Job has expired";
        }
      }
      return {
        id: job.id,
        title: job.title,
        jobType: job.jobType,
        approvalStatus: job.approvalStatus,
        jobExpirationDate: expirationDisplay, 
      };
    });

    return res.status(200).json({
      success: true,
      totalJobs,
      currentPage: page,
      itemsPerPage: limit,
      totalPages: Math.ceil(totalJobs / limit),
      jobs: formattedJobs,
    });
  } catch (error) {
    console.error("Error fetching job summary:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// const getJobs = async (req, res) => {
//   try {
//     let { page, limit } = req.query;

//     page = parseInt(page) || 1;
//     limit = parseInt(limit) || 10;

//     const offset = (page - 1) * limit;

//     const { rows: jobs, count: totalJobs } = await Job.findAndCountAll({
//       attributes: [
//         "id",
//         "title",
//         "locationId",
//         "salaryMin",
//         "salaryMax",
//         "jobExpirationDate",
//         "status",
//         "approvalStatus",
//         "jobType",
//         "createdAt",
//         "views", 
//       ],
//       include: [
//         {
//           model: User,
//           as: "recruiter",
//           attributes: ["companyName", "profilepic"],
//         },
//       ],
//       where: { approvalStatus: "accepted", status: "active" },
//       limit,
//       offset,
//       order: [["createdAt", "DESC"]],
//     });

//     const baseUrl = `${req.protocol}://${req.get("host")}`;

//     const getRemainingTime = (expirationDate) => {
//       const now = new Date();
//       const expiry = new Date(expirationDate);
//       const diffTime = expiry - now; 
//       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

//       if (diffDays > 0) {
//         return `${diffDays} day${diffDays > 1 ? "s" : ""} remaining`;
//       } else {
//         return "Job has expired";
//       }
//     };
//     const formattedJobs = jobs.map((job) => {
//       let profileUrl = null;

//       if (job.recruiter?.profilepic) {
//         let pic = job.recruiter.profilepic.trim();

//         if (pic.includes("http://") || pic.includes("https://")) {
//           pic = pic.split("/").pop();
//         }

//         profileUrl = `${baseUrl}/images/${pic}`;
//       }

//       return {
//         id: job.id,
//         title: job.title,
//         locationId: job.locationId,
//         salaryMin: job.salaryMin,
//         salaryMax: job.salaryMax,
//         jobExpirationDate: getRemainingTime(job.jobExpirationDate), 
//         status:
//           new Date(job.jobExpirationDate) < new Date()
//             ? "Job has expired"
//             : job.status,
//         approvalStatus: job.approvalStatus,
//         jobType: job.jobType,
//         createdAt: job.createdAt,
//         views: job.views || 0, 
//         companyName: job.recruiter?.companyName,
//         recruiter: {
//           companyName: job.recruiter?.companyName || null,
//           profilepic: profileUrl,
//         },
//       };
//     });

//     return res.status(200).json({
//       success: true,
//       totalJobs,
//       itemsPerPage: limit,
//       currentPage: page,
//       totalPages: Math.ceil(totalJobs / limit),
//       jobs: formattedJobs,
//     });
//   } catch (err) {
//     console.error("Error Fetching Jobs:", err);
//     return res.status(500).json({ error: "Server error" });
//   }
// };


const getJobs = async (req, res) => {
  try {
    let { page, limit } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const offset = (page - 1) * limit;

    const { rows: jobs, count: totalJobs } = await Job.findAndCountAll({
      attributes: [
        "id",
        "title",
        "salaryMin",
        "salaryMax",
        "jobExpirationDate",
        "status",
        "approvalStatus",
        "jobType",
        "createdAt",
        "views",
      ],
      include: [
        {
          model: User,
          as: "recruiter",
          attributes: ["companyName", "profilepic"],
        },
        {
          model: Location,
          as: "location",
          attributes: ["name"], 
        },
      ],
      where: { approvalStatus: "accepted", status: "active" },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const getRemainingTime = (expirationDate) => {
      const now = new Date();
      const expiry = new Date(expirationDate);
      const diffTime = expiry - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? "s" : ""} remaining`;
      } else {
        return "Job has expired";
      }
    };

    const formattedJobs = jobs.map((job) => {
      let profileUrl = null;

      if (job.recruiter?.profilepic) {
        let pic = job.recruiter.profilepic.trim();
        if (pic.includes("http://") || pic.includes("https://")) {
          pic = pic.split("/").pop();
        }
        profileUrl = `${baseUrl}/images/${pic}`;
      }

      return {
        id: job.id,
        title: job.title,
        locationId: job.location?.name || "Unknown", 
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        jobExpirationDate: getRemainingTime(job.jobExpirationDate),
        status:
          new Date(job.jobExpirationDate) < new Date()
            ? "Job has expired"
            : job.status,
        approvalStatus: job.approvalStatus,
        jobType: job.jobType,
        createdAt: job.createdAt,
        views: job.views || 0,
        companyName: job.recruiter?.companyName,
        recruiter: {
          companyName: job.recruiter?.companyName || null,
          profilepic: profileUrl,
        },
      };
    });

    return res.status(200).json({
      success: true,
      totalJobs,
      itemsPerPage: limit,
      currentPage: page,
      totalPages: Math.ceil(totalJobs / limit),
      jobs: formattedJobs,
    });
  } catch (err) {
    console.error("Error Fetching Jobs:", err);
    return res.status(500).json({ error: "Server error" });
  }
};




const getJobDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findByPk(id, {
      include: [
        {
          model: User,
          as: "recruiter",
          attributes: [
            "id",
            "companyName",
            "aboutUs",
            "profilepic",
            "bannerImage",
            "organizationType",
            "teamSize",
            "industryTypes",
            "yearOfEstablishment",
            "companyWebsite",
            "facebookLink",
            "instagramLink",
            "linkedInLink",
            "twitterLink",
            "location",
            "phoneNumber",
            "email",
          ],
        },
        {
          model: Industry,
          as: "industry",
          attributes: ["id", "name"],
        },
        {
          model: Location,
          as: "location",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!job) {
      return res.status(404).json({ success:false, message: "Job not found" });
    }

    await job.increment("views", { by: 1 });

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const cleanImageUrl = (imgPath) => {
      if (!imgPath) return null;
      let file = imgPath.trim();
      if (file.startsWith("http://") || file.startsWith("https://")) {
        file = file.split("/").pop();
      }
      return `${baseUrl}/images/${file}`.replace(/([^:]\/)\/+/g, "$1");
    };

    const profileUrl = cleanImageUrl(job.recruiter?.profilepic);
    const bannerUrl = cleanImageUrl(job.recruiter?.bannerImage);

    let jobExpirationDate = null;
    if (job.jobExpirationDate) {
      const today = new Date();
      const expirationDate = new Date(job.jobExpirationDate);
      const diffTime = expirationDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        jobExpirationDate = `${diffDays} day${diffDays > 1 ? "s" : ""} remaining`;
      } else {
        jobExpirationDate = "Job has expired";
      }
    } else {
      jobExpirationDate = "No expiration date provided";
    }

    const jobDetail = {
      id: job.id,
      title: job.title,
      tags: job.tags,
      education: job.education,
      jobType: job.jobType,
      experience: job.experience,
      jobExpirationDate,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      description: job.description,
      responsibilities: job.responsibilities,
      status: job.status,
      views: job.views, 

      industryId: job.industry?.name || null,
      locationId: job.location?.name || null,

      company: {
        id: job.recruiter?.id,
        companyName: job.recruiter?.companyName,
        aboutUs: job.recruiter?.aboutUs,
        profilepic: profileUrl,
        bannerImage: bannerUrl,
        organizationType: job.recruiter?.organizationType,
        teamSize: job.recruiter?.teamSize,
        // industryTypes: job.recruiter?.industryTypes
        //   ? await Industry.findOne({
        //       where: { id: job.recruiter.industryTypes },
        //       attributes: ["name"],
        //     }).then((i) => i?.name)
        //   : null,
          industryTypes: job.recruiter?.industryTypes || null,

        yearOfEstablishment: job.recruiter?.yearOfEstablishment,
        companyWebsite: job.recruiter?.companyWebsite,
        facebookLink: job.recruiter?.facebookLink,
        instagramLink: job.recruiter?.instagramLink,
        linkedInLink: job.recruiter?.linkedInLink,
        twitterLink: job.recruiter?.twitterLink,
        location: job.recruiter?.location,
        phoneNumber: job.recruiter?.phoneNumber,
        email: job.recruiter?.email,
      },
    };

    return res.status(200).json({
      success: true,
      job: jobDetail,
    });
  } catch (err) {
    console.error("Error Fetching Job Details:", err);
    return res.status(500).json({ error: "Server error" });
  }
};



const getRecruiterJobs = async (req, res) => {
  try {
    const recruiterId = req.user?.id;
    const role = req.user?.role;

    if (!recruiterId || role !== "recruiter") {
      return res.status(401).json({ success: false, error: "Unauthorized: Only recruiters can view this" });
    }

    let { page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const offset = (page - 1) * limit;

    const { rows: jobs, count: totalJobs } = await Job.findAndCountAll({
      where: { postedBy: recruiterId },
      attributes: [
        "id",
        "title",
        "jobExpirationDate",
        "jobType",
        "status",
        "createdAt",
        "views",
      ],
      include: [
        {
          model: Application,
          as: "applications",
          attributes: ["id"],
        },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    const totalActiveJobs = await Job.count({
      where: {
        postedBy: recruiterId,
        jobExpirationDate: { [Op.gt]: new Date() }, 
      },
    });

    const getRemainingTime = (expirationDate) => {
      const now = new Date();
      const expiry = new Date(expirationDate);
      const diffTime = expiry - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0
        ? `${diffDays} day${diffDays > 1 ? "s" : ""} remaining`
        : "Job has expired";
    };

    const jobCards = jobs.map((job) => {
      const isExpired = new Date(job.jobExpirationDate) < new Date();
      return {
        id: job.id,
        title: job.title,
        jobType: job.jobType,
        jobExpirationDate: getRemainingTime(job.jobExpirationDate),
        // status: isExpired ? "Job has expired" : job.status,
        status : job.status,
        applicationsCount: job.applications?.length || 0,
        views: job.views || 0,
        createdAt: job.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      totalJobs,          
      totalActiveJobs,    
      itemsPerPage: limit,
      currentPage: page,
      totalPages: Math.ceil(totalJobs / limit),
      jobs: jobCards,
    });

  } catch (err) {
    console.error("Error fetching recruiter jobs:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

const getJobById = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ success:false, message: 'Job not found' });
    return res.status(200).json( {success: true, job});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

const updateJob = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    await job.update(req.body);
    return res.json({ success: true, message: 'Job updated successfully', job });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    await job.destroy();
    return res.json({ success:true, message: 'Job deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ sucees: false, error: 'Server error' });
  }
};

const expireJobs = async (req, res) => {
  try {
    const [updatedCount] = await Job.update(
      { status: "expired" },
      { where: { jobExpirationDate: { [Op.lt]: new Date() }, status: "active" } }
    );

    return res.json({ success: true, message: "Job has Expired", count: updatedCount });
  } catch (error) {
    console.error("expireJobs error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};


module.exports = { createJobPending, deleteJob, getJobById, updateJob, getJobs, expireJobs, getJobDetails , getRecruiterJobs,   updateJobApprovalStatus, getJobsOnAdmin, getRecruiterOnlyJobs, getReportedJobById, updateReportedJob }

