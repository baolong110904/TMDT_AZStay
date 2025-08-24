import { Request, Response } from "express";
import fs from "fs";
import { PropertyDAO } from "../dao/property.dao";
import { uploadPropertyImages } from "../dao/images.dao";
import { getUserById } from "../dao/user.dao";
import { AdminDAO } from "../dao/admin.dao";
import { RawQueryArgs } from "@prisma/client/runtime/library";

// Lấy tất cả property
export const getAllProperties = async (req: Request, res: Response) => {
  try {
    const { city, province, country, page, limit, checkin, checkout, guests } =
      req.query;

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
    res
      .status(500)
      .json({ message: "Failed to fetch property", error: error.message });
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
    res
      .status(400)
      .json({ message: "Failed to update property", error: error.message });
  }
};

// Xóa property
export const deleteProperty = async (req: Request, res: Response) => {
  const { propertyId } = req.params;
  try {
    await PropertyDAO.deleteProperty(propertyId);
    return res.status(204).send();
  } catch (err) {
    const error = err as Error;
    return res
      .status(400)
      .json({ message: "Failed to delete property", error: error.message });
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
    draft,
  } = req.body;

  const files = (req.files as Express.Multer.File[]) || [];
  const filePaths = files.map((file) => file.path);

  try {
    // If client requests a draft creation, allow creating a minimal record
    // without requiring images or all mandatory fields. Frontend will
    // update the remaining fields in subsequent steps.
    const isDraft = draft === true || draft === "true";
    if (isDraft) {
      const prisma = require("../prisma/client.prisma").default;

      const createdProperty = await prisma.property.create({
        data: {
          owner_id: user_id,
          category_id: Number(category_id) || null,
          title: title || "Untitled listing",
          description: description || "",
          address: address || "",
          ward: ward || null,
          province: province || null,
          country: country || "Viet Nam",
          max_guest: Number(max_guest) || 1,
          min_price: Number(min_price) || 0,
          is_available: false,
        },
      });

      return res
        .status(201)
        .json({ message: "Draft property created", property: createdProperty });
    }

    // 0. Validate required fields for full create
    if (
      !user_id ||
      !category_id ||
      !title ||
      !description ||
      !address ||
      !province ||
      !country ||
      !max_guest ||
      !min_price
    ) {
      // cleanup uploaded files if have
      for (const file of filePaths) {
        try {
          fs.unlinkSync(file);
        } catch (e) {}
      }

      return res.status(400).json({
        message:
          "Missing required one of those required fields: user_id, category_id, title, description, address, province, country, max_guest, min_price are mandatory",
      });
    }

    // 1. Validate images (at least 5)
    if (files.length < 5) {
      for (const file of filePaths) {
        try {
          fs.unlinkSync(file);
        } catch (e) {}
      }
      return res.status(400).json({
        message: "At least 5 images are required to create a property",
      });
    }

    // 2. Check user existence
    const user_data = await getUserById(user_id);
    if (!user_data) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3. Auto-upgrade role if needed
    if (user_data.role_id === 2 || user_data.role_id === 3) {
      await AdminDAO.updateUserRole(user_id, 4);
    }

    // 4. Create property
    const createdProperty = await PropertyDAO.createProperty({
      owner_id: user_id,
      category_id: Number(category_id),
      title,
      description,
      address,
      ward,
      province,
      country,
      max_guest: Number(max_guest),
      min_price: Number(min_price),
      is_available: true,
    });

    // 5. Upload and save images
    await uploadPropertyImages(createdProperty.property_id, filePaths);

    res.status(201).json({
      message: "Property created successfully",
      property: createdProperty,
    });
  } catch (error) {
    console.error("Error creating property:", error);
    res.status(500).json({
      message: "Failed to create property",
      error: String(error),
    });
  } finally {
    for (const file of filePaths) {
      try {
        fs.unlinkSync(file);
      } catch (e) {}
    }
  }
};
// Lấy ra thông tin property + ảnh của property đó dựa trên user id
export const getPropertyByUserId = async (req: Request, res: Response) => {
  try {
    console.log("[getPropertyByUserId] request", {
      method: req.method,
      originalUrl: req.originalUrl,
      query: req.query,
      body: req.body,
      // @ts-ignore
      userFromToken: (req as any).user,
    });
  } catch (e) {}

  const fromQuery = req.query?.user_id as string | undefined;
  const fromBody = req.body && (req.body.user_id as string | undefined);

  const fromToken =
    (req as any).user &&
    ((req as any).user.user_id ||
      (req as any).user.userId ||
      (req as any).user.id);
  const user_id = fromQuery ?? fromBody ?? fromToken;

  try {
    if (!user_id) {
      return res.status(200).json({ message: "No user_id provided", data: [] });
    }

    const data = await PropertyDAO.getPropertyByUserId(user_id);

    return res.status(200).json({
      message: "Finding property based on user_id successfully",
      data: data || [],
    });
  } catch (error: any) {
    console.error("Error finding property by user_id", error);
    res.status(500).json({
      message: "Failed to find property by using user_id",
      error: String(error?.message || error),
      stack: error?.stack,
    });
  }
};

export const addPropertyFavorites = async (req: Request, res: Response) => {
  const { user_id, property_id } = req.body;
  try {
    if (!user_id || !property_id) {
      return res.status(400).json({
        message:
          "Missing one of those required fields: `user_id`, `property_id`",
      });
    }
    console.log("User id:", user_id);
    console.log("Property id:", property_id);
    const user_data = await getUserById(user_id);
    const property_data = await PropertyDAO.getPropertyById(property_id);
    if (!user_data || !property_data) {
      return res
        .status(401)
        .json({ mesage: "User or property does not exist" });
    }
    const result = await PropertyDAO.addToFavorites(
      user_data.user_id,
      property_data.property_id
    );
    return res.status(200).json({
      message: "Added to favorite successfully.",
      data: { result },
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      message: "Failed to add to favorite using user_id and property_id",
      error: String(error?.message || error),
      stack: error?.stack,
    });
  }
};

export const removePropertyFavorites = async (req: Request, res: Response) => {
  const { user_id, property_id } = req.body;
  try {
    if (!user_id || !property_id) {
      return res.status(400).json({
        message:
          "Missing one of those required fields: `user_id`, `property_id`",
      });
    }
    console.log("User id:", user_id);
    console.log("Property id:", property_id);
    const user_data = await getUserById(user_id);
    const property_data = await PropertyDAO.getPropertyById(property_id);
    if (!user_data || !property_data) {
      return res
        .status(401)
        .json({ mesage: "User or property does not exist" });
    }
    const result = await PropertyDAO.removeFromFavorites(
      user_data.user_id,
      property_data.property_id
    );
    return res.status(200).json({
      message: "Remove from favorite successfully.",
      data: { result },
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      message: "Failed to remove from favorite using user_id and property_id",
      error: String(error?.message || error),
      stack: error?.stack,
    });
  }
};

export const getFavoritesProperties = async (req: Request, res: Response) => {
  const { user_id } = req.body;
  try {
    if (!user_id) {
      return res.status(400).json({
        message: "Missing required field: `user_id`",
      });
    }
    console.log("User id:", user_id);
    const user_data = await getUserById(user_id);
    if (!user_data) {
      return res.status(401).json({ mesage: "User does not exist" });
    }
    const result = await PropertyDAO.getFavorites(user_data.user_id);
    return res.status(200).json({
      message: "Fetch favorites successfully",
      data: { result },
    });
  } catch (error) {}
};