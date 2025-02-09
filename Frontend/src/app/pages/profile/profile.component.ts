import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AccountService } from '../../services/account.service';
import { AuthService } from '../../services/auth.service';
import { UserDto } from '../../dto/user.dto';
import { FluidModule } from 'primeng/fluid';

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
    FluidModule,
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

      <p-fluid>
        <div class="grid grid-cols-2 gap-4">
          <!-- Username and Email row -->
          <div>
            <label for="username">Username</label>
            <input
              id="username"
              type="text"
              pInputText
              [(ngModel)]="user.username"
              readonly
            />
          </div>
          <div>
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              pInputText
              [(ngModel)]="user.email"
              readonly
            />
          </div>

          <!-- First Name and Last Name row -->
          <div>
            <label for="firstName">First Name</label>
            <input
              id="firstName"
              type="text"
              pInputText
              [(ngModel)]="user.firstName"
            />
          </div>
          <div>
            <label for="lastName">Last Name</label>
            <input
              id="lastName"
              type="text"
              pInputText
              [(ngModel)]="user.lastName"
            />
          </div>
        </div>
      </p-fluid>
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
  id: string = '';
  user: UserDto = {
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    source: '',
    tenants: [],
    role: '',
  };

  saving: boolean = false;

  constructor(
    private accountService: AccountService,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    const userId = this.authService.getUserId();
    if (userId) {
      this.loadProfile(userId);
    }
  }

  private loadProfile(userId: string) {
    this.accountService.getAccount(userId).subscribe({
      next: (data) => {
        this.user = data;
        this.id = userId;
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
    this.accountService.updateAccount(this.id, this.user).subscribe({
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
