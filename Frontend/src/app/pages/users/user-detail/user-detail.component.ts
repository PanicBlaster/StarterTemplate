import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AccountService } from '../../../services/account.service';

interface UserDetail {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  role: string | null;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    ToolbarModule,
    ToastModule,
    RouterModule,
  ],
  providers: [MessageService],
  template: `
    <div class="card">
      <h2 class="mb-3">{{ isEditing ? 'Edit User' : 'User Details' }}</h2>

      <p-toolbar>
        <div class="p-toolbar-group-start">
          <p-button
            icon="pi pi-arrow-left"
            label="Back"
            (onClick)="router.navigate(['..'])"
            styleClass="mr-2"
          ></p-button>
        </div>
        <div class="p-toolbar-group-end">
          <p-button
            label="Add to Tenant"
            icon="pi pi-plus"
            severity="secondary"
            styleClass="mr-2"
            (onClick)="addToTenant()"
          ></p-button>
          <p-button
            *ngIf="!isEditing"
            label="Edit"
            icon="pi pi-pencil"
            (onClick)="toggleEdit()"
            styleClass="mr-2"
          ></p-button>
          <p-button
            *ngIf="isEditing"
            label="Save"
            icon="pi pi-save"
            (onClick)="saveUser()"
            [loading]="saving"
          ></p-button>
        </div>
      </p-toolbar>

      <div class="formgrid grid mt-3">
        <div class="field col-12 md:col-6">
          <label for="username">Username</label>
          <input
            id="username"
            type="text"
            pInputText
            [(ngModel)]="user.username"
            class="w-full"
            readonly
          />
        </div>
        <div class="field col-12 md:col-6">
          <label for="email">Email</label>
          <input
            id="email"
            type="email"
            pInputText
            [(ngModel)]="user.email"
            class="w-full"
            [readonly]="!isEditing"
          />
        </div>

        <div class="field col-12 md:col-6">
          <label for="firstName">First Name</label>
          <input
            id="firstName"
            type="text"
            pInputText
            [(ngModel)]="user.firstName"
            class="w-full"
            [readonly]="!isEditing"
          />
        </div>
        <div class="field col-12 md:col-6">
          <label for="lastName">Last Name</label>
          <input
            id="lastName"
            type="text"
            pInputText
            [(ngModel)]="user.lastName"
            class="w-full"
            [readonly]="!isEditing"
          />
        </div>

        <div class="field col-12 md:col-6">
          <label for="phone">Phone</label>
          <input
            id="phone"
            type="tel"
            pInputText
            [(ngModel)]="user.phone"
            class="w-full"
            [readonly]="!isEditing"
          />
        </div>
        <div class="field col-12 md:col-6">
          <label for="role">Role</label>
          <input
            id="role"
            type="text"
            pInputText
            [(ngModel)]="user.role"
            class="w-full"
            [readonly]="!isEditing"
          />
        </div>
      </div>
    </div>
    <p-toast></p-toast>
  `,
  styles: [
    `
      :host ::ng-deep {
        .field {
          margin-bottom: 1.5rem;
        }
        label {
          display: block;
          margin-bottom: 0.5rem;
        }
      }
    `,
  ],
})
export class UserDetailComponent implements OnInit {
  user: UserDetail = {
    id: '',
    username: '',
    firstName: null,
    lastName: null,
    email: '',
    phone: null,
    role: null,
    createdAt: '',
    updatedAt: '',
  };
  saving: boolean = false;
  isEditing: boolean = false;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private accountService: AccountService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.isEditing = this.router.url.endsWith('/edit');
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.loadUser(userId);
    }
  }

  private loadUser(id: string) {
    this.accountService.getAccount(id).subscribe({
      next: (data) => {
        this.user = data;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load user',
        });
      },
    });
  }

  saveUser() {
    this.saving = true;
    this.accountService.updateAccount(this.user.id, this.user).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'User updated successfully',
        });
        this.saving = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update user',
        });
        this.saving = false;
      },
    });
  }

  addToTenant() {
    // TODO: Implement add to tenant functionality
    console.log('Add to tenant clicked');
  }

  toggleEdit() {
    this.isEditing = true;
    this.router.navigate(['edit'], { relativeTo: this.route });
  }
}
