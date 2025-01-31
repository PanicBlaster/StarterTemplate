import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule],
  template: `
    <div class="card">
      <h2 class="mb-3">Notifications</h2>

      <p-card styleClass="mb-3" *ngFor="let notification of notifications">
        <div class="flex align-items-center justify-content-between">
          <div>
            <i [class]="notification.icon" class="mr-2"></i>
            <span>{{ notification.message }}</span>
          </div>
          <small class="text-muted">{{ notification.time }}</small>
        </div>
      </p-card>

      <div *ngIf="notifications.length === 0" class="text-center p-4">
        <i class="pi pi-bell-slash text-5xl mb-3 text-muted"></i>
        <p>No notifications to display</p>
      </div>
    </div>
  `,
  styles: [
    `
      :host ::ng-deep .p-card {
        .p-card-body {
          padding: 1rem;
        }
      }
    `,
  ],
})
export class NotificationsComponent {
  notifications = [
    {
      icon: 'pi pi-user',
      message: 'New user joined your tenant',
      time: '2 hours ago',
    },
    {
      icon: 'pi pi-check-circle',
      message: 'Your profile was updated successfully',
      time: '1 day ago',
    },
  ];
}
