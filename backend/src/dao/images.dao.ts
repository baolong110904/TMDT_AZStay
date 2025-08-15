import { v2 as cloudinary } from "cloudinary";
import { ENV } from "../config/environtment.config";
import prisma from "../prisma/client.prisma";
import { Prisma, PrismaClient } from "@prisma/client";

cloudinary.config({
  cloud_name: "dkxvinprh",
  api_key: ENV.CLOUDINARY_API_KEY,
  api_secret: ENV.CLOUDINARY_API_SECRET,
});

// upload/update profile images
export const uploadAvatar = async (user_id: string, filePath: string) => {
  // delete old images
  await prisma.userimage.deleteMany({ where: { user_id } });

  // upload images to cloudinary
  const uploadResult = await cloudinary.uploader.upload(filePath, {
    folder: "avatars",
    public_id: user_id,
    overwrite: true,
    transformation: [
      { width: 600, height: 600, crop: "fill" }, // resize to 300x300
      { quality: "auto" }, // automatic quality optimization
      { fetch_format: "auto" }, // use modern formats like WebP if possible
    ],
  });

  // saving avatar url to db
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  return await prisma.userimage.create({
    data: {
      user_id,
      image_url: uploadResult.secure_url,
    },
=======
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  return await prisma.$transaction(async (tx) => {
    // insert into userimage table
    const imageRecord = await tx.userimage.create({
      data: {
        user_id,
        image_url: uploadResult.secure_url,
      },
    });

    // update avatar_url in user table
    await tx.user.update({
      where: { user_id },
      data: { avatar_url: uploadResult.secure_url },
    });

    return imageRecord;
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  });
};

export const uploadPropertyImages = async (
  property_id: string,
  filePaths: string[]
) => {
  const uploadResults = await Promise.all(
    filePaths.map((filePath) =>
      cloudinary.uploader.upload(filePath, {
        folder: "property_images",
        overwrite: false,
        transformation: [
          { quality: "auto" }, // automatic quality optimization
          { fetch_format: "auto" }, // use modern formats like WebP if possible
        ],
      })
    )
  );

  const imagesData = uploadResults.map((result, index) => ({
    property_id,
    image_url: result.secure_url,
    is_cover: index === 0, // cover is the first image
  }));

  const savedImages = await prisma.propertyimage.createMany({
    data: imagesData,
  });
  
  return savedImages;
};
