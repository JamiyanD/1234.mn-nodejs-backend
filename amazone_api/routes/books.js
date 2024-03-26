const express = require('express');
const {protect, authorize} = require("../middleware/protect")
const { getBooks, getBook, createBook, deleteBook, updateBook, uploadBookPhoto } = require('../controller/books');


const router = express.Router({mergeParams: true})

router.route("/").post(protect, authorize("admin", "operator"), createBook);

router.route("/:id").get(getBook).delete(protect, authorize("admin", "operator"), deleteBook).put(protect,authorize("admin", "operator"), updateBook);

router.route("/:id/photo").put(protect, uploadBookPhoto)


module.exports = router;