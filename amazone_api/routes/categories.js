const express = require('express');
const { getCategories, getCategory, createCategory, deleteCategory, updateCategory } = require('../controller/categories');
const { getCategoryBooks} = require("../controller/books")
const {protect, authorize} = require("../middleware/protect")
const router = express.Router()

router.route("/:categoryId/books").get(getCategoryBooks)

router.route("/").get(getCategories).post(protect,authorize("admin", "operator"), createCategory)

router.route("/:id").get(getCategory).put(protect, updateCategory).delete(protect, deleteCategory)

module.exports = router;