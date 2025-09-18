export type Message = {
    id: string;
    text: string;
    sender: "me" | "other";
    createdAt: Date;
};
