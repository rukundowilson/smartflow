// routes/registration.routes.js
import {Router} from "express";
const router = Router();
import {registerUser,systemUsers, reviewRegistrationApplication} from '../controllers/userController.js';

router.post('/auth/signup', registerUser);
router.get('/users/dir', systemUsers);
router.post('/application/review', reviewRegistrationApplication);


export default router;
