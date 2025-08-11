import { Request, Response } from "express";
import fs from "fs";
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
    max_guest,
    min_price,
  } = req.body;

  const files = req.files as Express.Multer.File[];
  const filePaths = files.map((file) => file.path);

  try {
    // 1. create property
    const createdProperty = await createProperty(
      user_id,
      Number(category_id),
      title,
      description,
      address,
      ward,
      province,
      Number(max_guest),
      Number(min_price)
    );
    
    // 2. upload and save images
    await uploadPropertyImages(createdProperty.property_id, filePaths);

    
    res.status(201).json({
      message: "Property created successfully",
      createProperty,
    });
  } catch (error) {
    console.error("Error creating property:", error);
    res.status(500).json({
      message: "Failed to create property",
      error: String(error),
    });
  } finally {
    for (const file of filePaths) {
      fs.unlink(file, (err) => {
        if (err) console.error(`Failed to delete temp file ${file}:`, err);
      });
    }
  }
};
