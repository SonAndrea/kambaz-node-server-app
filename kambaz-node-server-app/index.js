import express from "express";
import mongoose from "mongoose";
import Hello from "./Hello.js";
import Lab5 from "./lab5/index.js";
import cors from "cors";
import session from "express-session";
import PazzaRoutes from "./kambaz/pazza/routes.js";
import UserRoutes from "./kambaz/users/routes.js";
import CourseRoutes from "./kambaz/courses/routes.js";
import AssignmentsRoutes from "./kambaz/assignments/routes.js";
import ModulesRoutes from './kambaz/modules/routes.js';
import "dotenv/config";

const CONNECTION_STRING = process.env.DATABASE_CONNECTION_STRING || "mongodb://127.0.0.1:27017/kambaz";
mongoose.connect(CONNECTION_STRING);

const app = express();

const isProduction = process.env.NODE_ENV === "production";

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
].filter(Boolean);

app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
}));

if (isProduction) {
  app.set("trust proxy", 1);
}

const sessionOptions = {
  secret: process.env.SESSION_SECRET || "kambaz",
  resave: false,
  saveUninitialized: false,
  cookie: isProduction
    ? {
        sameSite: "none",
        httpOnly: true,
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      }
    : {
        sameSite: "lax",
        httpOnly: true,
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
};

app.use(session(sessionOptions));
app.use(express.json());

Hello(app);
UserRoutes(app);
CourseRoutes(app);
ModulesRoutes(app);
AssignmentsRoutes(app);
PazzaRoutes(app);
Lab5(app);

const startServer = async () => {
  try {
    await mongoose.connect(CONNECTION_STRING);
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT || 4000, () => {
      console.log(`Server running on port ${process.env.PORT || 4000}`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }
};

startServer();