const { User, Job, Application, SavedJob, sequelize } = require("../models");
const { Op } = require("sequelize");




const getAnalytics = async (req, res) => {
  try {
    const { from, to, granularity = "day" } = req.query;

    const dateFilter = {};
    if (from && to) {
      dateFilter[Op.between] = [new Date(from), new Date(to)];
    }

    const [totalUsers, totalJobs, totalApplications, jobSeries, applicationSeries, userSeries] =
      await Promise.all([
        User.count(),
        Job.count(),
        Application.count(),
        Job.findAll({
          attributes: [
            [sequelize.fn("date_trunc", granularity, sequelize.col("createdAt")), "date"],
            [sequelize.fn("COUNT", sequelize.col("id")), "count"]
          ],
          where: from && to ? { createdAt: dateFilter } : {},
          group: ["date"],
          order: [[sequelize.literal("date"), "ASC"]],
          raw: true
        }),
        Application.findAll({
          attributes: [
            [sequelize.fn("date_trunc", granularity, sequelize.col("createdAt")), "date"],
            [sequelize.fn("COUNT", sequelize.col("id")), "count"]
          ],
          where: from && to ? { createdAt: dateFilter } : {},
          group: ["date"],
          order: [[sequelize.literal("date"), "ASC"]],
          raw: true
        }),
        User.findAll({
          attributes: [
            [sequelize.fn("date_trunc", granularity, sequelize.col("createdAt")), "date"],
            [sequelize.fn("COUNT", sequelize.col("id")), "count"]
          ],
          where: from && to ? { createdAt: dateFilter } : {},
          group: ["date"],
          order: [[sequelize.literal("date"), "ASC"]],
          raw: true
        }),
      ]);

    return res.status(200).json({
      success: true,
      totals: {
        users: totalUsers,
        jobs: totalJobs,
        applications: totalApplications,
      },
      series: {
        jobs: jobSeries,
        applications: applicationSeries,
        users: userSeries,
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return res.status(500).json({ success:false, error: "Server error" });
  }
};


const getRecruiterStats = async (req, res) => {
  try {

    if (!req.user || req.user.role !== "recruiter") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Recruiter only.",
      });
    }

    const recruiterId = req.user.id;


    const recruiter = await User.findOne({
      where: { id: recruiterId },
      attributes: ["fullName", "profilepic"],
    });

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: "Recruiter not found.",
      });
    }


    const totalJobs = await Job.count({
      where: { postedBy: recruiterId }, 
    });

    const totalApplicants = await User.count({
      where: { role: "applicant" },
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    let profileUrl = null;

    if (recruiter.profilepic) {
      let pic = recruiter.profilepic.trim();
      if (pic.includes("http://") || pic.includes("https://")) {
        pic = pic.split("/").pop(); 
      }
      profileUrl = `${baseUrl}/images/${pic}`;
    }


    return res.json({
      success: true,
      data: {
        recruiterName: recruiter.fullName,
        profilepic: profileUrl,
        totalJobs,
        totalApplicants,
      },
    });
  } catch (error) {
    console.error("Error fetching recruiter stats:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error" });
  }
};


const getApplicantsStats = async (req, res) => {
  try {

    if (!req.user || req.user.role !== "applicant") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied. Applicant only." });
    }

    const applicantId = req.user.id;


    const applicant = await User.findOne({
      where: { id: applicantId },
      attributes: ["fullName", "profilepic"],
    });

    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: "Applicant not found.",
      });
    }


    const totalSavedJobs = await SavedJob.count({
      where: { userId: applicantId },
    });

    const totalAppliedJobs = await Application.count({
      where: { userId: applicantId },
    });


    const baseUrl = `${req.protocol}://${req.get("host")}`;


    let profileUrl = null;
    if (applicant.profilepic) {
      let pic = applicant.profilepic.trim();
      if (pic.includes("http://") || pic.includes("https://")) {
        pic = pic.split("/").pop(); 
      }
      profileUrl = `${baseUrl}/images/${pic}`;
    }


    return res.json({
      success: true,
      data: {
        applicantName: applicant.fullName,
        profilepic: profileUrl,
        totalSavedJobs,
        totalAppliedJobs,
      },
    });
  } catch (error) {
    console.error("Error fetching applicant stats:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};


module.exports= { getAnalytics, getRecruiterStats, getApplicantsStats }