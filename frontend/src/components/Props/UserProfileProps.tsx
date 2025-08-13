export interface UserProfile{
  id: string;
  role_id: number; // Thêm role_id để khớp với dữ liệu trong localStorage
  name: string;
  gender: string;
  dob: Date;
  email: string;
  phone: string;
  imageId: string;
  avatar?: string; //avatar URL
}