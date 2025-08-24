import { Request, Response } from "express";
import { deletePropertyImage, getPropertyImages } from "../dao/images.dao";

export const listPropertyImages = async (req: Request, res: Response) => {
  const { propertyId } = req.params;
  try {
    const images = await getPropertyImages(propertyId);
    return res.status(200).json({ data: images });
  } catch (error) {
    console.error("listPropertyImages error:", error);
    return res
      .status(500)
      .json({ message: "Failed to list property images", error: String(error) });
  }
};

export const removePropertyImage = async (req: Request, res: Response) => {
  const { imageId } = req.params;
  try {
    await deletePropertyImage(imageId);
    return res.status(204).send();
  } catch (error) {
    console.error("removePropertyImage error:", error);
    return res
      .status(400)
      .json({ message: "Failed to delete property image", error: String(error) });
  }
};
