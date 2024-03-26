const User = require("../models/User");
const MyError = require("../utils/MyError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const sendEmail = require("../utils/email")
const crypto = require("crypto")

exports.register = asyncHandler(async (req, res, next) => {

  const user = await User.create(req.body);

  res.status(200).json({
    success: true,
    token: user.getJsonWebToken(),
    user: user
  });
});

exports.login = asyncHandler(async (req, res, next) => {

  const { email, password } = req.body;

  if (!email || !password) {
    throw new MyError('Имэйл болон нууц үгээ дамжуулна уу', 400)
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new MyError("Имэйл болон нууц үгээ зөв оруулна уу", 400)
  }

  const ok = await user.checkPassword(password);

  if (!ok) {
    throw new MyError("Имэйл болон нууц үгээ зөв оруулна уу", 400)
  }

  res.status(200).json({
    success: true,
    token: user.getJsonWebToken(),
    user: user
  });
});

exports.getUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  // Pagination

  const pagination = await paginate(page, limit, User);

  console.log(req.query, sort, select, limit);

  const users = await User.find(req.query, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    data: users,
    pagination,
  });
});

exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new MyError(`${req.params.id} ID-tei хэрэглэгч obso`, 403);
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.createUser = asyncHandler(async (req, res, next) => {
  console.log("data: ", req.body);

  const user = await User.create(req.body);

  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return res.status(400).json({
      success: false,
      data: `${req.params.id} ID-tei хэрэглэгч obso`,
    });
  }
  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(400).json({
      success: false,
      data: `${req.params.id} ID-tei хэрэглэгчx obso`,
    });
  }
  console.log(user);
  await user.deleteOne({ _id: req.params.id });

  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {

  if (!req.body.email) throw new MyError(`Та нууц үг сэргээх имэйл хаягаа дамжуулна уу`, 400);


  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    throw new MyError(`${req.body.email} имэйлтэй хэрэглэгч олдсонгүй`, 403);
  }

  const resetToken = user.generatePasswordChangeToken();
  // user.resetPasswordToken = user.generatePasswordChangeToken()
  user.save();
  // Имэйл илгээнэ
  const link = `https://amazon.mn/changepassword/${resetToken}`
  const message = `Сайн байна уу <br><br>Та нууц үгээ солих хүсэлт илгээлээ.<br> Нууц үгээ доорхи линк дээр дарж солино уу:<br><br><a href=${link}>${link}</a><br><br> Өдрийг сайхан өнгөрүүлээрэй!`

  await sendEmail({
    email: user.email,
    subject: 'Нууц үг өөрчлөх хүсэлт',
    message
  })


  res.status(200).json({
    success: true,
    resetToken,
  });

});

exports.resetPassword = asyncHandler(async (req, res, next) => {

  if (!req.body.resetToken || !req.body.password) throw new MyError(`Та нууц үг сэргээх имэйл хаягаа дамжуулна уу`, 400);

  const enctypted = crypto.createHash('sha256').update(req.body.resetToken).digest("hex")

  const user = await User.findOne({ resetPasswordToken: enctypted, resetPasswordExpire: { $gt: Date.now() } });

  if (!user) {
    throw new MyError(`Токен хүчингүй байна`, 400);
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined


  // const resetToken = user.generatePasswordChangeToken();
  // user.resetPasswordToken = user.generatePasswordChangeToken()
  await user.save();
  // Имэйл илгээнэ

  const token = user.getJsonWebToken()

  res.status(200).json({
    success: true,
    token,
    user: user
  });

});