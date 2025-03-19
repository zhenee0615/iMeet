export interface Post {
    postId: string; 
    groupId: string;
    userId: string;
    title: string;
    content: string;
    attachments: Attachments[];
    dateCreated: string;
    comments: Comment[];
    fullName?: string;
    profilePicUrl?: string;
}

export interface Comment {
    userId: string;
    content: string;
    dateCreated: string;
    commentId?: string;
    fullName?: string;
    profilePicUrl?: string;
}

export interface Attachments {
    name: string;
    url: string;
}