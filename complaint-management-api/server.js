const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const fs = require("node:fs");
const path = require("node:path");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yaml");

const { rateLimit } = require("express-rate-limit");

const connectDB = require("./config/db.js");
const adminDashboardRoutes = require("./routes/adminDashboard.route.js");
const handlerDashboardRoutes = require("./routes/handlerDashboard.route.js");
const userDashboardRoutes = require("./routes/userDashboard.route.js");
const authRoutes = require("./routes/auth.route.js");
const complaintRoutes = require("./routes/complaint.route.js");
const commentRoutes = require("./routes/comment.route.js");
const adminComplaintRoutes = require("./routes/adminComplaint.route.js");
const handlerComplaintRoutes = require("./routes/handlerComplaint.route.js");
const errorHandler = require("./middleware/error.middleware.js");
const AppError = require("./utils/app-error.js");

dotenv.config();

const openApiDocument = YAML.parse(
  fs.readFileSync(path.join(__dirname, "docs/openapi.yaml"), "utf8"),
);

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});
app.use(morgan("dev"));
app.use(generalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  limit: 10,

  standardHeaders: "draft-8",

  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
  },
});

connectDB();

app.get("/", (req, res) => {
  res.json({
    message: "Complaint Management Portal API is running",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Complaint Management API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/handler/dashboard", handlerDashboardRoutes);
app.use("/api/user/dashboard", userDashboardRoutes);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api", commentRoutes);
app.use("/api/admin", adminComplaintRoutes);
app.use("/api/handler", handlerComplaintRoutes);
app.use((req, res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
});

app.use(errorHandler);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
