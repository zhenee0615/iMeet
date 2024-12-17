import { Component, inject, OnInit } from '@angular/core';
import { Group } from '../../../Models/group';
import { GroupService } from '../../../Services/group.service';
import { UserService } from '../../../Services/user.service';
import { User } from '../../../Models/user';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
  
export class DashboardComponent implements OnInit {
  user: User | null = null;
  groups: Group[] = [];
  groupService = inject(GroupService);
  userService = inject(UserService);

  constructor(private router: Router, private dialog: MatDialog) { }
  
  ngOnInit(): void {
    this.userService.getUserSignal().subscribe((user) => {
      this.user = user;

      if (this.user) {
        this.groupService.getGroupsJoinedByUser(this.user.uid).subscribe((groups: Group[]) => {
          this.groups = groups;
        });
      }
    });
  }

  goToGroupDetails(groupId: string): void {
    this.router.navigate([`/user/${this.user?.uid}/group/${groupId}`]);
  }
}
