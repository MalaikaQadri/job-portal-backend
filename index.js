require('dotenv').config();
const path = require("path");
const express = require("express");
const cors = require('cors');
const os = require ('os');
const session = require('express-session');
const { dbconnection } = require("./src/config/dbConnection");
const http = require('http');           
const initSocket = require('./src/sockets'); 
const redis = require('./src/config/redis');
const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/authRoutes');
const userpersonalprofileRoutes = require("./src/routes/userpersonalprofileRoutes");
const structuredresumeRoutes = require("./src/routes/structuredresumeRoutes");
const imageRoutes = require('./src/routes/imageRoutes');
const industryRoutes = require('./src/routes/industryRoutes');
const jobfilterRoutes = require('./src/routes/jobfilterRoutes');
const companyprofileRoutes = require('./src/routes/companyprofileRoutes');
const jobpostRoutes = require('./src/routes/jobpostRoutes');
const savedjobsRoutes = require('./src/routes/savejobsRoutes');
const applicationRoutes = require('./src/routes/applicationRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const cmsRoutes = require('./src/routes/cmsRoutes');
const locationRoutes = require('./src/routes/locationRoutes');
const resumeMatchScoreRoutes = require('./src/routes/resumeMatchScoreRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const messageRoutes = require('./src/routes/messageRoutes');

const app = express();
const port = process.env.PORT;
const allowedOrigins = [
    'http://192.168.1.126:3000', 
    'http://localhost:3000', 
];
const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('This origin is not allowed by CORS'));
        }
    },
    credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());


app.use('/images', express.static(path.join(__dirname, 'public/Images')));
app.use('/resume', express.static(path.join(__dirname, 'public/resume')));
// Session and passport middlewares here
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
         sameSite: 'lax',
         secure: process.env.NODE_ENV === 'production' 
    }
}));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/structuredresume', structuredresumeRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/profile', userpersonalprofileRoutes);
app.use('/api/companyprofile', companyprofileRoutes )
app.use('/public', express.static('public'));
app.use('/api/industries', industryRoutes);
app.use('/api/locations', locationRoutes );
app.use('/api/jobs', jobfilterRoutes);
app.use('/api/jobpost', jobpostRoutes );
app.use('/api/saved-jobs', savedjobsRoutes);
app.use('/api/application',applicationRoutes );
app.use('/api/matchScore', resumeMatchScoreRoutes );
app.use("/api/notifications", notificationRoutes);
app.use('/api/admin', analyticsRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Backend API is running!' });
});

const server = http.createServer(app);

function getLocalNetworkIp() {
  const nets = os.networkInterfaces();
  let validIp = 'localhost';

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (
        net.family === 'IPv4' &&
        !net.internal &&
        !net.address.startsWith('169.') && 
        !name.toLowerCase().includes('virtual') &&
        !name.toLowerCase().includes('vmware') &&
        !name.toLowerCase().includes('vbox') &&
        !name.toLowerCase().includes('hyper')
      ) {
        validIp = net.address;
      }
    }
  }
  return validIp;
}

dbconnection()
    .then(() => {
    initSocket(server);
        server.listen(port, '0.0.0.0', () => {
            const networkIp = getLocalNetworkIp();
            console.log(`Server is running on: 0.0.0.0:${port}`);
            console.log(`Local:   http://localhost:${port}`);
            console.log(`Network: http://${networkIp}:${port}`);
        });
    })
    .catch((error) => {
        console.error('Failed to connect to the database:', error);
    }); 
