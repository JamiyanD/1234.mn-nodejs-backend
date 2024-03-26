const express = require('express');
const { register, login, getUser, getUsers, createUser, updateUser, deleteUser, forgotPassword, resetPassword } = require('../controller/users');
const { getUserBooks } = require('../controller/books');
const {protect, authorize} = require("../middleware/protect")

const router = express.Router()

router.route("/").get(getUsers).post(createUser);

router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);

router.use(protect)

router.route("/:id/books").get(authorize("admin", "operator"), getUserBooks);

module.exports = router;