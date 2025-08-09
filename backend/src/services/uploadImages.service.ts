import { Request, Response } from 'express';
import fs from 'fs';
import { uploadAvatar } from '../dao/images.dao';

export const uploadAvatarController = async (req: Request, res: Response) => {
  try {
    const user_id = req.body.user_id; // hoặc req.user.user_id nếu dùng auth
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload ảnh và lưu DB
    const newAvatar = await uploadAvatar(user_id, file.path);

    // Xóa file tạm sau khi upload xong
    fs.unlinkSync(file.path);

    return res.status(200).json({
      message: 'Avatar uploaded successfully',
      data: newAvatar
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
