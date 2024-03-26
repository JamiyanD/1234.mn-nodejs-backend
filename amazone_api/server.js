const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const morgan = require("morgan");
const rfs = require("rotating-file-stream");
const logger = require("./middleware/logger");
const categoriesRoutes = require("./routes/categories");
const booksRoutes = require("./routes/books");
const usersRoutes = require("./routes/users");
const connectDB = require("./config/db");
const colors = require("colors");
const errorHandler = require("./middleware/error");
const fileUpload = require("express-fileupload")

const app = express();

dotenv.config({ path: "./config/config.env" });
connectDB();

var accessLogStream = rfs.createStream("access.log", {
  interval: "1d", // rotate daily
  path: path.join(__dirname, "log"),
});

app.use(express.json());
app.use(fileUpload())
app.use(logger);
app.use(morgan("combined", { stream: accessLogStream }));
app.use("/api/v1/categories", categoriesRoutes);
app.use("/api/v1/books", booksRoutes);
app.use("/api/v1/users", usersRoutes);
app.use(errorHandler);

const server = app.listen(
  process.env.PORT,
  console.log(`Express server ${process.env.PORT} port deer aslaa...`)
);

process.on("unhandledRejection", (err, promise) => {
  console.log(`Aldaa garchee : ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
