import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { PageToolbarComponent } from '../page-toolbar/page-toolbar.component';
import { ItemListConfig } from './item-list.types';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { QueryOptions } from '../../dto/query.dto';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    PageToolbarComponent,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <app-page-toolbar
      [header]="config.header"
      [supportsAdd]="config.supportsAdd || false"
      [supportsEdit]="false"
      [canMockData]="false"
      [actions]="config.customToolbarItems || []"
      [metrics]="config.metrics"
      (onAdd)="handleAdd()"
    ></app-page-toolbar>

    <p-table
      #dt
      [value]="flatItems"
      [columns]="config.columns"
      [paginator]="true"
      [rows]="10"
      [rowsPerPageOptions]="config.rowsPerPageOptions || [10, 25, 50]"
      [loading]="loading"
      [sortField]="config.defaultSortField"
      [sortOrder]="config.defaultSortOrder || 1"
      [totalRecords]="totalRecords"
      (onLazyLoad)="loadData($event)"
      [lazy]="true"
      dataKey="id"
      [showCurrentPageReport]="true"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
      [globalFilterFields]="getFilterFields()"
    >
      <ng-template pTemplate="header">
        <tr>
          <th
            *ngFor="let col of config.columns"
            [pSortableColumn]="col.sortable ? col.field : undefined"
          >
            {{ col.header }}
            <p-sortIcon *ngIf="col.sortable" [field]="col.field"></p-sortIcon>
          </th>
          <th *ngIf="config.supportsEdit || config.supportsDelete">Actions</th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-item>
        <tr>
          <td *ngFor="let col of config.columns">
            <ng-container [ngSwitch]="col.type">
              <span *ngSwitchCase="'date'">
                {{ item[col.field] | date : col.format || 'medium' }}
              </span>
              <span *ngSwitchCase="'select'">
                {{ getOptionLabel(col, item[col.field]) }}
              </span>
              <span *ngSwitchDefault>{{ item[col.field] }}</span>
            </ng-container>
          </td>
          <td *ngIf="config.supportsEdit || config.supportsDelete">
            <div class="flex gap-2">
              <button
                *ngIf="config.supportsEdit"
                pButton
                icon="pi pi-pencil"
                class="p-button-rounded p-button-text"
                (click)="handleEdit(item)"
              ></button>
              <button
                *ngIf="config.supportsDelete"
                pButton
                icon="pi pi-trash"
                class="p-button-rounded p-button-text p-button-danger"
                (click)="confirmDelete(item)"
              ></button>
            </div>
          </td>
        </tr>
      </ng-template>
    </p-table>

    <p-confirmDialog></p-confirmDialog>
    <p-toast></p-toast>
  `,
  styles: [
    `
      :host ::ng-deep .p-datatable .p-datatable-header {
        background: transparent;
        border: none;
        padding: 0;
      }
    `,
  ],
})
export class ItemListComponent implements OnInit {
  @Input() config!: ItemListConfig;

  items: any[] = [];
  flatItems: any[] = [];
  loading: boolean = false;
  totalRecords: number = 0;

  queryParams: QueryOptions = {};

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {}

  loadData(event: any) {
    this.loading = true;
    const params = this.config.dataService.parseParams(
      this.route.snapshot.params,
      this.route.snapshot.queryParams
    );

    // Add pagination and sorting to params
    params.skip = event.first;
    params.take = event.rows;
    if (event.sortField) {
      params.order = { [event.sortField]: event.sortOrder };
    }

    this.config.dataService.loadItems(params).subscribe({
      next: (result) => {
        this.items = result.items;

        this.flatItems = result.items.map((item) => ({
          ...item,
          ...item.item,
        }));

        this.totalRecords = result.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading items:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load items',
        });
        this.loading = false;
      },
    });
  }

  handleAdd() {
    this.router.navigate(['new'], { relativeTo: this.route });
  }

  handleEdit(item: any) {
    this.router.navigate([item.id], { relativeTo: this.route });
  }

  confirmDelete(item: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this item?',
      accept: () => {
        this.config.dataService.deleteItem(this.queryParams, item).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Item deleted successfully',
            });
            this.loadData({
              skip: 0,
              take: 10,
              sortField: this.config.defaultSortField,
            });
          },
          error: (error) => {
            console.error('Error deleting item:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete item',
            });
          },
        });
      },
    });
  }

  getOptionLabel(col: any, value: any): string {
    if (!col.options) return value;
    const option = col.options.find((opt: any) => opt.value === value);
    return option ? option.label : value;
  }

  getFilterFields(): string[] {
    return (this.config.columns || []).map((col) => col.field);
  }
}
