const { StructuredResume, User } = require('../models');

// const updateResume = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const [resume, created] = await StructuredResume.upsert(
//       { ...req.body, userId },
//       { returning: true }
//     );

//     const updatedResume = await StructuredResume.findOne({
//       where: { userId },
//       include: [{ model: User, attributes: ['id', 'fullName', 'email'] }]
//     });

//     res.status(200).json({
//       success: true,
//       message: created ? 'Resume created successfully' : 'Resume updated successfully',
//       resume: updatedResume
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error saving resume',
//       error: error.message
//     });
//   }
// };




const getResumeById = async (req, res) => {
  try {
    const { userId } = req.params;

    const resume = await StructuredResume.findOne({
      where: { userId },
      include: [
        {
          model: User,
          attributes: ['id', 'fullName', 'email', 'profilepic']
        }
      ]
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    let profileUrl = null;

    if (resume.User?.profilepic) {
      let pic = resume.User.profilepic.trim();

      if (pic.startsWith("http://") || pic.startsWith("https://")) {
        pic = pic.split("/").pop();
      }

      profileUrl = `${baseUrl}/images/${pic}`.replace(/([^:]\/)\/+/g, "$1");
    }

    res.status(200).json({
      success: true,
      resume: {
        ...resume.toJSON(),
        User: {
          ...resume.User.toJSON(),
          profilepic: profileUrl  
        }
      }
    });

  } catch (error) {
    console.error("Error fetching resume:", error);
    res.status(500).json({
      success: false,
      message: 'Error fetching resume',
      error: error.message
    });
  }
};


const createResume = async (req, res) => {
  try {
    const userId = req.user.id; 
    const {
      fullname, title, gender, degree, institute, experience,
      projects, location, phonenumber, email, personalwebsite,
      biography, skills
    } = req.body;

    if (!fullname) return res.status(400).json({ message: "Full name is required" });
    if (!title) return res.status(400).json({ message: "Title is required" });
    if (!gender) return res.status(400).json({ message: "Gender is required" });
    if (!institute) return res.status(400).json({ message: "Institute is required" });
    if (!experience) return res.status(400).json({ message: "Experience is required" });
    if (!projects) return res.status(400).json({ message: "Projects are required" });
    if (!phonenumber) return res.status(400).json({ message: "Phone number is required" });
    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!biography) return res.status(400).json({ message: "Biography is required" });
    if (!skills) return res.status(400).json({ message: "Skills are required" });
    if (!personalwebsite) return res.status(400).json({ message: "personalwebsite are required" });
    if (!location) return res.status(400).json({ message: "location are required" });
    if (!degree) return res.status(400).json({ message: "degree are required" });


    
    const resume = await StructuredResume.create({
      userId,
      fullname,
      title,
      gender,
      degree,
      institute,
      experience,
      projects,
      location,
      phonenumber,
      email,
      personalwebsite,
      biography,
      skills
    });

    res.status(201).json({ 
      success: true,
      message: "Resume created successfully", resume });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating resume", error: error.message });
  }
};

const getResume = async (req, res) => {
  try {
    const userId = req.user.id;  
    const resume = await StructuredResume.findOne({ 
      where: { userId },
      include: [{ model: User, attributes: ['id','fullName','email'] }]
    });

    if (!resume) {
      return res.status(404).json({ success: false,  message: 'Resume not found' });
    }

    res.status(200).json({ success: true,  resume});
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resume', error: error.message });
  }
};

const updateResume = async (req, res) => {
  try {
    const  userId  = req.user.id;

    const [updated] = await StructuredResume.update(req.body, {
      where: { userId }
    });

    if (!updated) {
      return res.status(404).json({ success: false,  message: 'Resume not found' });
    }

    const updatedResume = await StructuredResume.findOne({
       where: { userId },
       include:[{model:User,attributes:['id','fullName','email']}]
      });

    res.status(200).json({ success: true, message: 'Resume updated successfully', resume: updatedResume });
  } catch (error) {
    res.status(500).json({ success: false,  message: 'Error updating resume', error: error.message });
  }
};

const deleteResume = async (req, res) => {
  try {
    const { userId } = req.params;
    const deleted = await StructuredResume.destroy({
      where: { userId }
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    res.status(200).json({ 
      success: true,
      message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting resume', error: error.message });
  }
};

module.exports = { createResume ,getResume ,updateResume ,deleteResume, getResumeById }