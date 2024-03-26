const Book = require("../models/Book");
const MyError = require("../utils/MyError");
const asyncHandler = require("express-async-handler");
const Category = require("../models/Category");
const path = require("path");
const paginate = require("../utils/paginate");

exports.getUserBooks = asyncHandler(async (req, res, next) => {
  console.log(req.query)
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  // Pagination

  const pagination = await paginate(page, limit, Book);

  req.query.createUser = req.userId;
  console.log(req.query)

  const books = await Book.find(req.query, select)
    .populate({
      path: "category",
      select: "name averagePrice",
    })
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: books.length,
    data: books,
    pagination,
  });
});

exports.getCategoryBooks = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 2;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  // Pagination

  const pagination = await paginate(page, limit, Book);

  const books = await Book.find({ ...req.query, category: req.params.categoryId }, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: books.length,
    data: books,
    pagination,
  });
});

exports.getBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    throw new MyError("ID-tei nom baihgui baina,", 400);
  }

  res.status(200).json({
    success: true,
    count: book.length,
    data: book,
  });
});

exports.createBook = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.body.category).populate("books");

  if (!category) {
    throw new MyError(`${req.body.category} ID-tei category obso`, 400);
  }
  req.body.createUser = req.userId;

  const book = await Book.create(req.body);



  res.status(200).json({
    success: true,
    data: book,
  });
});

exports.deleteBook = asyncHandler(async (req, res, next) => {

  const book = await Book.findById(req.params.id);

  if (!book) {
    throw new MyError(`${req.params.id} ID-tei nom obso`, 400);
  }

  if (book.createUser.toString() !== req.userId) {
    throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403)
  }

  await book.deleteOne({ _id: req.params.id });

  res.status(200).json({
    success: true,
    data: book,
    deleteUserId: req.userId
  });
});

exports.updateBook = asyncHandler(async (req, res, next) => {

  const book = await Book.findById(req.params.id);

  console.log(book)

  if (book.createUser.toString() !== req.userId) {
    throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403)
  }

  if (!book) {
    return res.status(400).json({
      success: false,
      data: `${req.params.id} ID-tei nom obso`,
    });
  }

  req.body.updateUser = req.userId;

  for (let attr in req.body) {
    console.log(attr)
    book[attr] = req.body[attr]
  }

  book.name = req.body.name
  book.price = req.body.price
  book.save()

  res.status(200).json({
    success: true,
    data: book,
  });
});

// PUT: api/v1/books/:id/photo
exports.uploadBookPhoto = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    return res.status(400).json({
      success: false,
      data: `${req.params.id} ID-tei nom obso`,
    });
  }

  const file = req.files.file;

  if (!file.mimetype.startsWith("image")) {
    throw new MyError("Та зураг upload хийнэ үү", 400);
  }

  if (file.size > process.env.MAX_UPLOAD_FILE_SIZE) {
    throw new MyError("Та зурагны хэмжээ хэтэрсэн байна", 400);
  }

  file.name = `photo_${req.params.id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, (err) => {
    if (err) {
      throw new MyError(
        "Файлыг хуулах явцад алдаа гарлаа. Алдаа: " + err.message,
        400
      );
    }
  });

  book.photo = file.name;
  book.save();

  res.status(200).json({
    success: true,
    data: file.name,
  });
});
