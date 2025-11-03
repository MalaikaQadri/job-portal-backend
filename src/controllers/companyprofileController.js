require("dotenv").config();
const { isRecruiter } = require("../middlewares/authMiddleware");
const { User, Industry  } = require("../models");


// const getRecruiterProfile = async (req, res) => {
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
//         'fullName',
//         'email',
//         'title',
//         'companyName',
//         'aboutUs',
//         'profilepic',
//         'bannerImage',
//         'organizationType',
//         'teamSize',
//         'industryTypes',
//         'yearOfEstablishment',
//         'companyWebsite',
//         'facebookLink',
//         'instagramLink',
//         'linkedInLink',
//         'twitterLink',
//         'location',
//         'phoneNumber'
//       ],
//     });

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     const baseUrl = `${req.protocol}://${req.get("host")}`;

//     // --- Clean and format profile image ---
//     let profileUrl = null;
//     if (user.profilepic) {
//       let pic = user.profilepic.trim();
//       if (pic.includes("http://") || pic.includes("https://")) {
//         pic = pic.split("/").pop(); // remove any previous URL part
//       }
//       profileUrl = `${baseUrl}/images/${pic}`;
//     }

//     // --- Clean and format banner image ---
//     let bannerUrl = null;
//     if (user.bannerImage) {
//       let banner = user.bannerImage.trim();
//       if (banner.includes("http://") || banner.includes("https://")) {
//         banner = banner.split("/").pop();
//       }
//       bannerUrl = `${baseUrl}/images/${banner}`;
//     }

//     res.json({
//       fullName: user.fullName,
//       email: user.email,
//       title: user.title,
//       companyName: user.companyName,
//       aboutUs: user.aboutUs,
//       profilepic: profileUrl,
//       bannerImage: bannerUrl,
//       organizationType: user.organizationType,
//       teamSize: user.teamSize,
//       industryTypes: user.industryTypes,
//       yearOfEstablishment: user.yearOfEstablishment,
//       companyWebsite: user.companyWebsite,
//       facebookLink: user.facebookLink,
//       instagramLink: user.instagramLink,
//       linkedInLink: user.linkedInLink,
//       twitterLink: user.twitterLink,
//       location: user.location,
//       phoneNumber: user.phoneNumber,
//     });

//   } catch (err) {
//     console.error("Error fetching user profile:", err);
//     res.status(500).json({ error: err.message });
//   }
// };



const getRecruiterProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(400).json({ error: "User not found or not authenticated" });
    }

    // Fetch user first
    const user = await User.findByPk(req.user.id, {
      attributes: [
        'fullName',
        'email',
        'title',
        'companyName',
        'aboutUs',
        'profilepic',
        'bannerImage',
        'organizationType',
        'teamSize',
        'industryTypes',
        'yearOfEstablishment',
        'companyWebsite',
        'facebookLink',
        'instagramLink',
        'linkedInLink',
        'twitterLink',
        'location',
        'phoneNumber'
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // ✅ Fetch industry name using the ID stored in industryTypes
    let industryName = null;
    if (user.industryTypes && !isNaN(user.industryTypes)) {
      const industry = await Industry.findByPk(user.industryTypes);
      industryName = industry ? industry.name : null;
    }

    // Fix image URLs
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const formatImageUrl = (img) => {
      if (!img) return null;
      let clean = img.trim();
      if (clean.includes("http://") || clean.includes("https://")) {
        clean = clean.split("/").pop();
      }
      return `${baseUrl}/images/${clean}`;
    };

    res.json({
      success: true,
      fullName: user.fullName,
      email: user.email,
      title: user.title,
      companyName: user.companyName,
      aboutUs: user.aboutUs,
      profilepic: formatImageUrl(user.profilepic),
      bannerImage: formatImageUrl(user.bannerImage),
      organizationType: user.organizationType,
      teamSize: user.teamSize,
      industryTypes: user.industryTypes ? Number(user.industryTypes) : null,
      // industryTypes: industryName, // ✅ now returns "Technology" instead of "35"
      yearOfEstablishment: user.yearOfEstablishment,
      companyWebsite: user.companyWebsite,
      facebookLink: user.facebookLink,
      instagramLink: user.instagramLink,
      linkedInLink: user.linkedInLink,
      twitterLink: user.twitterLink,
      location: user.location,
      phoneNumber: user.phoneNumber,
    });

  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: err.message });
  }
};


