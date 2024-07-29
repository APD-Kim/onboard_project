const REFRESH_TOKEN_EXPIRY_DAY = 7;

export class AuthRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  signUp = async (clientId, password, name) => {
    const result = await this.prisma.user.create({
      data: {
        clientId,
        password,
        name,
      },
    });
    return result;
  };

  findUserByClientId = async (clientId) => {
    const result = await this.prisma.user.findFirst({
      where: {
        clientId,
      },
    });
    return result;
  };

  saveRefreshToken = async (userId, token) => {
    try {
      await this.prisma.refreshToken.create({
        data: {
          userId,
          token,
          expiredAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAY * 24 * 60 * 60 * 1000),
        },
      });
    } catch (err) {
      console.error("리프레시 토큰 저장 중 오류 발생", err);
      throw new Error("리프레시 토큰을 저장하는 데 실패했습니다.");
    }
  };
}
