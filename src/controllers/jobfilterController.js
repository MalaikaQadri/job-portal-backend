const { Op } = require('sequelize');
const { Job, Industry, Location, User } = require("../models");


const filterJobs = async (req, res) => {
  try {
    const { title, locationId, industryId, experience, salary, jobType } = req.query;
    let where = {};


    if (title) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${title}%` } },
        { description: { [Op.iLike]: `%${title}%` } },
        { tags: { [Op.overlap]: [title.toLowerCase()] } },
      ];
    }

    if (locationId) where.locationId = locationId;
    if (industryId) where.industryId = industryId;

    if (experience) {
      const [minExp, maxExp] = experience
        .replace(/[^\d-]/g, "")
        .split("-")
        .map(Number);
      where.experience = {
        [Op.or]: [
          { [Op.iLike]: `%${minExp}%` },
          { [Op.iLike]: `%${maxExp}%` },
        ],
      };
    }

    if (salary) {
      const [minSalary, maxSalary] = salary.split("-").map(Number);
      where[Op.and] = [
        { salaryMin: { [Op.lte]: maxSalary } },
        { salaryMax: { [Op.gte]: minSalary } },
      ];
    }

    if (jobType && jobType !== "all") {
      const jobTypes = jobType.split(",");
      where.jobType = { [Op.in]: jobTypes };
    }


    const jobs = await Job.findAll({
      where,
      attributes: [
        "id",
        "title",
        "salaryMin",
        "salaryMax",
        "locationId",
        "jobExpirationDate",
        "status",
        "approvalStatus",
        "jobType",
        "views"
      ],
      include: [
        {
          model: User,
          as: "recruiter",
          attributes: [ "profilepic"],
        },
        {
          model: Location,
          as: "location",
          attributes: ["id", "name"],
        },
      ],
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

        profileUrl = `${baseUrl}/images/${pic}`.replace(/([^:]\/)\/+/g, "$1");
      }

      return {
        id: job.id,
        title: job.title,
        locationId: job.location?.name || null,
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
        recruiter: {
          profilepic: profileUrl,
        },
      };
    });

    return res.status(200).json({
      success: true,
      totalJobs: formattedJobs.length,
      jobs: formattedJobs,
    });
  } catch (error) {
    console.error("Error filtering jobs:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Job.destroy({ where: { id } });

    if (!deleted) return res.status(404).json({ error: 'Job not found' });

    res.json({ success:true, message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = {  filterJobs, deleteJob,  };
