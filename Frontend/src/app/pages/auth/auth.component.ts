import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ToastModule,
  ],
  providers: [MessageService],
  template: `
    <div
      class="surface-ground h-screen flex align-items-center justify-content-center"
    >
      <div class="surface-card p-4 shadow-2 border-round w-full lg:w-4">
        <div class="text-center mb-5">
          <h2>{{ isSignup ? 'Create Account' : 'Sign In' }}</h2>
        </div>

        <div>
          <!-- Login Form -->
          <div *ngIf="!isSignup">
            <div class="field">
              <label for="username">Username</label>
              <input
                id="username"
                type="text"
                pInputText
                [(ngModel)]="credentials.username"
                class="w-full"
              />
            </div>
            <div class="field">
              <label for="password">Password</label>
              <input
                id="password"
                type="password"
                pInputText
                [(ngModel)]="credentials.password"
                class="w-full"
              />
            </div>
            <p-button
              label="Sign In"
              (onClick)="login()"
              [loading]="loading"
              styleClass="w-full"
            ></p-button>
          </div>

          <!-- Signup Form -->
          <div *ngIf="isSignup">
            <div class="field">
              <label for="username">Username*</label>
              <input
                id="username"
                type="text"
                pInputText
                [(ngModel)]="credentials.username"
                class="w-full"
              />
            </div>
            <div class="field">
              <label for="email">Email*</label>
              <input
                id="email"
                type="email"
                pInputText
                [(ngModel)]="credentials.email"
                class="w-full"
              />
            </div>
            <div class="field">
              <label for="firstName">First Name*</label>
              <input
                id="firstName"
                type="text"
                pInputText
                [(ngModel)]="credentials.firstName"
                class="w-full"
              />
            </div>
            <div class="field">
              <label for="lastName">Last Name*</label>
              <input
                id="lastName"
                type="text"
                pInputText
                [(ngModel)]="credentials.lastName"
                class="w-full"
              />
            </div>
            <div class="field">
              <label for="phone">Phone</label>
              <input
                id="phone"
                type="tel"
                pInputText
                [(ngModel)]="credentials.phone"
                class="w-full"
              />
            </div>
            <div class="field">
              <label for="password">Password*</label>
              <input
                id="password"
                type="password"
                pInputText
                [(ngModel)]="credentials.password"
                class="w-full"
              />
            </div>
            <p-button
              label="Create Account"
              (onClick)="signup()"
              [loading]="loading"
              styleClass="w-full mb-3"
            ></p-button>
          </div>

          <!-- Toggle between login/signup -->
          <div class="text-center mt-3">
            <a
              href="#"
              class="text-primary no-underline"
              (click)="$event.preventDefault(); isSignup = !isSignup"
            >
              {{
                isSignup
                  ? 'Already have an account? Sign In'
                  : 'Need an account? Sign Up'
              }}
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './auth.component.scss',
})
export class AuthComponent {
  isSignup = false;
  loading = false;
  credentials: {
    username?: string;
    password?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  } = {};

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  login() {
    if (!this.credentials.username || !this.credentials.password) return;

    this.loading = true;
    this.authService
      .login(this.credentials.username, this.credentials.password)
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Login successful',
          });
          this.router.navigate(['/home']);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message,
          });
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  signup() {
    if (!this.validateSignup()) {
      return;
    }

    this.loading = true;
    this.authService
      .signup(
        this.credentials as {
          username: string;
          password: string;
          email: string;
          firstName: string;
          lastName: string;
          phone?: string;
          tenantName: string;
        }
      )
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Account created successfully. Please sign in.',
          });
          this.isSignup = false;
          this.loading = false;
          this.credentials = {};
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to create account',
          });
          this.loading = false;
        },
      });
  }

  private validateSignup(): boolean {
    if (
      !this.credentials.username ||
      !this.credentials.password ||
      !this.credentials.email ||
      !this.credentials.firstName ||
      !this.credentials.lastName
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill in all required fields',
      });
      return false;
    }
    return true;
  }
}
