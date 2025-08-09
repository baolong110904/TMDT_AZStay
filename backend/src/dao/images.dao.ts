import { v2 as cloudinary } from 'cloudinary';
import { ENV } from '../config/environtment.config';
import prisma from '../prisma/client.prisma';

cloudinary.config({
  cloud_name: 'dkxvinprh',
  api_key: ENV.CLOUDINARY_API_KEY,
  api_secret: ENV.CLOUDINARY_API_SECRET
})

// upload/update profile images
export const uploadAvatar = async (
  user_id: string,
  filePath: string
) => {
  // delete old images
  await prisma.userimage.deleteMany({ where: { user_id } });

  // upload images to cloudinary
  const uploadResult = await cloudinary.uploader.upload(filePath, {
    folder: 'avatars',
    public_id: user_id,
    overwrite: true
  });

  // saving avatar url to db
  return await prisma.userimage.create({
    data: {
      user_id,
      image_url: uploadResult.secure_url,
    },
  });
};