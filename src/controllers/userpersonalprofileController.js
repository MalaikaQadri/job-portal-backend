require("dotenv").config();
const { User,StructuredResume } = require("../models");

// const getUserProfile = async (req, res) => {
//   try {
//     console.log("User from middleware:", req.user);

//     if (!req.user || !req.user.id) {
//       return res
//         .status(400)
//         .json({ error: "User not found or not authenticated" });
//     }

//     // Fetch user from DB 
//     const user = await User.findByPk(req.user.id, {
//       attributes: [
//         "fullName",
//         "username",
//         "email",
//         "title",
//         "experience",
//         "education",
//         "personalwebsite",
//         "profilepic",
//         "resume",
//         "location",
//         "phoneNumber",
//         "bioGraphy",
//       ],
//     });

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Build base URL for files
//     const baseUrl = `${req.protocol}://${req.get("host")}`;

//     res.json({
//       fullName: user.fullName,
//       username: user.username,
//       email: user.email,
//       title: user.title,
//       experience: user.experience,
//       education: user.education,
//       personalwebsite: user.personalwebsite,
//       profilepic: user.profilepic
//         ? `${baseUrl}/images/${user.profilepic}`
//         : null,
//       resume: user.resume ? `${baseUrl}/resume/${user.resume}` : null,
//       location: user.location,
//       phoneNumber: user.phoneNumber,
//       bioGraphy: user.bioGraphy,
//     });
//   } catch (err) {
//     console.error("Error fetching user profile:", err);
//     res.status(500).json({ error: err.message });
//   }
// };


const getUserProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(400).json({ error: "User not found or not authenticated" });
    }

    const user = await User.findByPk(req.user.id, {
      attributes: [
        "fullName",
        "username",
        "email",
        "title",
        "experience",
        "education",
        "personalwebsite",
        "profilepic",
        "resume",
        "location",
        "phoneNumber",
        "bioGraphy",
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const structuredResume = await StructuredResume.findOne({
      where: { userId: req.user.id },
    });

    const hasStructuredResume = !!structuredResume;
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // --- Fix duplication like reference controller ---
    let profileUrl = null;
    if (user.profilepic) {
      let pic = user.profilepic.trim();
      // if stored value already has full http path, extract only file name
      if (pic.includes("http://") || pic.includes("https://")) {
        pic = pic.split("/").pop();
      }
      profileUrl = `${baseUrl}/images/${pic}`;
    }

    let resumeUrl = null;
    if (user.resume) {
      let resFile = user.resume.trim();
      if (resFile.includes("http://") || resFile.includes("https://")) {
        resFile = resFile.split("/").pop();
      }
      resumeUrl = `${baseUrl}/resume/${resFile}`;
    }

    res.json({
      success: true,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      title: user.title,
      experience: user.experience,
      education: user.education,
      personalwebsite: user.personalwebsite,
      profilepic: profileUrl,
      resume: resumeUrl,
      location: user.location,
      phoneNumber: user.phoneNumber,
      bioGraphy: user.bioGraphy,
      hasStructuredResume,
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: err.message });
  }
};




// const getUserProfile = async (req, res) => {
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(400).json({ error: "User not found or not authenticated" });
//     }

//     const user = await User.findByPk(req.user.id, {
//       attributes: [
//         "fullName",
//         "username",
//         "email",
//         "title",
//         "experience",
//         "education",
//         "personalwebsite",
//         "profilepic",
//         "resume",
//         "location",
//         "phoneNumber",
//         "bioGraphy",
//       ],
//     });

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     const structuredResume = await StructuredResume.findOne({
//       where: { userId: req.user.id },
//     });

//     const hasStructuredResume = !!structuredResume;

//     const baseUrl = `${req.protocol}://${req.get("host")}`;

//     res.json({
//       success: true,
//       fullName: user.fullName,
//       username: user.username,
//       email: user.email,
//       title: user.title,
//       experience: user.experience,
//       education: user.education,
//       personalwebsite: user.personalwebsite,
//       profilepic: user.profilepic ? `${baseUrl}/images/${user.profilepic}` : null,
//       resume: user.resume ? `${baseUrl}/resume/${user.resume}` : null,
//       location: user.location,
//       phoneNumber: user.phoneNumber,
//       bioGraphy: user.bioGraphy,
//       hasStructuredResume, 
//     });
//   } catch (err) {
//     console.error("Error fetching user profile:", err);
//     res.status(500).json({ error: err.message });
//   }
// };


const updateUserProfile = async (req, res) => {
  try {
    console.log("User from middleware:", req.user);

    if (!req.user || !req.user.id) {
      return res
        .status(400)
        .json({ error: "User not found or not authenticated" });
    }

    // Fetch user from DB
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const allowedFields = [
      "fullName",
      "title",
      "email",
      "experience",
      "education",
      "personalwebsite",
      "location",
      "phoneNumber",
      "bioGraphy",
      "profilepic",
      "resume",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    res.json({
      message: "Profile updated successfully",
      user: {
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        title: user.title,
        experience: user.experience,
        education: user.education,
        personalwebsite: user.personalwebsite,
        profilepic: user.profilepic
          ? `${baseUrl}/images/${user.profilepic}`
          : null,
        resume: user.resume
         ? `${baseUrl}/resume/${user.resume}` 
         : null,
        location: user.location,
        phoneNumber: user.phoneNumber,
        bioGraphy: user.bioGraphy,
      },
    });
  } catch (err) {
    console.error("Error updating user profile:", err);
    res.status(500).json({ error: err.message });
  }
};


const updateAdminProfile = async (req, res) => {
  try {
    console.log("User from middleware:", req.user);

    if (!req.user || !req.user.id) {
      return res
        .status(400)
        .json({ success: false,error: "User not found or not authenticated" });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false,error: "User not found" });
    }

    const allowedFields = [
      "fullName",
      // "email",
      "phoneNumber",
      // "profilepic",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    res.json({
      success: true,
      message: "Admin Profile updated successfully",
      user: {
        fullName: user.fullName,
        // email: user.email,
        // profilepic: user.profilepic
        //   ? `${baseUrl}/images/${user.profilepic}`
        //   : null,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (err) {
    console.error("Error updating Admin profile:", err);
    res.status(500).json({ error: err.message });
  }
};

const getAdminProfile = async (req, res) => {
  try {
    console.log("User from middleware:", req.user);

    if (!req.user || !req.user.id) {
      return res
        .status(400)
        .json({success: false, error: "User not found or not authenticated" });
    }

    // Fetch user from DB 
    const user = await User.findByPk(req.user.id, {
      attributes: [
      "fullName",
      "email",
      "phoneNumber",
      "profilepic",
      ],
    });

    if (!user) {
      return res.status(404).json({ success: false,error: "User not found" });
    }

    // Build base URL for files
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    res.json({
      success: true,
      fullName: user.fullName,
      email: user.email,
      profilepic: user.profilepic
        ? `${baseUrl}/images/${user.profilepic}`
        : null,
      phoneNumber: user.phoneNumber,
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: err.message });
  }
};



module.exports = { getUserProfile, updateUserProfile, updateAdminProfile, getAdminProfile };


// require('dotenv').config();
// const { User } = require("../models");

// const getUserProfile = async (req,res) =>{
//   try{
//         console.log("User from middleware:", req.user);

//     if (!req.user || !req.user.id) {
//       return res.status(400).json({ error: "User not found or not authenticated" });
//     }

//     const user = req.user;
//     res.json({
//       fullName : user.fullName,
//       username : user.username,
//       email : user.email,
//       title : user.title,
//       experience : user.experience,
//       education : user.education,
//       personalwebsite : user.personalwebsite,
//       profilepic : user.profilepic,
//       resume : user.resume,
//       location : user.location,
//       phoneNumber : user.phoneNumber,
//       bioGraphy : user.bioGraphy
//     });
//   }
//   catch(err){
//     res.status(500).json({error:err.message});
//   }
// };



// const updateUserProfile = async (req, res) => {
//   try {
//     console.log("User from middleware:", req.user);

//     if (!req.user || !req.user.id) {
//       return res
//         .status(400)
//         .json({ error: "User not found or not authenticated" });
//     }

//     // Fetch user from DB (Sequelize instance, not plain object)
//     const user = await User.findByPk(req.user.id);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     const allowedFields = [
//       "fullName",
//       "title",
//       "email",
//       "experience",
//       "education",
//       "personalwebsite",
//       "location",
//       "phoneNumber",
//       "bioGraphy",
//     ];

//     allowedFields.forEach((field) => {
//       if (req.body[field] !== undefined) {
//         user[field] = req.body[field];
//       }
//     });

//     await user.save();

//     res.json({
//       message: "Profile updated successfully",
//       user,
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // const updateUserProfile = async (req, res) =>{
// //   try{
    
// //     console.log("User from middleware:", req.user);

// //     if (!req.user || !req.user.id) {
// //       return res.status(400).json({ error: "User not found or not authenticated" });
// //     }

// //     const user = req.user;

// //     const alloweFields= [ 'fullname','title','email','experience','education', 'personalwebsite', 'location', 'phoneNumber', 'bioGraphy'];
// //     alloweFields.forEach(field =>{
// //       if (req.body[field]!==undefined) user[field] = req.body[field];
// //     });

// //     await user.save();
// //     next();
// //     res.json({message: 'Profile updated successfully', user});
// //   }
// //   catch(err){
// //     res.status(500).json({error:err.message});
// //   }
// // };



// const updateAdminProfile = async (req, res) =>{
//   try {


    
//   } catch (err) {
    
//   }
// }

// module.exports = { getUserProfile, updateUserProfile, updateAdminProfile }

// jdgu ndjv malaika { const getuser = async =>{ try {]catch(err)}
  // }
// kdkkols }