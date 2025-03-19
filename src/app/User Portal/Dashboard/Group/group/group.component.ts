import { Component, inject, OnInit } from '@angular/core';
import { Group } from '../../../../Models/group';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupService } from '../../../../Services/group.service';
import { SidePanelComponent } from '../../../side-panel/side-panel.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PostService } from '../../../../Services/post.service';
import { Comment, Post } from '../../../../Models/post';
import { UserService } from '../../../../Services/user.service';
import { AddPostDialogComponent } from '../add-post-dialog/add-post-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MeetingService } from '../../../../Services/meeting.service';
import { Subscription } from 'rxjs';
import { FaceRecognitionDialogComponent } from '../face-recognition-dialog/face-recognition-dialog.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-group',
  standalone: false,
  templateUrl: './group.component.html',
  styleUrl: './group.component.scss'
})
  
export class GroupComponent implements OnInit {
  groupId: string | null = null;
  group: Group | null = null;
  adminMember: any | null = null;
  joinClickedRoom: string | null = null;
  activeTab: string = 'General';
  uid: string | null = null;
  isMeetingOngoing: boolean = false;
  roomId: string | null = null;
  ongoingMeetings: any[] = [];
  postList: Post[] = [];
  membersList: any[] = [];
  displayedColumns: string[] = ['name', 'dateJoined', 'role'];
  isLoading: boolean = true;
  joinClicked = false;
  postForm: FormGroup;
  showAllComments: { [postId: string]: boolean } = {};
  commentForms: { [key: string]: FormGroup } = {};
  showReplyInput: { [key: string]: boolean } = {};
  private meetingSubscription!: Subscription;
  private intervalId!: ReturnType<typeof setInterval>;
  private postService = inject(PostService);
  private userService = inject(UserService);
  private groupService = inject(GroupService);
  private meetingService = inject(MeetingService);
  private router = inject(Router);

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
    });
    this.fetchGroupMembers();

    if (this.activeTab == "General") {
      this.subscribeToPosts();
      this.meetingSubscription = this.meetingService
        .getOngoingMeetings$(this.groupId!)
        .subscribe(async (meetings) => {
          const enriched = await Promise.all(
            meetings.map(async (m) => {
              const user = await this.userService.getUserById(m.hostId);
              return {
                ...m,
                hostName: user?.fullName ?? 'Unknown Host',
                hostProfilePicUrl: user?.profilePicUrl ?? 'default.png',
                createdAtDate: m.createdAt?.toDate
                  ? m.createdAt.toDate()
                  : new Date(m.createdAt),
              };
            })
          );
          this.ongoingMeetings = enriched;
          this.updateDurations();
        });

      this.intervalId = setInterval(() => {
        this.updateDurations();
      }, 1000);

    } else if (this.activeTab == "Members") {
      this.fetchGroupMembers();
    }
  }

  private updateDurations() {
  const now = new Date();

  this.ongoingMeetings.forEach((meeting) => {
    const diffMs = now.getTime() - meeting.createdAtDate.getTime();
    const totalSeconds = Math.floor(diffMs / 1000);

    const days = Math.floor(totalSeconds / 86400);
    const remainderAfterDays = totalSeconds % 86400;
    const hours = Math.floor(remainderAfterDays / 3600);
    const remainderAfterHours = remainderAfterDays % 3600;
    const minutes = Math.floor(remainderAfterHours / 60);
    const seconds = remainderAfterHours % 60;

    if (days > 0) {
      meeting.duration = `${days} days ${hours} hours`;
    } else if (hours > 0) {
      meeting.duration = `${hours} hours ${minutes} min`;
    } else if (minutes > 0) {
      meeting.duration = `${minutes} min ${seconds} seconds`;
    } else {
      meeting.duration = `${seconds} seconds`;
    }
  });
}


  subscribeToPosts() {
    this.isLoading = true;
    this.postService.getPostsByGroupId(this.groupId!).subscribe(async (posts) => {
      for (const post of posts) {
        const user = await this.userService.getUserById(post.userId);
        post.fullName = user?.fullName;
        post.profilePicUrl = user?.profilePicUrl || 'profile_signup_icon.png';

        const comments = await this.postService.getCommentsByPostId(post.postId);
        comments.sort((a, b) => new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime());

        for (const comment of comments) {
          const commentUser = await this.userService.getUserById(comment.userId);
          comment.profilePicUrl = commentUser?.profilePicUrl || 'profile_signup_icon.png';
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

  async fetchGroupMembers() {
    try {
      const groupData = await this.groupService.getGroupDetails(this.groupId!);
      const adminId = groupData?.admin;
      const groupMembers = await this.groupService.getGroupMembers(this.groupId!);
      const membersPromises = groupMembers.map(async member => {
        const user = await this.userService.getUserById(member.uid);
        return {
          uid: member.uid,
          fullName: user?.fullName || 'Unknown',
          profilePicUrl: user?.profilePicUrl || 'assets/avatar-placeholder.png',
          dateJoined: member.dateJoined,
          isAdmin: member.uid === adminId,
        };
      });

      const members = await Promise.all(membersPromises);
      this.adminMember = members.find(member => member.isAdmin) || null;
      this.membersList = members.filter(member => !member.isAdmin);
      if (this.adminMember) {
        this.membersList.unshift(this.adminMember);
      }
    } catch (error) {
      console.error('Error fetching group members:', error);
    } finally {
      this.isLoading = false;
    }
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

  joinMeeting(callId: string) {
    this.dialog.open(FaceRecognitionDialogComponent, {
      data: {
        userDetails: {
          profilePicUrl: this.sidePanel.userData?.profilePicUrl,
          name: this.sidePanel.userData?.fullName,
          gender: this.sidePanel.userData?.gender || 'Not specified',
          email: this.sidePanel.userData?.email,
          contact: this.sidePanel.userData?.contactNumber || 'Not specified',
        },
      },
    }).afterClosed().subscribe((result) => {
      if (result?.success) {
        Swal.fire({
        title: 'Joining Meeting...',
        html: 'Please wait while we connect you.',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(null),
      });

      this.meetingService.joinMeeting(callId, this.sidePanel.userData?.uid!, this.sidePanel.userData?.fullName!)
        .then(() => {
          Swal.close();
          this.router.navigate(['/meeting', this.sidePanel.userData?.uid!, this.groupId, callId]);
        })
        .catch((error) => {
          Swal.close(); 
          Swal.fire({
            icon: 'error',
            title: 'Failed to Join Meeting',
            text: 'An error occurred while joining the meeting. Please try again.',
          });
        })
      }
    });
  }
}
