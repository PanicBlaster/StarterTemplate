import { Routes } from '@angular/router';
import { AuthComponent } from './pages/auth/auth.component';
import { HomeComponent } from './pages/home/home.component';

import { authGuard } from './guards/auth.guard';
import { ProfileComponent } from './pages/profile/profile.component';

import { UserListComponent } from './pages/users/user-list/user-list.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { AuthMicrosoftComponent } from './pages/auth/auth-microsoft/auth-microsoft.component';
import { TestItemComponent } from './pages/test-item/test-item.component';
import { UserDetailComponent } from './pages/users/user-detail/user-detail.component';
import { UsersTenantListComponent } from './pages/users/users-tenant-list/users-tenant-list.component';

export const routes: Routes = [
  { path: 'auth', component: AuthComponent },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    component: ProfileComponent,
    title: 'Profile',
  },
  {
    path: 'notifications',
    component: NotificationsComponent,
    canActivate: [authGuard],
    title: 'Notifications',
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'authmicrosoft',
    component: AuthMicrosoftComponent,
  },
  {
    path: 'testitem',
    component: TestItemComponent,
    canActivate: [authGuard],
  },
  {
    path: 'users',
    component: UserListComponent,
    data: {
      title: 'Users',
      icon: 'pi pi-users',
      breadcrumb: [
        { label: 'Users', routerLink: ['/users'], icon: 'pi pi-users' },
      ],
    },
    canActivate: [authGuard],
  },
  {
    path: 'users/:id',
    component: UserDetailComponent,
    data: {
      title: 'User',
      icon: 'pi pi-user',
      canReplace: true,
      breadcrumb: [
        { label: 'Users', routerLink: ['/users'], icon: 'pi pi-users' },
        { label: 'User', routerLink: ['/users', ':id'], icon: 'pi pi-user' },
      ],
    },
    canActivate: [authGuard],
  },
  {
    path: 'users/:id/tenants',
    component: UsersTenantListComponent,
    data: {
      breadcrumb: [
        { label: 'Users', routerLink: ['/users'], icon: 'pi pi-users' },
        { label: 'User', routerLink: ['/users', ':id'], icon: 'pi pi-user' },
        {
          label: 'Tenants',
          routerLink: ['/users', ':id', 'tenants'],
          icon: 'pi pi-sitemap',
        },
      ],
    },
    canActivate: [authGuard],
  },
];
