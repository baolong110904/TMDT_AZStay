import prisma from "../prisma/client.prisma";

// check if an email input is unique?
export const checkEmailExists = async(email: string) => {
  return prisma.user.findUnique({
    where: {
      email
    }
  });
}

// create user
export const createUser = async(
  email: string,
  hashedPassword: string,
  name: string,
  gender: string,
  phone: string,
  dob: Date,
  role_id: number,
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
          role_id: role_id
        }
      }
    }
  });
}

// create oauth provider
export const createOAuthProvider = async(
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
}