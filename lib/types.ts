import type { Category } from "./constants";

export type VerificationStatus = "no_verificado" | "pendiente" | "verificado" | "rechazado";

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  role: "comprador" | "artesano" | "admin";
}

export interface Artisan {
  id: string;
  owner_id: string;
  slug: string;
  shop_name: string;
  story: string;
  comuna: string;
  main_category: Category;
  profile_photo_url: string | null;
  cover_photo_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  whatsapp_phone: string | null;
  contact_email: string | null;
  verification_status: VerificationStatus;
  rating_avg: number;
  rating_count: number;
}

export interface Product {
  id: string;
  artisan_id: string;
  name: string;
  description: string;
  price_clp: number | null;
  category: Category;
  photo_urls: string[];
  available: boolean;
  created_at: string;
}

export interface MarketSchedule {
  id: string;
  artisan_id: string;
  day_of_week: number; // 1 lunes … 7 domingo
  place_name: string;
  comuna: string;
  time_range: string;
  notes: string;
}

export interface Review {
  id: string;
  artisan_id: string;
  author_id: string;
  stars: number;
  comment: string;
  hidden: boolean;
  created_at: string;
  profiles?: Pick<Profile, "display_name" | "avatar_url">;
}

export interface VerificationRequest {
  id: string;
  artisan_id: string;
  stall_photo_path: string;
  making_photo_path: string;
  video_path: string | null;
  video_url: string | null;
  message: string;
  status: "pendiente" | "aprobada" | "rechazada";
  admin_comment: string;
  created_at: string;
}
