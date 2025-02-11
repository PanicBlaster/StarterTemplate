import { Routes } from '@angular/router';
import { AuthComponent } from './pages/auth/auth.component';
import { HomeComponent } from './pages/home/home.component';

import { authGuard } from './guards/auth.guard';
import { ProfileComponent } from './pages/profile/profile.component';

import { UserListComponent } from './pages/users/user-list/user-list.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { AuthMicrosoftComponent } from './pages/auth/auth-microsoft/auth-microsoft.component';
import { TestItemComponent } from './pages/test-item/test-item.component';

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
    canActivate: [authGuard],
  },
];
