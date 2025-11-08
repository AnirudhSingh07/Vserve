import jwt from "jsonwebtoken";

const SECRET = "mytest123123" as string;

export function signToken(payload: any) {
  return jwt.sign(payload, SECRET, { expiresIn: "1d" });
}

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, SECRET) as {
      phone: string;
      [key: string]: any;
    };
  } catch {
    return null;
  }
};
