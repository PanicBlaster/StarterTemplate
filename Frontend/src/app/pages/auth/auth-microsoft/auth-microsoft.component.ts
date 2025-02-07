import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-auth-microsoft',
  standalone: true,
  template: `
    <div class="microsoft-auth-container">
      <p>Authenticating with Microsoft...</p>
    </div>
  `,
  styles: [
    `
      .microsoft-auth-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
      }
    `,
  ],
})
export class AuthMicrosoftComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Get the code from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      // Handle Microsoft authentication code
      this.authService.loginWithMicrosoftCode(code).subscribe({
        next: () => {
          // Redirect to home or dashboard after successful auth
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Microsoft auth error:', error);
          this.router.navigate(['/auth/login']);
        },
      });
    } else {
      // If no code is present, redirect to login
      this.router.navigate(['/auth/login']);
    }
  }
}
