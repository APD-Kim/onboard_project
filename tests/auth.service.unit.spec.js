import { AuthService } from "../src/services/auth.service.js";
import CustomError from "../src/utils/errorHandler.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { jest } from "@jest/globals";

describe("AuthService", () => {
  let authService;
  let mockAuthRepository;

  beforeEach(() => {
    mockAuthRepository = {
      findUserByClientId: jest.fn(),
      signUp: jest.fn(),
      saveRefreshToken: jest.fn(),
    };
    authService = new AuthService(mockAuthRepository);

    process.env.JWT_SECRET_KEY = "test_secret_key";
    process.env.SALT_ROUNDS = "10";
  });

  describe("signUp", () => {
    it("should create a new user successfully", async () => {
      const clientId = "testuser";
      const password = "Password123";
      const name = "Test User";

      mockAuthRepository.findUserByClientId.mockResolvedValue(null);
      mockAuthRepository.signUp.mockResolvedValue({
        clientId,
        name,
        role: "USER",
      });

      const result = await authService.signUp(clientId, password, name);

      expect(result).toEqual({
        username: clientId,
        nickname: name,
        authorities: [{ authorityName: "USER" }],
      });
      expect(mockAuthRepository.signUp).toHaveBeenCalledWith(clientId, expect.any(String), name);
    });

    it("should throw an error if clientId already exists", async () => {
      mockAuthRepository.findUserByClientId.mockResolvedValue({ clientId: "existingUser", password: "password1234" });

      await expect(authService.signUp("existingUser", "password1234", "name")).rejects.toThrow(
        new CustomError(409, "이미 가입된 아이디입니다.")
      );
    });
    it("should throw an error if body doesn't exists", async () => {
      await expect(authService.signUp("", "password1234", "name")).rejects.toThrow(
        new CustomError(400, "잘못된 요청입니다. 빈 칸이 없는지 확인해주세요.")
      );
    });
    it("should throw an error if clientId is doesn't over 4 length", async () => {
      mockAuthRepository.findUserByClientId.mockResolvedValue({ clientId: "existingUser", password: "password1234" });

      await expect(authService.signUp("exi", "password1234", "name")).rejects.toThrow(
        new CustomError(400, "아이디는 4자 이상이어야 합니다.")
      );
    });
    it("should throw an error if password doesn't over 6 length", async () => {
      mockAuthRepository.findUserByClientId.mockResolvedValue({ clientId: "existingUser", password: "password1234" });

      await expect(authService.signUp("existingUser", "pass1", "name")).rejects.toThrow(
        new CustomError(400, "비밀번호는 6자 이상이어야 하며, 영문자와 숫자를 모두 포함해야 합니다.")
      );
    });
    it("should throw a 503 error when database connection fails", async () => {
      const clientId = "testuser";
      const password = "Password123";
      const name = "Test User";

      mockAuthRepository.findUserByClientId.mockRejectedValue({
        name: "SequelizeConnectionError",
      });

      await expect(authService.signUp(clientId, password, name)).rejects.toThrow(
        new CustomError(503, "데이터베이스 연결에 실패했습니다. 잠시 후 다시 시도해주세요.")
      );
    });

    it("should throw a 500 error for unexpected errors", async () => {
      const clientId = "testuser";
      const password = "Password123";
      const name = "Test User";

      mockAuthRepository.findUserByClientId.mockRejectedValue(new Error("Unexpected error"));

      await expect(authService.signUp(clientId, password, name)).rejects.toThrow(
        new CustomError(500, "서버에 에러가 발생하였습니다. 다시 시도해주세요.")
      );
    });
  });

  describe("authenticateUser", () => {
    it("should authenticate user and return tokens", async () => {
      const clientId = "testuser";
      const password = "password123";
      const hashedPassword = await bcrypt.hash(password, 10);
      const mockUser = {
        userId: 1,
        clientId,
        name: "Test User",
        role: "USER",
        password: hashedPassword,
      };

      mockAuthRepository.findUserByClientId.mockResolvedValue(mockUser);

      const result = await authService.authenticateUser(clientId, password);

      expect(result).toHaveProperty("userId", 1);
      expect(result).toHaveProperty("clientId", clientId);
      expect(result).toHaveProperty("name", "Test User");
      expect(result).toHaveProperty("role", "USER");
      expect(result).toHaveProperty("token");
      expect(result).toHaveProperty("refreshToken");

      // JWT 토큰 검증
      const decodedToken = jwt.verify(result.token, process.env.JWT_SECRET_KEY);
      expect(decodedToken).toHaveProperty("userId", 1);

      expect(mockAuthRepository.saveRefreshToken).toHaveBeenCalledWith(1, expect.any(String));
    });

    it("should throw an error for invalid credentials", async () => {
      mockAuthRepository.findUserByClientId.mockResolvedValue(null);

      await expect(authService.authenticateUser("nonexistent", "password")).rejects.toThrow(
        new CustomError(401, "아이디 혹은 비밀번호가 잘못되었습니다.")
      );
    });
  });
});
