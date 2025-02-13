import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  template: `
    <div class="grid">
      <div class="col-12 md:col-6">
        <p-card header="All Tenants" styleClass="h-full">
          <p>Manage all tenants across the system</p>
          <ng-template pTemplate="footer">
            <p-button
              label="View Tenants"
              icon="pi pi-building"
              (onClick)="router.navigate(['/admin/tenants'])"
            ></p-button>
          </ng-template>
        </p-card>
      </div>
      <div class="col-12 md:col-6">
        <p-card header="All Users" styleClass="h-full">
          <p>Manage all users across the system</p>
          <ng-template pTemplate="footer">
            <p-button
              label="View Users"
              icon="pi pi-users"
              (onClick)="router.navigate(['/admin/users'])"
            ></p-button>
          </ng-template>
        </p-card>
      </div>
    </div>
  `,
})
export class AdminComponent {
  constructor(public router: Router) {}
}
