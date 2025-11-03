const { User } = require("../models");
const { Op } = require("sequelize");

const searchCandidatesByTitle = async (req, res) => {
  try {
    const { title } = req.query;

    if (!title) {
      return res.status(400).json({ success: false, error: "Please provide a title to search" });
    }

    const candidates = await User.findAll({
      where: {
        role: "applicant",
        title: { [Op.iLike]: `%${title}%` }, 
      },
      attributes: ["id", "fullName", "title", "location", "profilepic"], 
    });

    res.status(200).json({ success: true, candidates });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { searchCandidatesByTitle };

// 