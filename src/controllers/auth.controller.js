export class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  signUp = async (req, res, next) => {
    try {
      const { username, password, nickname } = req.body;

      const result = await this.authService.signUp(username, password, nickname);

      res.status(201).json({ data: result });
    } catch (err) {
      next(err);
    }
  };

  logIn = async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const user = await this.authService.authenticateUser(username, password);

      res.cookie("authorization", user.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: parseInt(process.env.AUTH_TOKEN_EXPIRE) || 1 * 60 * 60 * 1000,
      });
      res.cookie("refreshToken", user.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: parseInt(process.env.REFRESH_TOKEN_EXPIRE) || 24 * 60 * 60 * 1000 * 7,
      });

      res.status(200).json({ token: user.token });
    } catch (err) {
      next(err);
    }
  };
}
