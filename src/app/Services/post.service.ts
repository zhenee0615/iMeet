import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, getDoc, getDocs, addDoc, CollectionReference, query, where, collectionData, orderBy } from '@angular/fire/firestore';
import { Post, Comment } from '../Models/post';
import { Observable } from 'rxjs';
import { Attachments } from '../Models/post';

@Injectable({
  providedIn: 'root',
})
  
export class PostService {
  private firestore: Firestore = inject(Firestore);
  private postsCollection: CollectionReference;

  constructor() {
    this.postsCollection = collection(this.firestore, 'posts');
  }

  getPostsByGroupId(groupId: string): Observable<Post[]> {
    const postsRef = collection(this.firestore, 'posts');
    const postsQuery = query(postsRef, where('groupId', '==', groupId), orderBy('dateCreated'));

    return collectionData(postsQuery, { idField: 'postId' }) as Observable<Post[]>;
  }

  async getCommentsByPostId(postId: string): Promise<Comment[]> {
    const commentsCollection = collection(this.firestore, `posts/${postId}/comments`);
    const snapshot = await getDocs(commentsCollection);

    return snapshot.docs.map((doc) => ({
      commentId: doc.id,
      ...doc.data(),
    })) as Comment[];
  }

  async addComment(postId: string, comment: Comment): Promise<void> {
    const commentsCollection = collection(this.firestore, `posts/${postId}/comments`);
    await addDoc(commentsCollection, comment);
  }

  async addPost(post: any, attachments: { name: string; url: string }[]): Promise<void> {
    const postsCollection = collection(this.firestore, 'posts');

    const postDocRef = await addDoc(postsCollection, {
      content: post.content,
      dateCreated: post.dateCreated,
      groupId: post.groupId,
      title: post.title,
      userId: post.userId,
    });

    if (attachments) {
      for (const attachment of attachments) {
        const attachmentsCollection = collection(postDocRef, 'attachments');
        await addDoc(attachmentsCollection, {
          name: attachment.name,
          url: attachment.url,
        });
      }
    }
  }

  async getAttachmentsByPostId(postId: string): Promise<Attachments[]> {
  const attachmentsCollection = collection(this.firestore, `posts/${postId}/attachments`);
  const snapshot = await getDocs(attachmentsCollection);

  return snapshot.docs.map((doc) => {
    const data = doc.data() as { name: string; url: string };
    return {
      name: data.name,
      url: data.url,
    };
  });
}
}
