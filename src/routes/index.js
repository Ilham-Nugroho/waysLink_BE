const express = require("express");
const router = express.Router();

const { authenticated } = require("../middlewares/auth");
const { uploadFile } = require("../middlewares/upload");

const {
  checkAuthIntegrate,
  registerUser,
  loginUser,
  getUsers,
  editUser,
  oneUser,
} = require("../controllers/user");

router.post("/register", registerUser);
router.patch("/profile", authenticated, editUser);
router.post("/login", loginUser);
router.get("/check-auth", authenticated, checkAuthIntegrate);
router.get("/users", getUsers);
router.get("/profile", authenticated, oneUser);

//------------------------------------Main Link -------------------------------------

const {
  createMainLink,
  getUserMainLinkByUnique,
  getUserMainLinks,
  createSublink,
  editUnique,
  deleteLink,
  updateLike,
} = require("../controllers/main");

router.get("/my-link", authenticated, getUserMainLinks);
router.post(
  "/link",
  authenticated,
  uploadFile("image", "videoFile"),
  createMainLink
);
router.post(
  "/sublink",
  authenticated,
  uploadFile("image", "videoFile"),
  createSublink
);
router.patch(
  "/link/edit/:unique",
  authenticated,
  uploadFile("image", "videoFile"),
  editUnique
);
router.get("/link/:unique", getUserMainLinkByUnique);
router.delete("/link/:unique", deleteLink);
router.post("/link/:unique", updateLike);

module.exports = router;
