import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AccountService, UserDetail } from '../../services/account.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    ToolbarModule,
    ToastModule,
  ],
  providers: [MessageService],
  template: `
    <div class="card">
      <h2 class="mb-3">Profile</h2>

      <p-toolbar>
        <div class="p-toolbar-group-start"></div>
        <div class="p-toolbar-group-end">
          <p-button
            label="Save"
            icon="pi pi-save"
            (onClick)="saveProfile()"
            [loading]="saving"
          ></p-button>
        </div>
      </p-toolbar>

      <div class="grid mt-3">
        <div class="col-12">
          <div class="grid">
            <!-- Username and Email row -->
            <div class="col-12 md:col-6 field">
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
            <div class="col-12 md:col-6 field">
              <label for="email">Email</label>
              <input
                id="email"
                type="email"
                pInputText
                [(ngModel)]="user.email"
                class="w-full"
                readonly
              />
            </div>

            <!-- First Name and Last Name row -->
            <div class="col-12 md:col-6 field">
              <label for="firstName">First Name</label>
              <input
                id="firstName"
                type="text"
                pInputText
                [(ngModel)]="user.firstName"
                class="w-full"
              />
            </div>
            <div class="col-12 md:col-6 field">
              <label for="lastName">Last Name</label>
              <input
                id="lastName"
                type="text"
                pInputText
                [(ngModel)]="user.lastName"
                class="w-full"
              />
            </div>

            <!-- Phone row -->
            <div class="col-12 md:col-6 field">
              <label for="phone">Phone</label>
              <input
                id="phone"
                type="tel"
                pInputText
                [(ngModel)]="user.phone"
                class="w-full"
              />
            </div>
          </div>
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
export class ProfileComponent implements OnInit {
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

  constructor(
    private accountService: AccountService,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      this.loadProfile(userId);
    }
  }

  private loadProfile(userId: string) {
    this.accountService.getAccount(userId).subscribe({
      next: (data) => {
        this.user = data;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load profile',
        });
      },
    });
  }

  saveProfile() {
    this.saving = true;
    this.accountService.updateAccount(this.user.id, this.user).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Profile updated successfully',
        });
        this.saving = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update profile',
        });
        this.saving = false;
      },
    });
  }
}
