const jwt = require("jsonwebtoken");
const asyncHandler = require("./asyncHandler");
const MyError = require("../utils/MyError");
const User = require("../models/User");

exports.protect = asyncHandler(async (req, res, next) => {
  console.log(req.headers.authorization)
  if (!req.headers.authorization) {
    throw new MyError(
      "Энэ үйлдлийг хийхэд таны эрх хүрэхгүй байна. Та эхлээд логин хийнэ үү. Authorization header утгаа шалгана уу",
      401
    );
  }
  const token = req.headers.authorization.split(' ')[1];

  if (!token) {
    throw new MyError(
      "Токен байхгүй байна.",
      400
    );
  }

  const tokenObj = jwt.verify(token, process.env.JWT_SECRET);
  console.log(tokenObj)
  req.userId = tokenObj.id
  req.role = tokenObj.role

  next()

  // const user = await User.create(req.body);

// res.status(200).json({
//   success: true,
//   token: user.getJsonWebToken(),
//   user: user
// });
});

exports.authorize = (...roles) => {
    return (req, res, next) => {
     console.log(req.role)
     if (!roles.includes(req.role)) {
        throw new MyError('Таны эрх [' + req.role + "] энэ үйлдлйиг гүйцэтгэхэд хүрэлцхгүй!", 403)
     }
     next();
    }
}


