import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-auth-cognito',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule, MessageModule, ButtonModule],
  template: `
    <div class="flex align-items-center justify-content-center min-h-screen">
      <div
        class="surface-card p-4 shadow-2 border-round w-full lg:w-6 text-center"
      >
        <h2>Processing Cognito Login...</h2>
        <div *ngIf="loading" class="flex justify-content-center my-5">
          <p-progressSpinner></p-progressSpinner>
        </div>
        <p-message
          *ngIf="error"
          severity="error"
          text="There was an error with your login. Please try again."
        ></p-message>
        <button *ngIf="!loading && error" pButton (click)="goToAuth()">
          Try Again
        </button>
      </div>
    </div>
  `,
})
export class AuthCognitoComponent implements OnInit {
  loading: boolean = true;
  error: boolean = false;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const code = this.route.snapshot.queryParamMap.get('code');
    if (!code) {
      this.error = true;
      this.loading = false;
      return;
    }

    this.authService.loginWithCognitoCode(code).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Error logging in with Cognito:', error);
        this.loading = false;
        this.error = true;
      },
    });
  }

  goToAuth() {
    this.router.navigate(['/auth']);
  }
}
