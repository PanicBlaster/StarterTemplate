import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { AuthService } from './services/auth.service';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { HeaderComponent } from './components/header/header.component';
import { BreadcrumbService } from './services/breadcrumb.service';
import {
  DisplayMode,
  getDisplayMode,
} from './components/item-detail/item-detail.types';

export interface BreadcrumbItem {
  label: string;
  url: string;
  icon?: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    BreadcrumbModule,
    HeaderComponent,
  ],
})
export class AppComponent implements OnInit {
  menuItems: MenuItem[] = [];
  profileItems: MenuItem[] = [];
  isAuthenticated = false;
  currentYear = new Date().getFullYear();
  version = '0.0.0'; // Default version
  breadcrumbItems: MenuItem[] = [];
  home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
  displayMode: DisplayMode = getDisplayMode();

  constructor(
    public authService: AuthService,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef
  ) {
    this.authService.isAuthenticated$.subscribe((isAuthenticated) => {
      this.isAuthenticated = isAuthenticated;
      this.updateMenuItems();
      this.updateProfileItems();
    });
    this.version = (window as any).__APP_VERSION__ || '0.0.0';

    // Update resize listener
    window.addEventListener('resize', () => {
      this.displayMode = getDisplayMode();
    });
  }

  ngOnInit() {
    this.updateMenuItems();
    this.updateProfileItems();

    // Subscribe to breadcrumbs
    this.breadcrumbService.breadcrumbsSubject
      .asObservable()
      .subscribe((items) => {
        this.breadcrumbItems = items;
        console.log('Breadcrumb items', this.breadcrumbItems);
      });
  }

  private updateMenuItems() {
    if (this.isAuthenticated) {
      this.menuItems = [
        {
          label: 'Home',
          icon: 'pi pi-home',
          routerLink: ['/home'],
        },
      ];
    } else {
      this.menuItems = [];
    }
  }

  private updateProfileItems() {
    if (this.isAuthenticated) {
      this.profileItems = [
        {
          label: 'Profile',
          icon: 'pi pi-user',
          routerLink: '/profile',
        },
        {
          separator: true,
        },
        {
          label: 'Sign Out',
          icon: 'pi pi-sign-out',
          command: () => {
            this.authService.logout();
            this.router.navigate(['/login']);
          },
        },
      ];
    } else {
      this.profileItems = [];
    }
  }
}
