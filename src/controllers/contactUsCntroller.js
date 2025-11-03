const { ConatactUs } = require("../models");

// const createContactUs = async (req, res) => {
//   try {
//     const { title, heading, description } = req.body;

//     if (!title || !heading || !description) {
//       return res.status(400).json({
//         message: "Title, heading, and description are required",
//       });
//     }

//     const contactUs = await ConatactUs.create({ title, heading, description });

//     return res.status(201).json({
//       message: "Contact Us created successfully",
//       data: contactUs,
//     });
//   } catch (err) {
//     console.error("Error creating Contact Us:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };


// const updateContactUs = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { title, heading, description } = req.body;

//     if (!title || !heading || !description) {
//       return res.status(400).json({
//         message: "Title, heading, and description are required for update",
//       });
//     }

//     const contactUs = await ConatactUs.findByPk(id);
//     if (!contactUs) {
//       return res.status(404).json({ message: "Contact Us not found" });
//     }

//     await contactUs.update({ title, heading, description });

//     return res.status(200).json({
//       message: "Contact Us updated successfully",
//       data: contactUs,
//     });
//   } catch (err) {
//     console.error("Error updating ContactUs:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };


// const deleteContactUs = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const contactUs = await ConatactUs.findByPk(id);
//     if (!contactUs) {
//       return res.status(404).json({ message: "Contact Us not found" });
//     }

//     await contactUs.destroy();

//     return res.status(200).json({ message: "Contact Us deleted successfully" });
//   } catch (err) {
//     console.error("Error deleting Contact Us:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };


// const getContactUs = async (req, res) => {
//   try {
//     const contactUsEntries = await ConatactUs.findAll();

//     return res.status(200).json({
//       message: "Contact Us fetched successfully",
//       data: contactUsEntries,
//     });
//   } catch (err) {
//     console.error("Error fetching Contact Us:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };







const createContactUs = async (req, res) => {
  try {
    const { title, heading, description } = req.body;

    if (!title || !heading || !description) {
      return res.status(400).json({
        success: false,
        message: "Title, heading, and description are required",
      });
    }


    const existing = await ConatactUs.findOne();
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Contact Us already exists. Please use update instead.",
      });
    }

    const contactUs = await ConatactUs.create({ title, heading, description });

    return res.status(201).json({
      success: true,
      message: "Contact Us created successfully",
      data: contactUs,
    });
  } catch (err) {
    console.error("Error creating Contact Us:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};


const updateContactUs = async (req, res) => {
  try {
    const { title, heading, description } = req.body;

    if (!title || !heading || !description) {
      return res.status(400).json({
        success: false,
        message: "Title, heading, and description are required",
      });
    }

    const contactUs = await ConatactUs.findOne();
    if (!contactUs) {
      return res.status(404).json({ success: false, message: "Contact Us not found, create first" });
    }

    await contactUs.update({ title, heading, description });

    return res.status(200).json({
      success: true,
      message: "Contact Us updated successfully",
      data: contactUs,
    });
  } catch (err) {
    console.error("Error updating Contact Us:", err);
    return res.status(500).json({ success: false, error: "Server error", error: err.message });
  }
};


const deleteContactUs = async (req, res) => {
  try {
    const contactUs = await ConatactUs.findOne();
    if (!contactUs) {
      return res.status(404).json({ success: false, message: "Contact Us not found" });
    }

    await contactUs.destroy();

    return res.status(200).json({ success: true, message: "Contact Us deleted successfully" });
  } catch (err) {
    console.error("Error deleting Contact Us:", err);
    return res.status(500).json({ success: false, error: "Server error", error: err.message });
  }
};



const getContactUs = async (req, res) => {
  try {
    const contactUs = await ConatactUs.findOne({
      order: [["updatedAt", "DESC"]],
    });

    if (!contactUs) {
      return res.status(404).json({success: false, message: "Contact Us not available" });
    }

    return res.status(200).json({
      success: true,
      message: "Contact Us fetched successfully",
      data: contactUs,
    });
  } catch (err) {
    console.error("Error fetching Contact Us:", err);
    return res.status(500).json({ success: false, error: "Server error", error: err.message });
  }
};

module.exports = { getContactUs, deleteContactUs, createContactUs, updateContactUs };














