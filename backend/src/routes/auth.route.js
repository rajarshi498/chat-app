import express from 'express';
const router = express.Router();
import {protectRoute} from "../middleware/auth.middleware.js"
import { signup,login,logout,updateProfile} from '../controllers/auth.controller.js';


router.post('/signup', signup);
router.post('/login', login);
router.put('/update-profile',protectRoute,updateProfile);
router.post('/logout', logout);
router.get("/check",protectRoute, (req,res)=>{ 
    res.status(200).json(req.user);
})


export default router;