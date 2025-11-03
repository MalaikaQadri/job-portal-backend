const { User, Job, Application, sequelize } = require("../models");
const { Op } = require("sequelize");

const getAdminAnalytics = async (req, res) => {
  try {
    const { from, to } = req.query;

    const dateFilter = {};
    if (from && to) {
      dateFilter[Op.between] = [new Date(from), new Date(to)];
    }

    // Parallel queries
    const [totalUsers, totalJobs, totalApplications, jobSeries, applicationSeries, userSeries] =
      await Promise.all([
        User.count(),
        Job.count(),
        Application.count(),
        Job.findAll({
          attributes: [
            [sequelize.fn("to_char", sequelize.col("createdAt"), "Mon"), "month"],
            [sequelize.fn("COUNT", sequelize.col("id")), "count"]
          ],
          where: from && to ? { createdAt: dateFilter } : {},
          group: ["month"],
          order: [[sequelize.fn("MIN", sequelize.col("createdAt")), "ASC"]],
          raw: true
        }),
        Application.findAll({
          attributes: [
            [sequelize.fn("to_char", sequelize.col("createdAt"), "Mon"), "month"],
            [sequelize.fn("COUNT", sequelize.col("id")), "count"]
          ],
          where: from && to ? { createdAt: dateFilter } : {},
          group: ["month"],
          order: [[sequelize.fn("MIN", sequelize.col("createdAt")), "ASC"]],
          raw: true
        }),
        User.findAll({
          attributes: [
            [sequelize.fn("to_char", sequelize.col("createdAt"), "Mon"), "month"],
            [sequelize.fn("COUNT", sequelize.col("id")), "count"]
          ],
          where: from && to ? { createdAt: dateFilter } : {},
          group: ["month"],
          order: [[sequelize.fn("MIN", sequelize.col("createdAt")), "ASC"]],
          raw: true
        }),
      ]);

    // Month labels (Jan–Dec)
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    // Helper to map DB result to full 12 months
    const formatSeries = (series) => {
      const map = {};
      series.forEach(s => { map[s.month] = Number(s.count); });
      return months.map(m => map[m] || 0);
    };

    return res.status(200).json({
      success: true,
      totals: {
        users: totalUsers,
        jobs: totalJobs,
        applications: totalApplications,
      },
      series: {
        months,
        jobs: formatSeries(jobSeries),
        applications: formatSeries(applicationSeries),
        users: formatSeries(userSeries),
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

module.exports = { getAdminAnalytics };