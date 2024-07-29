import { AuthController } from "../src/controllers/auth.controller.js";
import CustomError from "../src/utils/errorHandler.js";
import { jest } from "@jest/globals";

describe("AuthController", () => {
  let authController;
  let mockAuthService;
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockAuthService = {
      signUp: jest.fn(),
      authenticateUser: jest.fn(),
    };
    authController = new AuthController(mockAuthService);

    mockReq = {
      body: {
        username: "testuser",
        password: "password123",
        nickname: "Test User",
      },
    };
    mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe("signUp", () => {
    it("should create a new user and return 201 status", async () => {
      const mockResult = {
        id: 1,
        username: "testuser",
        nickname: "Test User",
      };
      mockAuthService.signUp.mockResolvedValue(mockResult);

      await authController.signUp(mockReq, mockRes, mockNext);

      expect(mockAuthService.signUp).toHaveBeenCalledWith("testuser", "password123", "Test User");
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ data: mockResult });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should call next with error if authService.signUp throws an error", async () => {
      const mockError = new CustomError(400, "Bad Request");
      mockAuthService.signUp.mockRejectedValue(mockError);

      await authController.signUp(mockReq, mockRes, mockNext);

      expect(mockAuthService.signUp).toHaveBeenCalledWith("testuser", "password123", "Test User");
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  describe("logIn", () => {
    it("should log in user successfully and set cookies", async () => {
      const mockUser = {
        token: "mockToken",
        refreshToken: "mockRefreshToken",
      };
      mockReq.body = { username: "testuser", password: "password123" };
      mockAuthService.authenticateUser.mockResolvedValue(mockUser);

      await authController.logIn(mockReq, mockRes, mockNext);

      expect(mockAuthService.authenticateUser).toHaveBeenCalledWith("testuser", "password123");
      expect(mockRes.cookie).toHaveBeenCalledTimes(2);
      expect(mockRes.cookie).toHaveBeenCalledWith(
        "authorization",
        "mockToken",
        expect.objectContaining({
          httpOnly: true,
          secure: false,
          maxAge: 3600000,
        })
      );
      expect(mockRes.cookie).toHaveBeenCalledWith(
        "refreshToken",
        "mockRefreshToken",
        expect.objectContaining({
          httpOnly: true,
          secure: false,
          maxAge: 604800000,
        })
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ token: "mockToken" });
    });

    it("should handle authentication error", async () => {
      const mockError = new CustomError(401, "인증 실패");
      mockReq.body = { username: "testuser", password: "wrongpassword" };
      mockAuthService.authenticateUser.mockRejectedValue(mockError);

      await authController.logIn(mockReq, mockRes, mockNext);

      expect(mockAuthService.authenticateUser).toHaveBeenCalledWith("testuser", "wrongpassword");
      expect(mockRes.cookie).not.toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });

    it("should use default values when environment variables are not set", async () => {
      delete process.env.AUTH_TOKEN_EXPIRE;
      delete process.env.REFRESH_TOKEN_EXPIRE;

      const mockUser = {
        token: "mockToken",
        refreshToken: "mockRefreshToken",
      };
      mockReq.body = { username: "testuser", password: "password123" };
      mockAuthService.authenticateUser.mockResolvedValue(mockUser);

      await authController.logIn(mockReq, mockRes, mockNext);

      expect(mockRes.cookie).toHaveBeenCalledWith(
        "authorization",
        "mockToken",
        expect.objectContaining({
          maxAge: 3600000, // 1 hour
        })
      );
      expect(mockRes.cookie).toHaveBeenCalledWith(
        "refreshToken",
        "mockRefreshToken",
        expect.objectContaining({
          maxAge: 604800000, // 7 days
        })
      );
    });

    it("should set secure flag in production environment", async () => {
      process.env.NODE_ENV = "production";

      const mockUser = {
        token: "mockToken",
        refreshToken: "mockRefreshToken",
      };
      mockReq.body = { username: "testuser", password: "password123" };
      mockAuthService.authenticateUser.mockResolvedValue(mockUser);

      await authController.logIn(mockReq, mockRes, mockNext);

      expect(mockRes.cookie).toHaveBeenCalledWith(
        "authorization",
        "mockToken",
        expect.objectContaining({
          secure: true,
        })
      );
      expect(mockRes.cookie).toHaveBeenCalledWith(
        "refreshToken",
        "mockRefreshToken",
        expect.objectContaining({
          secure: true,
        })
      );
    });
  });
});
