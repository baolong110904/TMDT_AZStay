import { Request, Response } from "express";
import { PropertyDAO } from "../dao/property.dao";
import prisma from "../prisma/client.prisma";
import { uploadPropertyImages } from "../dao/images.dao";

// Lấy tất cả property
export const getAllProperties = async (req: Request, res: Response) => {
  try {
    const { city, province, country, page, limit, checkin, checkout, guests } = req.query;

    const data = await PropertyDAO.getFilteredProperties({
      city: city as string,
      province: province as string,
      country: country as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      checkin: checkin ? new Date(checkin as string) : undefined,
      checkout: checkout ? new Date(checkout as string) : undefined,
      guests: guests ? Number(guests) : undefined,
    });

    console.log("📦 getAllProperties - Query Params:", req.query);
    console.log("📦 getAllProperties - Response Data:", data);

    res.status(200).json(data);
  } catch (err) {
    const error = err as Error;
    console.error("❌ getAllProperties Error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch properties", error: error.message });
  }
};

// Lấy property theo ID
export const getPropertyById = async (req: Request, res: Response) => {
  const { propertyId } = req.params;
  try {
    const property = await PropertyDAO.getPropertyById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.status(200).json(property);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: "Failed to fetch property", error: error.message });
  }
};

// Cập nhật property
export const updateProperty = async (req: Request, res: Response) => {
  const { propertyId } = req.params;
  try {
    const updated = await PropertyDAO.updateProperty(propertyId, req.body);
    res.status(200).json(updated);
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ message: "Failed to update property", error: error.message });
  }
};

// Xóa property
export const deleteProperty = async (req: Request, res: Response) => {
  const { propertyId } = req.params;
  try {
    await PropertyDAO.deleteProperty(propertyId);
    res.status(204).send();
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ message: "Failed to delete property", error: error.message });
  }
};

export const createProperty = async (req: Request, res: Response) => {
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
      const createdProperty = await PropertyDAO.createProperty(
        {
          owner_id: user_id,
          category_id,
          title,
          description,
          address,
          ward,
          province,
          country,
          max_guest,
          min_price,
        },
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
