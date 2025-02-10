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
import { MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { QueryOptions } from '../../dto/query.dto';

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

  @Output() onCreate = new EventEmitter<any>();
  @Output() onUpdate = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<void>();

  query: QueryOptions = {};
  item: any;
  isEditing: boolean = false;
  editingItem: any = {};

  constructor(
    private messageService: MessageService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.query = this.config.dataService.parseParams(
        params,
        this.route.snapshot.queryParams
      );
      this.loadItem();
    });
  }

  startEdit() {
    this.isEditing = true;
  }

  cancelEdit() {
    this.isEditing = false;

    this.loadItem();
  }

  loadItem() {
    this.config.dataService.loadItem(this.query).subscribe((item) => {
      this.item = item;
      this.editingItem = { ...this.item };
    });
  }

  saveChanges() {
    if (this.config.isNew) {
      this.config.dataService
        .createItem(this.query, this.editingItem)
        .subscribe({
          next: (result) => {
            this.isEditing = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Profile updated successfully',
            });
            this.onUpdate.emit(this.editingItem);
          },
          error: (error) => {
            console.error('Error saving changes:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to save changes',
            });
          },
        });
    } else {
      this.config.dataService
        .updateItem(this.query, this.editingItem)
        .subscribe({
          next: (result) => {
            this.isEditing = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Profile updated successfully',
            });
            this.onUpdate.emit(this.editingItem);
          },
          error: (error) => {
            console.error('Error saving changes:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to save changes',
            });
          },
        });
    }
  }

  createNew() {
    this.editingItem = {};
    this.isEditing = true;
  }
}