const getRecruiterProffile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(400).json({ error: "User not found or not authenticated" });
    }

    // Fetch user first
    const user = await User.findByPk(req.user.id, {
      attributes: [
        'fullName',
        'email',
        'title',
        'companyName',
        'aboutUs',
        'profilepic',
        'bannerImage',
        'organizationType',
        'teamSize',
        'industryTypes',
        'yearOfEstablishment',
        'companyWebsite',
        'facebookLink',
        'instagramLink',
        'linkedInLink',
        'twitterLink',
        'location',
        'phoneNumber'
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // ✅ Fetch industry name using the ID stored in industryTypes
    let industryName = null;
    if (user.industryTypes && !isNaN(user.industryTypes)) {
      const industry = await Industry.findByPk(user.industryTypes);
      industryName = industry ? industry.name : null;
    }

    // Fix image URLs
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const formatImageUrl = (img) => {
      if (!img) return null;
      let clean = img.trim();
      if (clean.includes("http://") || clean.includes("https://")) {
        clean = clean.split("/").pop();
      }
      return `${baseUrl}/images/${clean}`;
    };

    res.json({
      success: true,
      fullName: user.fullName,
      email: user.email,
      title: user.title,
      companyName: user.companyName,
      aboutUs: user.aboutUs,
      profilepic: formatImageUrl(user.profilepic),
      bannerImage: formatImageUrl(user.bannerImage),
      organizationType: user.organizationType,
      teamSize: user.teamSize,
      // industryTypes: user.industryTypes ? Number(user.industryTypes) : null,
      industryTypes: industryName, 
      yearOfEstablishment: user.yearOfEstablishment,
      companyWebsite: user.companyWebsite,
      facebookLink: user.facebookLink,
      instagramLink: user.instagramLink,
      linkedInLink: user.linkedInLink,
      twitterLink: user.twitterLink,
      location: user.location,
      phoneNumber: user.phoneNumber,
    });

  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: err.message });
  }
};






const updateRecruiterProfile = async (req, res) => {
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
        'fullName',
        'email',
        'title',
        'companyName',
        'aboutUs',
        'profilepic',
        'bannerImage',
        'organizationType',
        'teamSize',
        'industryTypes',
        'yearOfEstablishment',
        'companyWebsite',
        'facebookLink',
        'instagramLink',
        'linkedInLink',
        'twitterLink',
        'location',
        'phoneNumber'
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
      message: "Company Profile updated successfully",
      user: {
      fullName: user.fullName,
      email: user.email,
      title: user.title,
      companyName: user.companyName,
      aboutUs: user.aboutUs,
      profilepic: user.profilepic
        ? `${baseUrl}/images/${user.profilepic}`
        : null,
      bannerImage: user.bannerImage 
      ? `${baseUrl}/images/${user.bannerImage}`
        : null,
      organizationType: user.organizationType,
      teamSize: user.teamSize,
      industryTypes: user.industryTypes,
      yearOfEstablishment: user.yearOfEstablishment,
      companyWebsite: user.companyWebsite,
      facebookLink: user.facebookLink,
      instagramLink: user.instagramLink,
      linkedInLink: user.linkedInLink,
      twitterLink: user.twitterLink,
      location: user.location,
      phoneNumber: user.phoneNumber,
      },
    });
  } catch (err) {
    console.error("Error updating Company profile:", err);
    res.status(500).json({ error: err.message });
  }
};

const getRecruiterProfileById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Recruiter ID is required" });
    }

    // Fetch recruiter by ID
    const user = await User.findByPk(id, {
      attributes: [
        'fullName',
        'email',
        'title',
        'companyName',
        'aboutUs',
        'profilepic',
        'bannerImage',
        'organizationType',
        'teamSize',
        'industryTypes',
        'yearOfEstablishment',
        'companyWebsite',
        'facebookLink',
        'instagramLink',
        'linkedInLink',
        'twitterLink',
        'location',
        'phoneNumber'
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "Recruiter not found" });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // --- Format profile image ---
    let profileUrl = null;
    if (user.profilepic) {
      let pic = user.profilepic.trim();
      if (pic.includes("http://") || pic.includes("https://")) {
        pic = pic.split("/").pop(); // clean any URL prefix
      }
      profileUrl = `${baseUrl}/images/${pic}`;
    }

    // --- Format banner image ---
    let bannerUrl = null;
    if (user.bannerImage) {
      let banner = user.bannerImage.trim();
      if (banner.includes("http://") || banner.includes("https://")) {
        banner = banner.split("/").pop();
      }
      bannerUrl = `${baseUrl}/images/${banner}`;
    }

    // Send formatted recruiter profile
    res.json({
      success: true,
      fullName: user.fullName,
      email: user.email,
      title: user.title,
      companyName: user.companyName,
      aboutUs: user.aboutUs,
      profilepic: profileUrl,
      bannerImage: bannerUrl,
      organizationType: user.organizationType,
      teamSize: user.teamSize,
      industryTypes: user.industryTypes,
      yearOfEstablishment: user.yearOfEstablishment,
      companyWebsite: user.companyWebsite,
      facebookLink: user.facebookLink,
      instagramLink: user.instagramLink,
      linkedInLink: user.linkedInLink,
      twitterLink: user.twitterLink,
      location: user.location,
      phoneNumber: user.phoneNumber,
    });

  } catch (err) {
    console.error("Error fetching recruiter profile by ID:", err);
    res.status(500).json({ error: err.message });
  }
};


module.exports = { getRecruiterProfile, updateRecruiterProfile,getRecruiterProfileById ,getRecruiterProffile };

