import { registerUser } from "../controllers/user.controller.js";
import {Router} from "express" ;
import { upload } from "../middlewares/multer.middleware.js";     


const router = Router() ;


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