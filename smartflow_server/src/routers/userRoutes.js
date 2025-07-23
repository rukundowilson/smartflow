// routes/registration.routes.js
import {Router} from "express";
const router = Router();
import registerUser from '../controllers/user.js';

router.post('/auth/signup', registerUser);

export default router;
