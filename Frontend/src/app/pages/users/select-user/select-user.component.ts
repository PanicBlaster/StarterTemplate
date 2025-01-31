import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AccountService, User } from '../../../services/account.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-select-user',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, ToastModule, RouterModule],
  providers: [MessageService],
  template: `
    <div class="card">
      <h2 class="mb-3">Add Existing User</h2>

      <div class="mt-3">
        <p-table
          [value]="users"
          [loading]="loading"
          [paginator]="true"
          [rows]="10"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-user>
            <tr>
              <td>{{ user.username }}</td>
              <td>{{ user.email }}</td>
              <td>
                <p-button
                  icon="pi pi-plus"
                  label="Add to Tenant"
                  (onClick)="addUser(user)"
                  [loading]="selectedUserId === user.id"
                ></p-button>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
    <p-toast></p-toast>
  `,
})
export class SelectUserComponent implements OnInit {
  users: User[] = [];
  loading: boolean = true;
  tenantId: string = '';
  selectedUserId: string = '';

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private accountService: AccountService,
    private messageService: MessageService,
    private location: Location
  ) {}

  ngOnInit() {
    this.tenantId = this.route.snapshot.paramMap.get('tenantId') || '';
    this.loadUsers();
  }

  private loadUsers() {
    this.loading = true;
    this.accountService.getAllAccounts().subscribe({
      next: (data: any) => {
        this.users = data.items;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load users',
        });
        this.loading = false;
      },
    });
  }

  addUser(user: User) {
    this.selectedUserId = user.id;
    this.accountService.addUserToTenant(this.tenantId, user.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'User added to tenant successfully',
        });
        this.location.back();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to add user to tenant',
        });
        this.selectedUserId = '';
      },
    });
  }
}
