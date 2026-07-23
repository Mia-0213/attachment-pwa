export interface Asset {
  id: string;
  type: "avatar" | "image";
  data: string; // Base64 or Blob URL
  createdAt: number;
}
