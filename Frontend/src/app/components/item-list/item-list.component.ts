import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
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
import { QueryOptions } from '../common-dto/query.dto';
import { IdDisplayPipe } from '../../pipes/id-display.pipe';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ShortDatePipe } from '../../pipes/short-date.pipe';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'pb-item-list', // Changed from pb-item-list
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    PageToolbarComponent,
    ToastModule,
    ConfirmDialogModule,
    IdDisplayPipe, // Make sure IdDisplayPipe is standalone
    InputTextModule,
    FormsModule,
    ShortDatePipe,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <pb-page-toolbar
      [header]="header"
      [supportsAdd]="config.supportsAdd || false"
      [supportsEdit]="false"
      [canMockData]="false"
      [actions]="getAllToolbarItems()"
      [metrics]="config.metrics"
      (onAdd)="handleAdd()"
    ></pb-page-toolbar>

    <div *ngIf="config.enableSearch" class="search-container mb-3">
      <span class="p-input-icon-right full-width">
        <input
          type="text"
          pInputText
          [(ngModel)]="filterValue"
          (ngModelChange)="onFilterChange($event)"
          [placeholder]="'Search...'"
          class="auto-width"
        />
      </span>
    </div>

    <p-table
      #dt
      [value]="flatItems"
      [columns]="getVisibleColumns()"
      [paginator]="true"
      [rows]="10"
      [rowsPerPageOptions]="config.rowsPerPageOptions || [10, 25, 50]"
      [loading]="loading"
      [totalRecords]="totalRecords"
      (onLazyLoad)="loadData($event)"
      [lazy]="true"
      dataKey="id"
      [showCurrentPageReport]="true"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
    >
      <ng-template pTemplate="header">
        <tr>
          <th *ngFor="let col of getVisibleColumns()">
            {{ col.header }}
          </th>
          <th *ngIf="config.supportsEdit || config.supportsDelete">Actions</th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-item>
        <tr>
          <td *ngFor="let col of getVisibleColumns()">
            <ng-container [ngSwitch]="col.type">
              <span *ngSwitchCase="'date'">
                {{ item[col.field] | shortDate }}
              </span>
              <span *ngSwitchCase="'select'">
                {{ getOptionLabel(col, item[col.field]) }}
              </span>
              <span *ngSwitchCase="'id'">
                {{ item[col.field] | idDisplay }}
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
      .search-container {
        margin-bottom: 1rem;
      }
      :host ::ng-deep .p-input-icon-right {
        display: block;
      }
      :host ::ng-deep .p-input-icon-right input {
        width: 100%;
      }
    `,
  ],
})
export class ItemListComponent implements OnInit, OnDestroy {
  @Input() config!: ItemListConfig;

  header: string = '';

  items: any[] = [];
  flatItems: any[] = [];
  loading: boolean = false;
  totalRecords: number = 0;

  queryParams: QueryOptions = {};
  filterValue: string = '';
  isMobile: boolean = false;

  // Add a subject for debouncing filter changes
  private filterSubject = new Subject<string>();
  private filterSubscription?: Subscription;

  @HostListener('window:resize', ['$event'])
  onResize(event?: any) {
    this.checkScreenSize();
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.checkScreenSize();

    // Set up debounced filter handling
    this.filterSubscription = this.filterSubject
      .pipe(
        debounceTime(500), // Wait 500ms after the last event before emitting
        distinctUntilChanged() // Only emit if value changed
      )
      .subscribe((filterValue) => {
        this.loadData({
          first: 0,
          rows: 10,
          filter: filterValue,
        });
      });
  }

  ngOnDestroy() {
    // Clean up subscriptions
    if (this.filterSubscription) {
      this.filterSubscription.unsubscribe();
    }
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  getAllToolbarItems() {
    return [...(this.config.customToolbarItems || [])];
  }

  loadData(event: any) {
    this.header = this.config.header;
    this.loading = true;
    const params = this.config.dataService.parseParams(
      this.route.snapshot.params,
      this.route.snapshot.queryParams
    );

    // Add pagination to params
    params.skip = event.first ?? event.skip;
    params.take = event.rows ?? event.take;

    // Add filter to params
    if (this.filterValue) {
      params.filter = this.filterValue;
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

        if (this.config.dataService.updateHeader) {
          this.header = this.config.dataService.updateHeader(
            params,
            this.items,
            result.total
          );
        }
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

  getVisibleColumns() {
    if (!this.config?.columns) return [];
    const columns = this.isMobile
      ? this.config.columns.filter((col) => !col.mobileHide)
      : this.config.columns;
    return columns;
  }

  // Update onFilterChange to use the subject
  onFilterChange(event: any) {
    this.filterSubject.next(event);
  }
}
