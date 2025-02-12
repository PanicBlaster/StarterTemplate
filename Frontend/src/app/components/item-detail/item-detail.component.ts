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
import { ActivatedRoute, Router } from '@angular/router';
import { QueryOptions } from '../../dto/query.dto';
import { BreadcrumbService } from '../../services/breadcrumb.service';

declare const location: any;

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
      (onMockData)="handleMockData()"
    ></app-page-toolbar>

    <p-fluid>
      <div class="grid">
        <div
          *ngFor="let field of config.formLayout"
          class="col-12 md:col-6 field"
        >
          <label
            *ngIf="
              !field.newOnly || this.query.isNew || field.newOnly == undefined
            "
            [for]="field.key"
            >{{ field.label }}</label
          >

          <!-- Text Input -->
          <input
            *ngIf="
              field.type === 'text' &&
              (!field.newOnly || this.query.isNew || field.newOnly == undefined)
            "
            [id]="field.key"
            type="text"
            pInputText
            [(ngModel)]="editingItem[field.key]"
            [readonly]="!isEditing"
            [required]="field.required || false"
          />

          <!-- Password Input -->
          <input
            *ngIf="
              field.type === 'password' &&
              (!field.newOnly || this.query.isNew || field.newOnly == undefined)
            "
            [id]="field.key"
            type="password"
            pInputText
            [(ngModel)]="editingItem[field.key]"
            [readonly]="!isEditing"
            [required]="field.required || false"
          />

          <!-- Number Input -->
          <p-inputNumber
            *ngIf="
              field.type === 'number' &&
              (!field.newOnly || this.query.isNew || field.newOnly == undefined)
            "
            [id]="field.key"
            [(ngModel)]="editingItem[field.key]"
            [readonly]="!isEditing"
            [required]="field.required || false"
          ></p-inputNumber>

          <!-- Date Input -->
          <p-datePicker
            *ngIf="
              field.type === 'date' &&
              (!field.newOnly || this.query.isNew || field.newOnly == undefined)
            "
            [id]="field.key"
            [(ngModel)]="editingItem[field.key]"
            [required]="field.required || false"
          ></p-datePicker>

          <!-- Select Input -->
          <p-dropdown
            *ngIf="
              field.type === 'select' &&
              (!field.newOnly || this.query.isNew || field.newOnly == undefined)
            "
            [id]="field.key"
            [(ngModel)]="editingItem[field.key]"
            [options]="field.options"
            [disabled]="!isEditing"
            [required]="field.required || false"
            optionLabel="label"
            optionValue="value"
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
    private route: ActivatedRoute,
    private router: Router,
    private breadcrumbService: BreadcrumbService
  ) {
    console.log('Item detail Constructor');
  }

  ngOnInit() {
    console.log('Item detail ngOnInit');
    this.route.params.subscribe((params) => {
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
    if (this.query.id === 'new') {
      this.router.navigate(['../'], { relativeTo: this.route });
    } else {
      this.loadItem();
    }
  }

  loadItem() {
    this.config.dataService.loadItem(this.query).subscribe((item) => {
      this.item = item;
      this.editingItem = { ...this.item };

      if (this.query.id === 'new') {
        this.isEditing = true;
      }

      if (this.config.breadcrumbField) {
        this.breadcrumbService.updateLastBreadcrumbLabel(
          this.item[this.config.breadcrumbField]
        );
      }
    });
  }

  handleMockData() {
    console.log('Mock data');

    // walk through item and set reasonable values based on form field type and property name
    this.config.formLayout.forEach((field) => {
      this.editingItem[field.key] = this.getRandomValue(
        field.type,
        field.key,
        field.options
      );
    });
  }

  saveChanges() {
    if (this.query.id === 'new') {
      this.config.dataService
        .createItem(this.query, this.editingItem)
        .subscribe({
          next: (result) => {
            this.isEditing = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: this.config.updateSuccessMessage,
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
              detail: this.config.updateSuccessMessage,
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

  getRandomValue(type: string, field: string, options?: any[]) {
    switch (type) {
      case 'text':
        if (field === 'username') {
          return this.getRandomUsername();
        }
        if (field === 'email') {
          return this.getRandomEmail();
        }
        if (field === 'password') {
          return this.getRandomPassword();
        }
        return 'Test ' + field;
      case 'number':
        return this.getRandomNumber();
      case 'date':
        return this.getRandomDate();
      case 'boolean':
        return this.getRandomBoolean();
      case 'select':
        return options?.[Math.floor(Math.random() * (options?.length || 1))]
          ?.value;
      default:
        return null;
    }
  }

  getRandomEmail() {
    return 'testuser' + Math.floor(Math.random() * 1000000) + '@example.com';
  }

  getRandomUsername() {
    return 'testuser' + Math.floor(Math.random() * 1000000);
  }

  getRandomPassword() {
    return 'password' + Math.floor(Math.random() * 1000000);
  }

  getRandomDate() {
    return new Date();
  }

  getRandomBoolean() {
    return Math.random() < 0.5;
  }

  getRandomNumber() {
    return Math.floor(Math.random() * 100);
  }
}
