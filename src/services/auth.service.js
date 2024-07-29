import CustomError from "../utils/errorHandler.js";
import bcrypt from "bcrypt";

export class AuthService {
  constructor(authRepository, bcrypt) {
    this.authRepository = authRepository;
  }

  signUp = async (clientId, password, name) => {
    try {
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
      if (err instanceof CustomError) {
        throw err;
      }
      if (err.name === "SequelizeConnectionError") {
        throw new CustomError(503, "데이터베이스 연결에 실패했습니다. 잠시 후 다시 시도해주세요.");
      }
      throw new CustomError(500, "서버에 에러가 발생하였습니다. 다시 시도해주세요.");
    }
  };
}
