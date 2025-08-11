export interface UserProfile{
  id: string;
  roleId: number;
  name: string;
  gender: string;
  dob: Date;
  email: string;
  phone: string;
  imageId: string;
  avatar?: string; //avatar URL
}