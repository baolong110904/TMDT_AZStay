import prisma from "../prisma/client.prisma";

export class PropertyDAO {
  // Tạo property mới
  static async createProperty(data: {
    owner_id?: string;
    category_id?: number;
    title: string;
    description?: string;
    address?: string;
    ward?: string;
    province?: string;
    country?: string;
    longitude?: number;
    latitude?: number;
    min_price?: number;
    is_available?: boolean;
  }) {
    return prisma.property.create({
      data,
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
        auction: true,
        booking: true,
        userfavorite: true,
      },
    });
  }

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
  
    // Tạo điều kiện lọc cơ bản
    const where: any = {};
  
    if (city) where.address = { contains: city, mode: "insensitive" };
    if (province) where.province = { contains: province, mode: "insensitive" };
    if (country) where.country = { contains: country, mode: "insensitive" };
  
    if (guests) {
      where.max_guest = { gte: guests }; // yêu cầu có trường max_guest trong DB
    }
  
    // Nếu có checkin & checkout => lọc không trùng booking
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
          user: true,
          propertyimage: true,
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

  // Lấy tất cả property
  // static async getAllProperties() {
  //   return prisma.property.findMany({
  //     include: {
  //       category: true,
  //       user: true, // owner
  //       propertyimage: true,
  //     },
  //   });
  // }

  // Cập nhật property
  static async updateProperty(
    property_id: string,
    updateData: Partial<{
      owner_id: string;
      category_id: number;
      title: string;
      description: string;
      address: string;
      ward: string;
      province: string;
      country: string;
      longitude: number;
      latitude: number;
      min_price: number;
      is_available: boolean;
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
}
