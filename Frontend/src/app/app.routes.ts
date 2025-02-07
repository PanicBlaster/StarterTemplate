import { Routes } from '@angular/router';
import { AuthComponent } from './pages/auth/auth.component';
import { HomeComponent } from './pages/home/home.component';

import { authGuard } from './guards/auth.guard';
import { ProfileComponent } from './pages/profile/profile.component';

import { UserListComponent } from './pages/users/user-list/user-list.component';
import { UserDetailComponent } from './pages/users/user-detail/user-detail.component';
import { SelectUserComponent } from './pages/users/select-user/select-user.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';

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
];
