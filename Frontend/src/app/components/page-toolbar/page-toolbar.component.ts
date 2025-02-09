import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { ToolbarAction, Metric } from './page-toolbar.types';
import { FluidModule } from 'primeng/fluid';
@Component({
  selector: 'app-page-toolbar',
  standalone: true,
  imports: [CommonModule, ButtonModule, ToolbarModule, FluidModule],
  template: `
    <div class="page-toolbar">
      <p-toolbar class="header-row">
        <div class="p-toolbar-group-start">
          <h1 class="text-2xl font-semibold m-0">{{ header }}</h1>
        </div>

        <div class="p-toolbar-group-end">
          <!-- Add button -->
          <p-button
            *ngIf="supportsAdd"
            icon="pi pi-plus"
            (onClick)="onAddClick()"
            [label]="isDesktop ? 'Add' : undefined"
            styleClass="p-button-primary mr-2"
          ></p-button>

          <!-- Custom actions -->
          <p-button
            *ngFor="let action of actions"
            [icon]="action.icon"
            [label]="isDesktop ? action.label : undefined"
            (onClick)="action.onClick()"
            [styleClass]="(action.styleClass || 'p-button-secondary') + ' mr-2'"
          ></p-button>

          <!-- Edit mode actions -->
          <ng-container *ngIf="supportsEdit">
            <p-button
              *ngIf="!isEditing"
              icon="pi pi-pencil"
              [label]="isDesktop ? 'Edit' : undefined"
              (onClick)="onEditClick()"
              styleClass="p-button-secondary"
            ></p-button>
            <ng-container *ngIf="isEditing">
              <p-button
                icon="pi pi-save"
                [label]="isDesktop ? 'Save' : undefined"
                (onClick)="onSaveClick()"
                styleClass="p-button-success mr-2"
              ></p-button>
              <p-button
                icon="pi pi-times"
                [label]="isDesktop ? 'Cancel' : undefined"
                (onClick)="onCancelClick()"
                styleClass="p-button-danger"
              ></p-button>
            </ng-container>
          </ng-container>
        </div>
      </p-toolbar>

      <!-- Metrics row -->
      <div
        *ngIf="metrics?.length"
        class="metrics-row flex align-items-center mt-2"
      >
        <div
          *ngFor="let metric of metrics; let last = last"
          class="metric flex align-items-center"
        >
          <i [class]="'pi ' + metric.icon"></i>&nbsp;
          <span class="value ml-2">{{ metric.value }}</span>
          <span class="label ml-2">{{ metric.label }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host ::ng-deep .p-toolbar {
        border: none;
        background: transparent;
        padding: 0;
        min-height: unset;

        .p-toolbar-group-start,
        .p-toolbar-group-end {
          gap: 0.5rem;
        }

        .p-button {
          height: 2.5rem;
        }
      }

      .header-row {
        height: 2.5rem;
      }

      .metrics-row {
        white-space: nowrap;
        overflow-x: auto;
        margin-top: 0.25rem;
        margin-bottom: 0.75rem;
      }

      .metric {
        display: inline-flex;
        align-items: center;
        margin-right: 0.5rem;

        i {
          color: var(--primary-color);
          font-size: 1rem;
        }
      }

      .separator {
        width: 8px;
        height: 4px;
        border-radius: 50%;
        background-color: var(--surface-500);
      }

      @media screen and (max-width: 768px) {
        .p-toolbar-group-end {
          .p-button {
            padding: 0.5rem;
            height: 2rem;

            .p-button-label {
              display: none;
            }

            &.mr-2 {
              margin-right: 0.5rem !important;
            }
          }
        }

        h1 {
          font-size: 1.5rem;
        }

        .metrics-row {
          font-size: 0.875rem;
        }
      }
    `,
  ],
})
export class PageToolbarComponent {
  @Input() header: string = '';
  @Input() actions: ToolbarAction[] = [];
  @Input() metrics?: Metric[];
  @Input() supportsEdit: boolean = false;
  @Input() supportsAdd: boolean = false;
  @Input() isEditing: boolean = false;
  @Input() onEdit: () => void = () => {};
  @Input() onSave: () => void = () => {};
  @Input() onCancel: () => void = () => {};
  @Input() onAdd: () => void = () => {};

  isDesktop: boolean = window.innerWidth > 768;

  constructor() {
    window.addEventListener('resize', () => {
      this.isDesktop = window.innerWidth > 768;
    });
  }

  onAddClick() {
    this.onAdd();
  }

  onEditClick() {
    this.onEdit();
  }

  onSaveClick() {
    this.onSave();
  }

  onCancelClick() {
    this.onCancel();
  }
}
