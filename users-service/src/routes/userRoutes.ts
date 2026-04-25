export {};
const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();

router.post("/auth/register", userController.registerUser);
router.post("/auth/login", userController.loginUser);
router.get("/users", userController.getUsers);
router.post("/users", userController.createUser);
router.put("/users/:id", userController.updateUser);
router.delete("/users/:id", userController.deleteUser);

module.exports = router;
