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
}

export interface Comment {
    commentId?: string;
    userId: string;
    content: string;
    dateCreated: string;
    fullName?: string;
}

export interface Attachments {
    name: string;
    url: string;
}