const multer = require("multer");
const path = require("path");

// Storage for profile images
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/Images/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

// Storage for resumes
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/Resume/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

// File filters (optional but recommended)
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed"), false);
};

const resumeFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") cb(null, true);
  else cb(new Error("Only PDF files are allowed"), false);
};

const uploadImage = multer({ storage: imageStorage, fileFilter: imageFilter });
const uploadResume = multer({ storage: resumeStorage, fileFilter: resumeFilter });

module.exports = { uploadImage, uploadResume };




