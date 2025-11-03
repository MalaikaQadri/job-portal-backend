const { AboutUs } = require ("../models");


const createAboutUs = async (req, res) => {
  try {
    const { title, heading, description } = req.body;

    if (!title || !heading || !description) {
      return res.status(400).json({
        success: false,
        message: "Title, heading, and description are required",
      });
    }

    const existing = await AboutUs.findOne();
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "About Us already exists. Please use update instead.",
      });
    }

    const aboutUs = await AboutUs.create({ title, heading, description });

    return res.status(201).json({
      success: true,
      message: "About Us created successfully",
      data: aboutUs,
    });
  } catch (err) {
    console.error("Error creating AboutUs:", err);
    return res.status(500).json({ success: false, error: "Server error", error: err.message });
  }
};


const updateAboutUs = async (req, res) => {
  try {
    const { title, heading, description } = req.body;

    if (!title || !heading || !description) {
      return res.status(400).json({
        success: false,
        message: "Title, heading, and description are required",
      });
    }

    const aboutUs = await AboutUs.findOne();
    if (!aboutUs) {
      return res.status(404).json({ success: false, message: "About Us not found, create first" });
    }

    await aboutUs.update({ title, heading, description });

    return res.status(200).json({
      success: true,
      message: "About Us updated successfully",
      data: aboutUs,
    });
  } catch (err) {
    console.error("Error updating AboutUs:", err);
    return res.status(500).json({ success: false, error: "Server error", error: err.message });
  }
};


const deleteAboutUs = async (req, res) => {
  try {
    const aboutUs = await AboutUs.findOne();
    if (!aboutUs) {
      return res.status(404).json({ success: false, message: "About Us not found" });
    }

    await aboutUs.destroy();

    return res.status(200).json({ success: true, message: "About Us deleted successfully" });
  } catch (err) {
    console.error("Error deleting AboutUs:", err);
    return res.status(500).json({ success: false, error: "Server error", error: err.message });
  }
};


const getAboutUs = async (req, res) => {
  try {
    const aboutUs = await AboutUs.findOne({
      order: [["updatedAt", "DESC"]], 
    });

    if (!aboutUs) {
      return res.status(404).json({ success: false, message: "About Us not available" });
    }

    return res.status(200).json({
      success: true,
      message: "About Us fetched successfully",
      data: aboutUs,
    });
  } catch (err) {
    console.error("Error fetching AboutUs:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { createAboutUs, updateAboutUs, deleteAboutUs, getAboutUs };

