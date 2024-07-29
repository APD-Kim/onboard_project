export function passwordRegex(password) {
  const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  return regex.test(password);
}

export function clientIdRegex(clientId) {
  const regex = /^.{4,}$/;
  return regex.test(clientId);
}
