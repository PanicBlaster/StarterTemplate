import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { AccountService, User } from '../../../services/account.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    ToastModule,
    RouterModule,
    ToolbarModule,
  ],
  providers: [MessageService],
  template: `
    <div class="card">
      <p-toolbar>
        <div class="p-toolbar-group-start">
          <p-button
            icon="pi pi-arrow-left"
            label="Back"
            (onClick)="router.navigate(['/home'])"
            styleClass="mr-2"
          ></p-button>
        </div>
        <div class="p-toolbar-group-end">
          <p-button
            label="Select Users"
            icon="pi pi-users"
            severity="secondary"
            [routerLink]="['/tenants', tenantId, 'usersselect']"
            styleClass="mr-2"
          ></p-button>
          <p-button
            icon="pi pi-plus"
            label="Add User"
            [routerLink]="['new']"
          ></p-button>
        </div>
      </p-toolbar>

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
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-user>
            <tr>
              <td>{{ user.id }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.email }}</td>
              <td>
                <div class="flex gap-2">
                  <p-button
                    icon="pi pi-eye"
                    severity="secondary"
                    [routerLink]="[user.id]"
                    pTooltip="View Details"
                  ></p-button>
                  <p-button
                    icon="pi pi-pencil"
                    severity="secondary"
                    [routerLink]="[user.id, 'edit']"
                    pTooltip="Edit User"
                  ></p-button>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
    <p-toast></p-toast>
  `,
})
export class UserListComponent implements OnInit {
  tenantId: string = '';
  tenantName: string = '';
  users: User[] = [];
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private messageService: MessageService,
    private accountService: AccountService
  ) {}

  ngOnInit() {
    this.tenantId = this.route.snapshot.paramMap.get('tenantId') || '';
    this.loadUsers();
  }

  private loadUsers() {
    this.loading = true;
    this.accountService.getAccounts(this.tenantId).subscribe({
      next: (data: any) => {
        this.users = data.items;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load users',
        });
        this.loading = false;
      },
    });
  }
}
