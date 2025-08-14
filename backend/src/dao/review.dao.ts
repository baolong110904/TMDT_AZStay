import prisma from "../prisma/client.prisma";

export class ReviewDAO {
  static async getReviewsByPropertyId(propertyId: string) {
    return prisma.review.findUnique({
      where: { property_id: propertyId }, // property_id là unique ⇒ ok
      include: {
        property: {
          select: { property_id: true, title: true },
        },
        review_details: {
          include: {
            user: {
              select: {
                user_id: true,
                name: true,
                avatar_url: true,
              },
            },
          },
          orderBy: { created_at: "desc" },
        },
      },
    });
  }
}
