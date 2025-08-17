import { Request, Response } from "express";
import fs from "fs";
import { uploadPropertyImages } from "../dao/images.dao";

export const uploadPropertyImagesController = async (req: Request, res: Response) => {
  const { property_id } = req.body;
  const files = (req.files as Express.Multer.File[]) || [];

  if (!property_id) {
    for (const f of files) {
      try { fs.unlinkSync(f.path); } catch (e) {}
    }
    return res.status(400).json({ message: "Missing property_id" });
  }

  if (!files.length) {
    return res.status(400).json({ message: "No images uploaded" });
  }

  try {
    const filePaths = files.map((f) => f.path);
    await uploadPropertyImages(property_id, filePaths);
    return res.status(200).json({ message: "Images uploaded" });
  } catch (error) {
    console.error("uploadPropertyImagesController error:", error);
    return res.status(500).json({ message: "Failed to upload images", error: String(error) });
  } finally {
    for (const f of files) {
      try { fs.unlinkSync(f.path); } catch (e) {}
    }
  }
};
