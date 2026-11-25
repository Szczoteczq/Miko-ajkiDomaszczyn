export type Wishlist = {
  id: string;
  name: string;
  gift: string;
  url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type WishlistComment = {
  id: string;
  body: string;
  created_at: string;
};
