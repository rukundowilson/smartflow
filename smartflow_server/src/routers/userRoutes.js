// routes/registration.routes.js
import {Router} from "express";
const router = Router();
import {registerUser,systemUsers} from '../controllers/userController.js';

router.post('/auth/signup', registerUser);
router.get('/users/dir', systemUsers);


export default router;
