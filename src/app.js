import express from "express";
import "dotenv/config";
import { specs, swaggerUi } from "../swagger.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/auth", authRouter);

app.use((err, req, res, next) => {
  console.log(err.stack);
  const status = err.statusCode ?? 500;
  const message = err.message ?? "서버 에러 발생";
  const boolean = err.boolean ?? false;
  res.status(status).json({ success: boolean, message: message });
});

app.get("/", function (req, res) {
  res.send("Hello World!");
});

app.listen(process.env.PORT, () => {
  console.log(`${process.env.PORT}번 포트로 서버 실행중`);
});
