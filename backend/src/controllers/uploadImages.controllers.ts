import { Request, Response } from "express";
import fs from "fs";
import { uploadAvatar } from "../dao/images.dao";
import { getUserById } from "../dao/user.dao";

export const uploadAvatarController = async (req: Request, res: Response) => {
  const user_id = req.body.user_id; // hoặc req.user.user_id nếu dùng auth
  const file = req.file as Express.Multer.File;

  try {
    const check = await getUserById(user_id);
    if (!check) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload ảnh và lưu DB
    const newAvatar = await uploadAvatar(user_id, file.path);

    return res.status(200).json({
      message: "Avatar uploaded successfully",
      data: newAvatar,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    if (file?.path) {
      fs.unlink(file.path, (err) => {
        if (err) console.error(`Failed to delete temp file: ${file.path}`, err);
      });
    }
  }
};