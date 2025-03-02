import { Component, Input, OnInit, HostListener } from '@angular/core';
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
    <div class="header-container" [ngClass]="{ 'dark-header': isDarkMode }">
      <p-menubar
        [model]="menuItems"
        [style]="{
          border: 'none',
          background: 'transparent'
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
    </div>
  `,
  styles: [
    `
      .header-container {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        background-color: white;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        transition: background-color 0.3s ease;
      }

      .dark-header {
        background-color: #1e1e1e;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
      }

      :host ::ng-deep {
        .p-menubar {
          background: transparent;
          border: none;
          padding: 0;
        }

        .p-avatar {
          cursor: pointer;
          &:hover {
            opacity: 0.8;
          }
        }

        .p-menuitem-link:focus {
          box-shadow: none;
        }
      }

      .header-buttons {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
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

  @HostListener('window:load')
  @HostListener('window:DOMContentLoaded')
  onLoad() {
    this.detectTheme();
  }

  ngOnInit() {
    this.authService.isAuthenticated$.subscribe((isAuthenticated) => {
      this.isAuthenticated = isAuthenticated;
    });
    this.detectTheme();
  }

  detectTheme() {
    const isDarkTheme = document.body.classList.contains('dark');
    this.isDarkMode = isDarkTheme;
  }

  getUserInitials(): string {
    return this.authService.getUserInitials();
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark', this.isDarkMode);
  }
}
