import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { PageToolbarComponent } from '../page-toolbar/page-toolbar.component';
import { ItemDetailConfig, FormField } from './item-detail.types';
import { ToolbarAction } from '../page-toolbar/page-toolbar.types';
import { FluidModule } from 'primeng/fluid';

@Component({
  selector: 'app-item-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    InputNumberModule,
    CalendarModule,
    DropdownModule,
    PageToolbarComponent,
    FluidModule,
  ],
  template: `
    <app-page-toolbar
      [header]="config.header"
      [supportsEdit]="config.isEditable"
      [supportsAdd]="config.supportsAdd"
      [isEditing]="isEditing"
      [actions]="config.customToolbarItems || []"
      [metrics]="config.metrics"
      (onEdit)="startEdit()"
      (onSave)="saveChanges()"
      (onCancel)="cancelEdit()"
      (onAdd)="createNew()"
    ></app-page-toolbar>

    <p-fluid>
      <div class="grid">
        <div
          *ngFor="let field of config.formLayout"
          class="col-12 md:col-6 field"
        >
          <label [for]="field.key">{{ field.label }}</label>

          <!-- Text Input -->
          <input
            *ngIf="field.type === 'text'"
            [id]="field.key"
            type="text"
            pInputText
            [(ngModel)]="editingItem[field.key]"
            [readonly]="!isEditing"
            [required]="field.required || false"
          />

          <!-- Number Input -->
          <p-inputNumber
            *ngIf="field.type === 'number'"
            [id]="field.key"
            [(ngModel)]="editingItem[field.key]"
            [readonly]="!isEditing"
            [required]="field.required || false"
          ></p-inputNumber>

          <!-- Date Input -->
          <p-datePicker
            *ngIf="field.type === 'date'"
            [id]="field.key"
            [(ngModel)]="editingItem[field.key]"
            [required]="field.required || false"
          ></p-datePicker>

          <!-- Select Input -->
          <p-dropdown
            *ngIf="field.type === 'select'"
            [id]="field.key"
            [(ngModel)]="editingItem[field.key]"
            [options]="field.options"
            [disabled]="!isEditing"
            [required]="field.required || false"
          ></p-dropdown>
        </div>
      </div>
    </p-fluid>
  `,
  styles: [
    `
      .field {
        margin-bottom: 1.5rem;
      }
      label {
        display: block;
        margin-bottom: 0.5rem;
      }
    `,
  ],
})
export class ItemDetailComponent implements OnInit {
  @Input() config!: ItemDetailConfig;
  @Input() item: any = {};

  @Output() onCreate = new EventEmitter<any>();
  @Output() onUpdate = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<void>();

  isEditing: boolean = false;
  editingItem: any = {};

  ngOnInit() {
    this.resetEditingItem();
  }

  private resetEditingItem() {
    this.editingItem = { ...this.item };
  }

  startEdit() {
    this.isEditing = true;
  }

  cancelEdit() {
    this.isEditing = false;
    this.resetEditingItem();
  }

  saveChanges() {
    if (this.item && Object.keys(this.item).length > 0) {
      this.onUpdate.emit(this.editingItem);
    } else {
      this.onCreate.emit(this.editingItem);
    }
    this.isEditing = false;
  }

  createNew() {
    this.editingItem = {};
    this.isEditing = true;
  }
}
