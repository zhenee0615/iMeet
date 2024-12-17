import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { Group } from '../../../../Models/group';
import { ActivatedRoute } from '@angular/router';
import { GroupService } from '../../../../Services/group.service';
import { SidePanelComponent } from '../../../side-panel/side-panel.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PostService } from '../../../../Services/post.service';
import { Comment, Post } from '../../../../Models/post';
import { UserService } from '../../../../Services/user.service';
import { AddPostDialogComponent } from '../add-post-dialog/add-post-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-group',
  standalone: false,
  templateUrl: './group.component.html',
  styleUrl: './group.component.scss'
})
  
export class GroupComponent implements OnInit {
  groupId: string | null = null;
  group: Group | null = null;
  activeTab: string = 'General';
  uid: string | null = null;
  postList: Post[] = [];
  isLoading: boolean = true;
  // showComments: { [key: string]: boolean } = {};
  postForm: FormGroup;
  showAllComments: { [postId: string]: boolean } = {};
  commentForms: { [key: string]: FormGroup } = {};
  showReplyInput: { [key: string]: boolean } = {};
  private postService = inject(PostService);
  private userService = inject(UserService);

  constructor(
    private route: ActivatedRoute,
    private sidePanel: SidePanelComponent,
    private dialog: MatDialog
  ) {
    this.postForm = new FormGroup({
      title: new FormControl('', Validators.required),
      content: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {
    this.sidePanel.activeTab$.subscribe((tab) => {
      this.activeTab = tab;
    });

    this.route.parent?.paramMap.subscribe((params) => {
      this.uid = params.get('uid');
    });

    this.route.paramMap.subscribe((params) => {
      this.groupId = params.get('groupId');
      this.subscribeToPosts();
    });
  }

  subscribeToPosts() {
    this.isLoading = true;
    this.postService.getPostsByGroupId(this.groupId!).subscribe(async (posts) => {
      for (const post of posts) {
        const user = await this.userService.getUserById(post.userId);
        post.fullName = user?.fullName;

        const comments = await this.postService.getCommentsByPostId(post.postId);
        comments.sort((a, b) => new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime());

        for (const comment of comments) {
          const commentUser = await this.userService.getUserById(comment.userId);
          comment.fullName = commentUser?.fullName;
        }
        post.comments = comments;

        post.attachments = await this.postService.getAttachmentsByPostId(post.postId);

        this.commentForms[post.postId] = new FormGroup({
          content: new FormControl('', Validators.required),
        });
      }
      this.postList = posts;
      this.isLoading = false;
    });
  }

  toggleReplyInput(postId: string): void {
    this.showReplyInput[postId] = true;
  }

  hideReplyInput(postId: string): void {
    if (!this.commentForms[postId].value.content.trim()) {
      this.showReplyInput[postId] = false;
    }
  }

  onInputChange(postId: string): void {
    const content = this.commentForms[postId].value.content;
    this.showReplyInput[postId] = !!content.trim();
  }

  openAttachment(url: string): void {
    if (url) {
      window.open(url, '_blank', 'noopener noreferrer');
    }
  }

  openAddPostDialog() {
    const dialogRef = this.dialog.open(AddPostDialogComponent, {
      width: '500px',
      data: {
        groupId: this.groupId,
        userId: this.uid
      }
    });

    dialogRef.afterClosed().subscribe((newPost) => {
      if (newPost) {
        this.postList.unshift(newPost);
      }
    });
  }

  async addComment(postId: string) {
    const commentForm = this.commentForms[postId];
    if (commentForm.valid) {
      const newComment: Comment = {
        userId: this.sidePanel.userData?.uid!,
        content: commentForm.value.content,
        dateCreated: new Date().toISOString(),
      };

      await this.postService.addComment(postId, newComment);
      commentForm.reset();
      this.showReplyInput[postId] = false;
      this.subscribeToPosts();
    }
  }

  toggleCommentsVisibility(postId: string): void {
    this.showAllComments[postId] = !this.showAllComments[postId];
  }
}
