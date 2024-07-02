import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";
import { createTweet } from "../controllers/tweet.controller";

const router = Router() ;

router.use(verifyJWT) ;

router.route('/post').post(upload.single('media'),createTweet)