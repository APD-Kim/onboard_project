export class AuthRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  signUp = async (clientId, password, name) => {
    console.log(3);
    const result = await this.prisma.user.create({
      data: {
        clientId,
        password,
        name,
      },
    });
    console.log(result);
    return result;
  };

  logIn = async (clientId, password) => {
    const result = await this.prisma.user.findFirst({
      where: {
        clientId,
      },
    });
  };

  findUserByClientId = async (clientId) => {
    const result = await this.prisma.user.findFirst({
      where: {
        clientId,
      },
    });
    console.log(4);
    console.log(result);
    return result;
  };
}
