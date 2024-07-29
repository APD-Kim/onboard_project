import CustomError from "../utils/errorHandler.js";
import { passwordRegex } from "../utils/regex.js";

export class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  signUp = async (req, res, next) => {
    try {
      const { clientId, password, name } = req.body;

      if (!clientId | !password | !name) {
        throw new CustomError(400, "잘못된 요청입니다. 빈 칸이 없는지 확인해주세요.");
      }
      const regexResult = passwordRegex(password);
      if (!regexResult) {
        throw new CustomError(400, "비밀번호는 6자 이상이어야 하며, 영문자와 숫자를 모두 포함해야 합니다.");
      }
      const result = await this.authService.signUp(clientId, password, name);

      res.status(201).json({ data: result });
    } catch (err) {
      next(err);
    }
  };
}
