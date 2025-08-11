// controllers/property.controller.ts
import { Request, Response } from "express";
import prisma from "../prisma/client.prisma";
import { createProperty } from "../dao/property.dao";
import { uploadPropertyImages } from "../dao/images.dao";

export const createPropertyController = async (req: Request, res: Response) => {
  const {
    user_id,
    category_id,
    title,
    description,
    address,
    ward,
    province,
    country,
    max_guest,
    min_price,
  } = req.body;

  const files = req.files as Express.Multer.File[];
  const filePaths = files.map(file => file.path);

  try {
    const property = await prisma.$transaction(async (tx) => {
      // 1. create property
      const createdProperty = await createProperty(
        user_id,
        category_id,
        title,
        description,
        address,
        ward,
        province,
        country,
        max_guest,
        min_price,
        tx
      );

      // 2. upload and save images
      await uploadPropertyImages(createdProperty.property_id, filePaths, tx);
      
      return createdProperty;
    });

    res.status(201).json({
      message: "Property created successfully",
      property,
    });

  } catch (error) {
    console.error("Error creating property:", error);
    res.status(500).json({
      message: "Failed to create property",
      error: String(error),
    });
  }
};
