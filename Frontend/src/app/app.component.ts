import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { AuthService } from './services/auth.service';
import { TooltipModule } from 'primeng/tooltip';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { NavigationEnd } from '@angular/router';
import { filter, map, Observable, of } from 'rxjs';
import { BreadcrumbService } from './services/breadcrumb.service';

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
    MenubarModule,
    AvatarModule,
    MenuModule,
    TooltipModule,
    ButtonModule,
    BreadcrumbModule,
  ],
})
export class AppComponent implements OnInit {
  menuItems: MenuItem[] = [];
  profileItems: MenuItem[] = [];
  avatarUrl = '';
  isAuthenticated = false;
  currentYear = new Date().getFullYear();
  version = '0.0.0'; // Default version
  breadcrumbItems: MenuItem[] = [];
  home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

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
  }

  ngOnInit() {
    this.updateMenuItems();
    this.updateProfileItems();
    this.avatarUrl = this.getAvatarUrl();

    // Set home item
    //this.breadcrumbService.setHome({ icon: 'pi pi-home', routerLink: '/' });

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

  getAvatarUrl(): string {
    var url = this.authService.getAvatarUrl();
    if (url) {
      return url;
    }
    return 'https://ui-avatars.com/api/?name=John+Doe';
  }

  isDarkMode = true;

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark', this.isDarkMode);
  }
}
