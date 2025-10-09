export type Reaction = {
    type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';
    userName: string;
    userPhoto?: string;
    createdAt: string;
};

export type Comment = {
    _id: string;
    authorId: string;
    authorName: string;
    authorPhoto?: string;
    text: string;
    createdAt: string;
    replies?: Comment[];
};

export type Share = {
    userId: string;
    userName: string;
    userPhoto?: string;
    sharedAt: string;
};

export type Post = {
    _id: string;
    text: string;
    image?: string;
    mimetype?: string;
    filename?: string;
    reactions?: Record<string, Reaction>;
    comments?: Comment[];
    shares?: Share[];
    userName: string;
    userPhoto: string;
    userEmail: string;
    userId: string;
    createdAt: string;
    sharedPostData?: {
        userName: string;
        userPhoto?: string;
        text: string;
        image?: string;
        mimetype?: string;
        filename?: string;
        createdAt: string;
    };
};
