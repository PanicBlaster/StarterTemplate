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
    data: { title: 'Users', icon: 'pi pi-users' },
    children: [
      {
        path: '',
        component: UserListComponent,
      },
      {
        path: ':id',
        component: UserDetailComponent,
        data: { title: 'User', icon: 'pi pi-user', canReplace: true },
      },
      {
        path: ':id/tenants',
        component: UsersTenantListComponent,
        data: { title: 'User Tenants', icon: 'pi pi-building' },
      },
    ],
    canActivate: [authGuard],
  },
];
