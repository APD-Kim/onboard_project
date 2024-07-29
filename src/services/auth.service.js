import CustomError from "../utils/errorHandler.js";
import bcrypt from "bcrypt";
import { clientIdRegex, passwordRegex } from "../utils/regex.js";
import jwt from "jsonwebtoken";

const JWT_EXPIRY = {
  ACCESS: process.env.JWT_ACCESS_EXPIRE || "1h",
  REFRESH: process.env.JWT_REFRESH_EXPIRE || "7d",
};

export class AuthService {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  _generateToken(userId, type = "ACCESS") {
    return jwt.sign({ userId }, process.env.JWT_SECRET_KEY, { expiresIn: JWT_EXPIRY[type] });
  }

  signUp = async (clientId, password, name) => {
    try {
      if (!clientId || !password || !name) {
        throw new CustomError(400, "잘못된 요청입니다. 빈 칸이 없는지 확인해주세요.");
      }
      if (!clientIdRegex(clientId)) {
        throw new CustomError(400, "아이디는 4자 이상이어야 합니다.");
      }
      if (!passwordRegex(password)) {
        throw new CustomError(400, "비밀번호는 6자 이상이어야 하며, 영문자와 숫자를 모두 포함해야 합니다.");
      }
      const user = await this.authRepository.findUserByClientId(clientId);
      if (user) {
        throw new CustomError(409, "이미 가입된 아이디입니다.");
      }
      const salt = parseInt(process.env.SALT_ROUNDS, 10) || 10;
      const hashedPassword = await bcrypt.hash(password, salt);
      const result = await this.authRepository.signUp(clientId, hashedPassword, name);
      return {
        username: result.clientId,
        nickname: result.name,
        authorities: [
          {
            authorityName: result.role,
          },
        ],
      };
    } catch (err) {
      console.error("회원 가입 중 오류 발생", err);
      if (err instanceof CustomError) throw err;
      if (err.name === "SequelizeConnectionError") {
        throw new CustomError(503, "데이터베이스 연결에 실패했습니다. 잠시 후 다시 시도해주세요.");
      }
      throw new CustomError(500, "서버에 에러가 발생하였습니다. 다시 시도해주세요.");
    }
  };

  authenticateUser = async (clientId, password) => {
    const user = await this.authRepository.findUserByClientId(clientId);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new CustomError(401, "아이디 혹은 비밀번호가 잘못되었습니다.");
    }
    const token = this._generateToken(user.userId);
    const refreshToken = this._generateToken(user.userId, "REFRESH");

    await this.authRepository.saveRefreshToken(user.userId, refreshToken);

    return {
      userId: user.userId,
      clientId: user.clientId,
      name: user.name,
      role: user.role,
      token,
      refreshToken,
    };
  };
}
