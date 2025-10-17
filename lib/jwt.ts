import jwt from "jsonwebtoken";

const SECRET = "mytest123123" as string;

export function signToken(payload: any) {
  return jwt.sign(payload, SECRET, { expiresIn: "1d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, SECRET);
}
