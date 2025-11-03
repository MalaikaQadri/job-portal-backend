const path = require("path");
const { spawn } = require("child_process");
const { User, Job, AIResumeParsing, AIResumeMatchScore, Image } = require("../models");

const matchResumeWithJob = async (req, res) => {
  try {

    const userId = req.user.id; 
    const { jobId } = req.params;

    const parsedResume = await AIResumeParsing.findOne({ where: { userId } });
    if (!parsedResume) {
      return res.status(404).json({ success:false, message: "Parsed resume not found" });
    }

    const image = await Image.findOne({ where: { userId } });
    if (!image) {
      return res.status(404).json({ success: false, message: "Resume file not found in database" });
    }

    // Full absolute path banao
    const resumePath = path.join(__dirname, "..", "..", image.filepath);
    console.log("Resume Path Sent to Python:", resumePath);

    const job = await Job.findByPk(jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const python = spawn("python", [
      path.join(__dirname, "../python/resume_match.py"),
      resumePath,
      job.description || "",
      job.experience ? job.experience.toString() : "",
      job.education || ""
    ]);

    let data = "";
    python.stdout.on("data", (chunk) => {
      data += chunk.toString();
    });

    python.stderr.on("data", (err) => {
      console.error("Python Error:", err.toString());
    });

    python.on("close", async (code) => {
      try {
        const result = JSON.parse(data);

        if (result.error) {
          return res.status(500).json({ success: false, message: "Matching failed", details: result.error });
        }

        const matchScore = await AIResumeMatchScore.create({
          userId,
          jobId,
          skillsMatchScore: result.job_match_score.skills,
          experienceMatchScore: result.job_match_score.experience,
          educationMatchScore: result.job_match_score.education,
          totalMatchScore: result.job_match_score.total
        });

        return res.json({ success: true, matchScore });
      } catch (err) {
        console.error("Parse error:", err.message, "Raw Output:", data);
        return res.status(500).json({ success: false, message: "Failed to parse Python output", raw: data });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};




const matchResumeToJob = async (req, res) => {
  try {
    const { userId, jobId } = req.body;

    // 1. User ka parsed resume DB se nikalo
    const parsedResume = await AIResumeParsing.findOne({ where: { userId } });
    if (!parsedResume) {
      return res.status(404).json({ error: "Parsed resume not found" });
    }

    // 2. Resume file Image table se nikalo
    const image = await Image.findOne({ where: { userId } });
    if (!image) {
      return res.status(404).json({ error: "Resume file not found in Image table" });
    }

    // Full absolute path banao
    const resumePath = path.join(__dirname, "..", "..", image.filepath);
    console.log("Resume Path Sent to Python:", resumePath);

    // 3. Job nikalo
    const job = await Job.findByPk(jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    // 4. Python script call karo
    const python = spawn("python", [
      path.join(__dirname, "../python/resume_match.py"),
      resumePath,
      job.description || "",
      job.experience ? job.experience.toString() : "",
      job.education || ""
    ]);

    let data = "";
    python.stdout.on("data", (chunk) => {
      data += chunk.toString();
    });

    python.stderr.on("data", (err) => {
      console.error("Python Error:", err.toString());
    });

    python.on("close", async (code) => {
      try {
        const result = JSON.parse(data);

        if (result.error) {
          return res.status(500).json({ error: "Matching failed", details: result.error });
        }
        const matchScore = await AIResumeMatchScore.create({
          userId,
          jobId,
          skillsMatchScore: result.job_match_score.skills,
          experienceMatchScore: result.job_match_score.experience,
          educationMatchScore: result.job_match_score.education,
          totalMatchScore: result.job_match_score.total
              });


        return res.json({ success: true, matchScore });
      } catch (err) {
        console.error("Parse error:", err.message, "Raw Output:", data);
        return res.status(500).json({ error: "Failed to parse Python output", raw: data });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};





module.exports = { matchResumeWithJob, matchResumeToJob };
