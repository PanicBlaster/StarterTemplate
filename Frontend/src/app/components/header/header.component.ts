import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MenubarModule,
    ButtonModule,
    TooltipModule,
    AvatarModule,
    MenuModule,
  ],
  template: `
    <p-menubar
      [model]="menuItems"
      [style]="{
        border: 'none',
        background: 'transparent',

      }"
    >
      <ng-template pTemplate="start">
        <img src="logo.svg" height="40" class="mr-2" />
      </ng-template>

      <ng-template pTemplate="end" *ngIf="isAuthenticated">
        <div class="header-buttons">
          <button
            pButton
            type="button"
            icon="pi pi-cog"
            class="p-button-rounded p-button-text mr-2"
            pTooltip="Admin"
            [routerLink]="['/admin']"
          ></button>
          <p-menu #menu [model]="profileItems" [popup]="true"></p-menu>
          <p-avatar
            [label]="getUserInitials()"
            shape="circle"
            size="normal"
            styleClass="mr-2 cursor-pointer"
            (click)="menu.toggle($event)"
          ></p-avatar>
        </div>
      </ng-template>
    </p-menubar>
  `,
  styles: [
    `
      // ...existing styles...
    `,
  ],
})
export class HeaderComponent implements OnInit {
  @Input() menuItems: MenuItem[] = [];
  @Input() profileItems: MenuItem[] = [];
  @Input() version: string = '0.0.0';

  isAuthenticated = false;
  isDarkMode = true;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.isAuthenticated$.subscribe((isAuthenticated) => {
      this.isAuthenticated = isAuthenticated;
    });
  }

  getUserInitials(): string {
    return this.authService.getUserInitials();
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark', this.isDarkMode);
  }
}
