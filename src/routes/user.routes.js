import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserDetails,
    updateUserDp,
    updateUserCoverPhoto,
    getUserProfile,
    getLikedTweets,
} from "../controllers/user.controller.js";

import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "dp",
            maxCount: 1,
        },
        {
            name: "coverPhoto",
            maxCount: 1,
        },
    ]),
    registerUser
);

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateUserDetails);
router.route("/dp").patch(verifyJWT, upload.single("dp"), updateUserDp);
router
    .route("/coverPhoto")
    .patch(verifyJWT, 
        upload.single("coverPhoto"), 
        updateUserCoverPhoto
    );

router.route("/p/:username").get(verifyJWT, getUserProfile);
router.route("/liked-tweets").get(verifyJWT, getLikedTweets);

export default router;
