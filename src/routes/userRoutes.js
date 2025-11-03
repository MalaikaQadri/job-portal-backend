const express = require ('express');
const router = express.Router();
const { createUser, getUser,getUserById, updateUser, manageUserStatus,getallManageUsers, getApplicantProfileById, getUserAccount, changePassword, getAllApplicants} = require('../controllers/userController');
const {  isAdmin, isSelfOrAdmin, authorize } = require('../middlewares/authMiddleware');
const {searchCandidatesByTitle} = require("../controllers/applicantFilterController");



router.get("/applicants/search", searchCandidatesByTitle);

// CREATE - Register a new user
router.post('/register', createUser);
// READ - Get all users [ Admins only ]  protect, isAdmin
router.get('/', getUser);
router.get ('/allApplicants', getAllApplicants);
router.get('/applicants/:id',authorize,  getApplicantProfileById);



router.post('/change-password', authorize, changePassword );



router.get('/allmanageUsers',  getallManageUsers);
router.put('/manageUsersStatus/:id', manageUserStatus );
router.get('/userAccounts', getUserAccount);





// READ - Get single users [ Admins only ]  protect, isSelfOrAdmin,
router.get('/:id',  getUserById);
// UPDATE - Update user by ID
router.put('/:id',authorize, updateUser);
// DELETE - Delete user by ID
// router.delete('/:id', authorize, deleteUser );

// User status and soft and hard delete routes
// router.put("/deactivate/:id", deactivateUser);
// router.put("/reactivate/:id", reactivateUser);
// router.put("/ban/:id", banUser);
// router.delete("/soft-delete/:id", softDeleteUser);
// router.put("/restore/:id", restoreUser);
// router.delete("/hard-delete/:id", hardDeleteUser);





// router.get('/allmanageUsers',  getallManageUsers);
// router.put('/manageUsersStatus/:id', manageUserStatus );
// router.get('/userAccounts', getUserAccount);

// router.get("/applicants/search", searchCandidatesByTitle);

module.exports = router; 