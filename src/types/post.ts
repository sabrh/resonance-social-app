export type Comment = {
    _id: string;
    authorName: string;
    text: string;
    createdAt: string;
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
    likes?: string[];
    comments?: Comment[];
    shares?: Share[];
    userName: string;
    userPhoto: string;
    createdAt: string;
    userId: string;
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







