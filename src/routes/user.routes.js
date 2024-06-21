import { registerUser } from "../controllers/user.controller.js";
import {Router} from "express" ;


const router = Router() ;

import { upload } from "../middlewares/multer.middleware.js";

router.route('/register').post(
    upload.fields([
        {
            name : "dp" ,
            maxCount : 1
        },
        {
            name : "coverPhoto" ,
            maxCount : 1
        }
    ])
    ,registerUser)

export default router ;