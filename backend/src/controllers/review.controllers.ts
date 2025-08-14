import { Request, Response } from "express";
import { ReviewDAO } from "../dao/review.dao";

export const getReviewsByProperty = async (req: Request, res: Response) => {
    try {
      const { propertyId } = req.params;
  
      const review = await ReviewDAO.getReviewsByPropertyId(propertyId);
      if (!review) {
        return res.status(404).json({
          message: "No review found for this property",
          rating: 0,
          count: 0,
          cleanliness_avg: 0,
          accuracy_avg: 0,
          checkin_avg: 0,
          communication_avg: 0,
          location_avg: 0,
          value_avg: 0,
          details: [],
        });
      }
  
      // Chuẩn hóa payload để FE dùng trực tiếp
      const payload = {
        property: {
          property_id: review.property.property_id,
          title: review.property.title,
        },
        rating: review.rating, // tổng quan từ bảng review
        count: review.count,   // tổng số review_details
  
        // 🆕 Thêm các chỉ số trung bình
        cleanliness_avg: review.cleanliness_avg ?? 0,
        accuracy_avg: review.accuracy_avg ?? 0,
        checkin_avg: review.checkin_avg ?? 0,
        communication_avg: review.communication_avg ?? 0,
        location_avg: review.location_avg ?? 0,
        value_avg: review.value_avg ?? 0,
  
        details: review.review_details.map((d) => ({
          id: d.review_detail_id,
          user: {
            user_id: d.user?.user_id ?? null,
            name: d.user?.name ?? "Guest",
            avatar_url: d.user?.avatar_url ?? null,
          },
          overall_rating: d.overall_rating,
          comment: d.comment,
          created_at: d.created_at,
        })),
      };
  
      return res.json(payload);
    } catch (err) {
      console.error("getReviewsByProperty error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  };