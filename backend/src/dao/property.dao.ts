import { v2 as cloudinary } from "cloudinary";
import prisma from "../prisma/client.prisma";
import { geocodeAddress } from "../services/geocoding.service";

export class PropertyDAO {
  // Tạo property mới (có geocoding + max_guest)
  static async createProperty(data: {
    owner_id: string;
    category_id: number;
    title: string;
    description?: string;
    address: string;
    ward?: string;
    province?: string;
    country?: string;
    max_guest: number;
    min_price?: number;
    is_available?: boolean;
  }) {
    // Geocode để lấy tọa độ
    const { lat, lng } = await geocodeAddress(data.address);

    return prisma.property.create({
      data: {
        ...data,
        country: data.country || "Viet Nam",
        latitude: lat,
        longitude: lng,
      },
    });
  }

  // Lấy property theo ID (kèm quan hệ)
  static async getPropertyById(property_id: string) {
    return prisma.property.findUnique({
      where: { property_id },
      include: {
        category: true,
        user: true, // owner
        propertyimage: true,
        auction: {
          orderBy: { start_time: "desc" },
          take: 1,
        },
        booking: true,
        userfavorite: true,
      },
    });
  }
  // lấy property theo user id
  static async getPropertyByUserId(user_id: string) {
    const property_data = await prisma.property.findMany({
      where: {
        owner_id: user_id,
      },
      include: {
        propertyimage: true,
      },
    });

    return property_data;
  }
  // lọc ra properties theo các filter
  static async getFilteredProperties(params: {
    city?: string;
    province?: string;
    country?: string;
    page?: number;
    limit?: number;
    checkin?: Date;
    checkout?: Date;
    guests?: number;
  }) {
    const {
      city,
      province,
      country,
      page = 1,
      limit = 10,
      checkin,
      checkout,
      guests,
    } = params;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (city) where.address = { contains: city, mode: "insensitive" };
    if (province) where.province = { contains: province, mode: "insensitive" };
    if (country) where.country = { contains: country, mode: "insensitive" };

    if (guests) {
      where.max_guest = { gte: guests };
    }

    if (checkin && checkout) {
      where.booking = {
        none: {
          AND: [
            { start_date: { lte: checkout } },
            { end_date: { gte: checkin } },
          ],
        },
      };
    }

    const [items, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          user: true, // owner
          propertyimage: true,
          auction: {
            orderBy: { start_time: "desc" },
            take: 1,
          },
          booking: true,
          userfavorite: true,
        },
      }),
      prisma.property.count({ where }),
    ]);

    return {
      items,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  // Cập nhật property
  static async updateProperty(
    property_id: string,
    updateData: Partial<{
      owner_id?: string;
      category_id?: number;
      title?: string;
      description?: string;
      address?: string;
      ward?: string;
      province?: string;
      country?: string;
      longitude?: number;
      latitude?: number;
      max_guest?: number;
      min_price?: number;
      checkin_date?: Date;
      checkout_date?: Date;
      is_available?: boolean;
    }>
  ) {
    return prisma.property.update({
      where: { property_id },
      data: updateData,
    });
  }

  // Xóa property
  static async deleteProperty(property_id: string) {
    return prisma.property.delete({
      where: { property_id },
    });
  }

  static addToFavorites = async (user_id: string, property_id: string) => {
    return prisma.userfavorite.create({
      data: {
        user_id: user_id,
        property_id: property_id,
      },
    });
  };
  static async removeFromFavorites(user_id: string, property_id: string) {
    return prisma.userfavorite.delete({
      where: {
        user_id_property_id: {
          user_id,
          property_id,
        },
      },
    });
  }
  static async getFavorites(user_id: string) {
    return prisma.property.findMany({
      where: {
        userfavorite: {
          some: { user_id },
        },
      },
      include: {
        userfavorite: true
      },
    });
  }
}