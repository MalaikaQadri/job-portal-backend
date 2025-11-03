const { SavedJob, Job, User } = require('../models');

const saveJob = async (req, res) => {
  try {
    const userId = req.user.id;  
    const { jobId } = req.body;

    const existing = await SavedJob.findOne({ where: { userId, jobId } });
    if (existing) {
      return res.status(400).json({ success:true, message: 'Job already saved' });
    }

    const savedJob = await SavedJob.create({ userId, jobId });
    return res.status(201).json({ 
      success: true,
      message: 'Job saved successfully',
      savedJob,
     });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


 


// const getMySavedJobs = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const savedJobs = await SavedJob.findAll({
//       where: { userId },
//       include: [
//         {
//           model: Job,
//           as: "job",
//           attributes: [
//             "id",
//             "title",
//             "locationId",
//             "jobType",
//             "salaryMin",
//             "salaryMax",
//             "status"
//           ],
//           include: [
//             {
//               model: User,
//               as: "recruiter",
//               attributes: ["id", "profilepic"]
//             }
//           ]
//         }
//       ]
//     });

//     const baseUrl = `${req.protocol}://${req.get("host")}`;

//     const formattedJobs = savedJobs
//       .map(saved => {
//         const recruiter = saved.job?.recruiter;
//         let profileUrl = null;

//         if (recruiter?.profilepic) {
//           let pic = recruiter.profilepic.trim();

//           if (pic.includes("http://") || pic.includes("https://")) {
//             pic = pic.split("/").pop();
//           }

//           profileUrl = `${baseUrl}/images/${pic}`;
//         }

//         return saved.job 
//           ? {
//               id: saved.id,
//               job: {
//                 id: saved.job.id,
//                 title: saved.job.title,
//                 locationId: saved.job.locationId,
//                 jobType: saved.job.jobType,
//                 salaryMin: saved.job.salaryMin,
//                 salaryMax: saved.job.salaryMax,
//                 status: saved.job.status,
//                 profilepic: profileUrl
//               }
//             }
//           : null;
//       })
//       .filter(job => job !== null);

//     res.status(200).json(formattedJobs);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


const getMySavedJobs = async (req, res) => {
  try {
    const userId = req.user.id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: savedJobs } = await SavedJob.findAndCountAll({
      where: { userId },
      include: [
        {
          model: Job,
          as: "job",
          attributes: [
            "id",
            "title",
            "locationId",
            "jobType",
            "salaryMin",
            "salaryMax",
            "status"
          ],
          include: [
            {
              model: User,
              as: "recruiter",
              attributes: ["id", "profilepic"]
            }
          ]
        }
      ],
      limit,
      offset
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const formattedJobs = savedJobs
      .map(saved => {
        const recruiter = saved.job?.recruiter;
        let profileUrl = null;

        if (recruiter?.profilepic) {
          let pic = recruiter.profilepic.trim();

          if (pic.includes("http://") || pic.includes("https://")) {
            pic = pic.split("/").pop();
          }

          profileUrl = `${baseUrl}/images/${pic}`;
        }

        return saved.job
          ? {
              id: saved.id,
              job: {
                id: saved.job.id,
                title: saved.job.title,
                locationId: saved.job.locationId,
                jobType: saved.job.jobType,
                salaryMin: saved.job.salaryMin,
                salaryMax: saved.job.salaryMax,
                status: saved.job.status,
                profilepic: profileUrl
              }
            }
          : null;
      })
      .filter(job => job !== null);

    return res.status(200).json({
      success: true,
      totalSavedJobs: count,
      currentPage: page,
      itemsPerPage: limit,
      totalPages: Math.ceil(count / limit),
      savedJobs: formattedJobs
    });

  } catch (err) {
    console.error("Error fetching saved jobs:", err);
    res.status(500).json({
      success: false,
      error: "Something went wrong while fetching saved jobs."
    });
  }
};




const removeSavedJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;

    const deleted = await SavedJob.destroy({ where: { userId, jobId } });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Saved job not found' });
    }

    res.json({ success: false, message: 'Job removed from saved list' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { removeSavedJob, getMySavedJobs, saveJob,  }
