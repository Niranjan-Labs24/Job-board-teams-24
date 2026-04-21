import { SignJWT, jwtVerify } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET || 'super-secret-default-key-change-in-prod';
const key = new TextEncoder().encode(SECRET_KEY);

export async function signJWT(payload: { userId: string; email: string; role: string }) {
  const normalizedPayload = {
    ...payload,
    role: payload.role.toUpperCase()
  };
  
  return await new SignJWT(normalizedPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key);
}

export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, key);
    if (payload && typeof payload.role === 'string') {
      payload.role = payload.role.toUpperCase();
    }
    return payload;
  } catch (error) {
    return null;
  }
}
