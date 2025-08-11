import prisma from "../prisma/client.prisma";
import { randomInt } from "crypto";

// check if an email input is unique?
export const checkEmailExists = async (email: string) => {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
};

// create user
export const createUser = async (
  email: string,
  hashedPassword: string,
  name: string,
  gender: string,
  phone: string,
  dob: Date,
  role_id: number
) => {
  return prisma.user.create({
    data: {
      email,
      hashed_password: hashedPassword,
      name,
      gender,
      phone,
      dob,
      role: {
        connect: {
          role_id: role_id,
        },
      },
    },
  });
};

// create password reset token
export const createOTP = async (userId: string) => {
  const otp = randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

  // cleanup old otp thats been expired (trick lỏ cleanup otp cũs)
  await prisma.otp_verifications.deleteMany({
    where: {
      expires_at: { lt: new Date() }, // already expired
    },
  });

  await prisma.otp_verifications.create({
    data: {
      user_id: userId,
      token: otp,
      expires_at: expiresAt,
    },
  });

  return otp;
};

// verify
export const verifyOTP = async (userId: string, token: string) => {
  const otpRecord = await prisma.otp_verifications.findFirst({
    where: {
      user_id: userId,
      token,
      expires_at: {
        gte: new Date(), // greater than or equal to the current date
      },
    },
  });

  return otpRecord;
};

// delete after used
export const deleteOTP = async (otpId: string) => {
  return await prisma.otp_verifications.delete({
    where: { otp_id: otpId },
  });
};

// get user data by id
export const getUserById = async (userId: string) => {
  return await prisma.user.findUnique({
    where: { user_id: userId },
  });
};
// get user data by email
export const getUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email: email },
  });
};

// update password
export const updateNewPassword = async (
  email: string,
  newHashedPassword: string
) => {
  return await prisma.user.update({
    where: { email: email },
    data: { hashed_password: newHashedPassword },
  });
};

// create oauth provider
export const createOAuthProvider = async (
  email: string,
  name: string,
  provider: string,
  oauthId: string
) => {
  return prisma.user.create({
    data: {
      email,
      name,
      oauth_provider: provider,
      oauth_id: oauthId,
    },
  });
};
