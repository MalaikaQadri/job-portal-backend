const { spawn } = require("child_process");
const path = require("path");
const { Image, User, AIResumeParsing } = require("../models");
const { Op } = require("sequelize");

const uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: "No file uploaded" });
   
    console.log(req.user)    

    const image = await Image.create({
      userId: req.user.id,
      filename: req.file.filename,
      filepath: `/public/Images/${req.file.filename}`,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
       console.log(image)
        await User.update(
          // { profilepic: req.file ? req.file.filename : null },
            { profilepic:req.file.filename },
      { where: { id: req.user.id } }
    );


    res.status(201).json({ success: true,  message: "Profile picture uploaded successfully", image });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const uploadBannerImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: "No file uploaded" });
   
    console.log(req.user)    

    const image = await Image.create({
      userId: req.user.id,
      filename: req.file.filename,
      filepath: `/public/Images/${req.file.filename}`,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
       console.log(image)
        await User.update(
          { bannerImage: req.file ? req.file.filename : null },
      { where: { id: req.user.id } }
    );
    res.status(201).json({ success: true,  message: "Banner Image  uploaded successfully", image });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};



// const uploadResumePdf = async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ error: "No resume uploaded" });

//     console.log(req.user)    

//     const resume = await Image.create({
//       userId: req.user.id,
//       filename: req.file.filename,
//       filepath: `/public/Resume/${req.file.filename}`,
//       mimetype: req.file.mimetype,
//       size: req.file.size,
//     });

//      await User.update(
//       // { resume: resumeFile ? resumeFile.filename : null},
//       { resume: req.file ? req.file.filename : null },
//       // { resume: newResume.filepath },
//       { where: { id: req.user.id } }
//     );

//     res.status(201).json({ message: "Resume uploaded successfully", resume });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };



const uploadResumePdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No resume uploaded" });
    }

    // Save resume in Image table
    const resume = await Image.create({
      userId: req.user.id,
      filename: req.file.filename,
      filepath: `/public/resume/${req.file.filename}`,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
    

    // Update User table with resume filename
    await User.update(
      { resume: req.file.filename },
      { where: { id: req.user.id } }
    );

    const resumePath = path.join(__dirname, "..", "..", "public", "resume", req.file.filename);
    console.log("Resume Path Sent to Python:", resumePath);
 

    const process = spawn("python", ["src/python/ResumeParser.py", resumePath]);

    let result = "";
    let errorOutput = "";

    process.stdout.on("data", (data) => {
      result += data.toString("utf8");
    });

    process.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    process.on("close", async (code) => {
      try {
        if (errorOutput) {
          console.error("Python error:", errorOutput);
        }

        if (!result || result.trim() === "") {
          return res.status(500).json({
            success: false,
            error: "Python script returned no output",
            details: errorOutput,
          });
        }

        let parsed;
        try {
          parsed = JSON.parse(result);
        } catch (parseErr) {
          console.error("Invalid JSON from Python:", result);
          return res.status(500).json({
            success: false,
            error: "Invalid JSON returned from resume parser",
            rawOutput: result,
          });
        }

        // Agar Python error return kare
        if (parsed.error) {
          return res.status(500).json({
            success: false,
            error: "Resume parsing failed",
            details: parsed.error,
          });
        }

        // Save parsed data into AIResumeParsing
        const parsedResume = await AIResumeParsing.create({
          userId: req.user.id,
          name: parsed.name,
          email: parsed.email,
          phone: parsed.phone,
          skills: parsed.skills || [],
          education: parsed.education || [],
          experience: parsed.experience || [],
          projects: parsed.projects || [],
          certifications: parsed.certifications || [],
           resumeFile: req.file.filename ,
        });

        res.status(201).json({
          success: true,
          message: "Resume uploaded & parsed successfully",
          resume,
          parsedResume,
        });
      } catch (err) {
        console.error("Parse save error:", err);
        res
          .status(500)
          .json({ error: "Resume uploaded but parsing failed", details: err.message });
      }
    });
  } catch (err) {
    console.error("Controller error:", err);
    res.status(500).json({ error: err.message });
  }
};




module.exports = { uploadProfilePic, uploadResumePdf, uploadBannerImage };

