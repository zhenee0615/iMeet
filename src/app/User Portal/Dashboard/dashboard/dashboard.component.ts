import { Component, inject, OnInit } from '@angular/core';
import { Group } from '../../../Models/group';
import { GroupService } from '../../../Services/group.service';
import { UserService } from '../../../Services/user.service';
import { User } from '../../../Models/user.interface';

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
  // ngOnInit(): void {
  //   // this.userService.getUserSignal().subscribe(async (user) => {
  //   //   this.user = user;

  //   //   if (this.user) {
  //   //     this.groups = await this.groupService.getGroupsJoinedByUser(this.user.uid);
  //   //   }
  //   // });
  //   this.userService.getUserSignal().subscribe((user) => {
  //     this.user = user;

  //     if (this.user) {
  //       this.groupService.getGroupsJoinedByUser(this.user.uid).subscribe((groups: any[]) => {
  //         this.groups = groups;
  //         console.log(groups)
  //       });
  //     }
  //   });
  // }
}
