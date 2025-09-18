import { create } from "zustand";
import type { Message } from "../types/message";
// import { Message } from "../types/message";

type ChatState = {
    messages: Message[];               // সব মেসেজ লিস্ট
    addMessage: (msg: Message) => void; // নতুন মেসেজ add করার ফাংশন
};

export const useChatStore = create<ChatState>((set) => ({
    messages: [], // শুরুতে খালি লিস্ট
    addMessage: (msg) =>
        set((state) => ({
            messages: [...state.messages, msg], // পুরোনোর সাথে নতুন মেসেজ যোগ
        })),
}));
