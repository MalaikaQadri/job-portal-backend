const {Op} = require('sequelize');
const { where } = require('sequelize');
const bcrypt = require('bcrypt')
const { User,StructuredResume } = require('../models');

//CREATE
const createUser = async (req, res) => {
    try {
    const { fullName, username, email, password, role } =req.body;

    if (!fullName || !username || !email || !password || !role){
        return res.status(400).json({ error : 'All fields are required'})
    }
    const existingUser = await User.findOne({ where: {email}});
    if(existingUser){
        return res.status(409).json({  error: 'Email ALready Exists'})
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({
        fullName, username, email, password: hashedPassword, role, isEmailVerified: false, is2FAEnabled: false,createdAt: new Date(),updatedAt: new Date()
    });
    const { password: _, ...userData } = user.toJSON();
    res.status(201).json({ message: 'User Created', user:userData });
    } 
    catch (error) {
        res.status(500).json({ error: error.message });
        
    }
};


const getApplicantProfileById = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    // if (req.user.role !== "recruiter", "admin") {
    //   return res.status(403).json({ success: false, message: "Access denied. Recruiter or Admin  role required." });
    // }

    const applicantId = req.params.id;
    if (!applicantId) {
      return res.status(400).json({ success: false, message: "Applicant id is required in params." });
    }

    const user = await User.findByPk(applicantId, {
      attributes: [
        "id",
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
        "role",
      ],
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "Applicant not found." });
    }

    if (user.role && user.role !== "applicant") {
      return res.status(400).json({ success: false, message: "The requested user is not an applicant." });
    }

 
    const structuredResume = await StructuredResume.findOne({
      where: { userId: applicantId },
    });

    const hasStructuredResume = !!structuredResume;

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    return res.status(200).json({
      success: true,
      applicant: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        title: user.title,
        experience: user.experience,
        education: user.education,
        personalwebsite: user.personalwebsite,
        profilepic: user.profilepic ? `${baseUrl}/images/${user.profilepic}` : null,
        resume: user.resume ? `${baseUrl}/resume/${user.resume}` : null,
        location: user.location,
        phoneNumber: user.phoneNumber,
        bioGraphy: user.bioGraphy,
        hasStructuredResume, 
      },
    });
  } catch (err) {
    console.error("Error fetching applicant profile by id:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};



// const getApplicantProfileById = async (req, res) => {
//   try {

//     if (!req.user || !req.user.id) {
//       return res.status(401).json({ success: false, message: "Not authenticated" });
//     }

//     if (req.user.role !== "recruiter") {
//       return res.status(403).json({ success: false, message: "Access denied. Recruiter role required." });
//     }

//     const applicantId = req.params.id;
//     if (!applicantId) {
//       return res.status(400).json({ success: false, message: "Applicant id is required in params." });
//     }

//     const user = await User.findByPk(applicantId, {
//       attributes: [
//         "id",
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
//       return res.status(404).json({ success: false, message: "Applicant not found." });
//     }

//     if (user.role && user.role !== "applicant") {
//       return res.status(400).json({ success: false, message: "The requested user is not an applicant." });
//     }

//     const baseUrl = `${req.protocol}://${req.get("host")}`;


//     return res.status(200).json({
//       success: true,
//       applicant: {
//         id: user.id,
//         fullName: user.fullName,
//         username: user.username,
//         email: user.email,
//         title: user.title,
//         experience: user.experience,
//         education: user.education,
//         personalwebsite: user.personalwebsite,
//         profilepic: user.profilepic ? `${baseUrl}/images/${user.profilepic}` : null,
//         resume: user.resume ? `${baseUrl}/resume/${user.resume}` : null,
//         location: user.location,
//         phoneNumber: user.phoneNumber,
//         bioGraphy: user.bioGraphy,
//       },
//     });
//   } catch (err) {
//     console.error("Error fetching applicant profile by id:", err);
//     return res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

const getAllApplicants = async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    let { page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const offset = (page - 1) * limit;

    const { rows: applicants, count: totalApplicants } = await User.findAndCountAll({
      where: { role: "applicant" },
      attributes: ["id", "fullName", "title", "profilepic"],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    const formattedApplicants = applicants.map((applicant) => ({
      id: applicant.id,
      name: applicant.fullName,
      title: applicant.title,
      profilepic: applicant.profilepic
        ? `${baseUrl}/images/${applicant.profilepic}`
        : null,
    }));

    return res.status(200).json({
      success: true,
      totalApplicants,
      itemsPerPage: limit,
      currentPage: page,
      totalPages: Math.ceil(totalApplicants / limit),
      applicants: formattedApplicants,
    });
  } catch (error) {
    console.error("Error fetching applicants:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching applicants.",
    });
  }
};

const getUser = async (req,res) =>{
    console.log(User); 
try {
    const users = await User.findAll({
        attributes: { exclude: ['password'] } 
    });
    res.status(200).json(users);
} catch (error) {
    res.status(500).json({ error: error.message });
}
}

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if id is provided and is a number
        if (!id || isNaN(id)) {
            return res.status(400).json({ error: 'Valid user ID is required' });
        }
        // Find user by primary key (ID)
        const user = await User.findByPk(id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// UPDATE user
const updateUser = async (req, res)=>{
    try{
    const { id } = req.params;
    const { fullName, username, email, role} = req.body;
    // Check if atleast one field is provided
    if ( !fullName && !username && !email && !role ){
        return res.status(409).json({
            error: 'At least one field must be provided to update'
        })
    }
    // Check if email is already exits
    if (email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser && existingUser.id != id) {
        return res.status(409).json({ error: 'Email already in use by another user' });
    }
    }
    // Build fields to update dynamically 
    const updateFields = {};
    if (fullName) updateFields.fullName = fullName;
    if (username) updateFields.username = username;
    if (email) updateFields.email = email;
    if (role) updateFields.role = role;
    const [updated] = await User.update(updateFields, { where: { id } });
    if (updated){
        const updatedUser = await User.findByPk(id,{
            attributes: { exclude: ['password'] }
        })
        res.status(200).json({
            message: 'User Updated Succesfully', user:updatedUser
        });
    }
    else{
        res.status(404).json({ error: 'User Not found' })
    }
}
catch(error){
    res.status(500).json({error: error.message})
}
};




// DELETE USER 
// const deleteUser = async(req,res)=>{

//     try{
//         const { id } = req.params
//         if(!id){
//         return res.status(400).json({ error: 'User ID required'});
//         }
    
//         const user = await User.findByPk(id);
//         if (!user){
//             return res.status(404).json({ error: 'User not found' });
//         }
    
//         await User.destroy({ where:{ id } });
//         res.status(200).json({ message: 'User deleted Successfully' });
//     }
//     catch(error){
//         res.status(500).json({error: error.message})
//     }
// }

// Deactivate user
// const deactivateUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await User.update({ status: "inactive" }, { where: { id } });
//     res.json({ message: "User account deactivated successfully" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// Reactivate user
// const reactivateUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await User.update({ status: "active" }, { where: { id } });
//     res.json({ message: "User account reactivated successfully" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// Banned User
// const banUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await User.update({ status: "banned" }, { where: { id } });
//     res.json({ message: "User banned successfully" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// Soft delete user (paranoid:true)
// const softDeleteUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await User.destroy({ where: { id } }); // sets deletedAt
//     res.json({ message: "User soft deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// Restore soft-deleted user
// const restoreUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await User.restore({ where: { id } }); // only works with paranoid:true
//     res.json({ message: "User restored successfully" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// Hard delete user (permanent)
// const hardDeleteUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await User.destroy({ where: { id }, force: true }); // bypass paranoid
//     res.json({ message: "User permanently deleted" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

const changePassword = async (req, res) => {
  try {
    const userId = req.user?.id; 
    const { oldPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false,  message: "Unauthorized. User not found." });
    }

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Old and new passwords are required." });
    }

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Check old password
    const isMatch = await bcrypt.compare(oldPassword, user.password || "");
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Old password is incorrect." });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ success: true, message: "Password changed successfully." });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};




// const getUserAccount = async (req, res) => {
//   try {
//     const users = await User.findAll({
//       attributes: ["id", "fullName", "email", "phoneNumber", "status", "role"],
//       paranoid:false
//     });
//     res.status(200).json(users);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

const getUserAccount = async (req, res) => {
  try {

    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count: totalUsers, rows: users } = await User.findAndCountAll({
      attributes: ["id", "fullName", "email", "phoneNumber", "status", "role"],
      paranoid: false,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      totalUsers,
      currentPage: page,
      itemsPerPage: limit,
      totalPages: Math.ceil(totalUsers / limit),
      users,
    });
  } catch (err) {
    console.error("Error fetching user accounts:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};






const getallManageUsers = async (req, res) => {
  try {
    console.log("Inside Get All Manage Users");
    const { role: roleParam } = req.query;
    console.log("Query role param:", roleParam);

    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let whereClause = {};
    if (roleParam) {
      whereClause.role = { [Op.eq]: roleParam };
    }

    console.log("Where Clause:", whereClause);

    const { count: totalUsers, rows: users } = await User.findAndCountAll({
      attributes: ["id", "fullName", "email", "phoneNumber", "role"],
      where: whereClause,
      paranoid: false,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    console.log("Users Found:", users.length);

    return res.status(200).json({
      success: true,
      totalUsers,
      currentPage: page,
      itemsPerPage: limit,
      totalPages: Math.ceil(totalUsers / limit),
      users,
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};


const manageUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body; 

    let message = "";

    switch (type) {
      case "active":
        await User.update({ status: "active" }, { where: { id } });
        message = "User activated successfully";
        break;

      case "inactive":
        await User.update({ status: "inactive" }, { where: { id } });
        message = "User deactivated successfully";
        break;

      case "banned":
        await User.update({ status: "banned" }, { where: { id } });
        message = "User banned successfully";
        break;

      // case "softDelete":
      //   await User.destroy({ where: { id } }); 
      //   message = "User soft deleted successfully";
      //   break;

      // case "ban":
      //   await User.restore({ where: { id } });
      //   message = "User report successfully";
      //   break;

      case "delete":
        await User.destroy({ where: { id }, force: true });
        message = "User permanently deleted";
        break;

      default:
        return res.status(400).json({ error: "Invalid type" });
    }
    const updateUser = await User.findByPk(id, {paranoid:false});

    res.json({ success: true, message,user:updateUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createUser,changePassword, getUser, getUserById, updateUser, getallManageUsers, manageUserStatus, getUserAccount, getAllApplicants, getApplicantProfileById  }


