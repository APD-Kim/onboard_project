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
/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: 회원가입
 *     description: 새로운 사용자 계정을 생성합니다.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - nickname
 *             properties:
 *               username:
 *                 type: string
 *                 description: 사용자 아이디
 *               password:
 *                 type: string
 *                 description: 사용자 비밀번호
 *               nickname:
 *                 type: string
 *                 description: 사용자 닉네임
 *           examples:
 *             example1:
 *               summary: 기본 예시
 *               value:
 *                 username: "JIN HO"
 *                 password: "12341234q"
 *                 nickname: "Mentos"
 *     responses:
 *       '201':
 *         description: 회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                     nickname:
 *                       type: string
 *                     authorities:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           authorityName:
 *                             type: string
 *       '400':
 *         description: 잘못된 요청
 *       '409':
 *         description: 이미 존재하는 사용자
 *       '500':
 *         description: 서버 에러
 *       '503':
 *         description: 데이터베이스 에러
 */
router.post("/signup", authController.signUp);
/** 로그인 */
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: 로그인
 *     description: 사용자 인증 및 토큰 발급
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: 사용자 아이디
 *               password:
 *                 type: string
 *                 description: 사용자 비밀번호
 *           examples:
 *             example1:
 *               summary: 기본 예시
 *               value:
 *                 username: "JIN HO"
 *                 password: "12341234q"
 *     responses:
 *       '200':
 *         description: 로그인 성공
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               description: authorization 및 refreshToken 쿠키
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT 액세스 토큰
 *       '401':
 *         description: 인증 실패
 *       '500':
 *         description: 서버 에러
 */
router.post("/login", authController.logIn);

export default router;
