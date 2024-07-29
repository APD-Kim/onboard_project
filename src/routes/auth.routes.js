import express from "express";
import { prisma } from "../utils/prisma.js";
import { AuthService } from "../services/auth.service.js";
import { AuthRepository } from "../repositories/auth.repository.js";
import { AuthController } from "../controllers/auth.controller.js";

const router = express.Router();

const authRepository = new AuthRepository(prisma);
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

/** 회원가입 */
router.post("/sign-up", authController.signUp);

export default router;
