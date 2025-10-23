export type User = {
  _id?: string;
  uid: string;
  displayName?: string;
  photoURL?: string;
  email?: string;
};

export type Message = {
  _id: string;
  senderId: string;
  receiverId: string;
  text?: string | null;
  image?: string | null;
  createdAt: string | Date;
};