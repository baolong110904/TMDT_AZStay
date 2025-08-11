import { v2 as cloudinary } from "cloudinary";
import prisma from "../prisma/client.prisma";
import { geocodeAddress } from "../services/geocoding.service";
import { PrismaClient, Prisma } from "@prisma/client";

export const createProperty = async (
  user_id: string,
  category_id: number,
  title: string,
  description: string,
  address: string,
  ward: string,
  province: string,
  max_guest: number,
  min_price: number
) => {
  // Get coordinates from geocoding service
  const { lat, lng } = await geocodeAddress(address);

  // Create property in DB
  return prisma.property.create({
    data: {
      owner_id: user_id,
      category_id,
      title,
      description,
      address,
      ward,
      province,
      country: 'Viet Nam',
      latitude: lat,
      longitude: lng,
      max_guest,
      min_price
    },
  });
};