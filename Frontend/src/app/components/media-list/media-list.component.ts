import {
  Component,
  HostListener,
  Input,
  OnInit,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MediaDto } from '../../dto/media.dto';
import { MediaListConfig } from './media-list.types';
import { PageToolbarComponent } from '../page-toolbar/page-toolbar.component';
import { QueryResult } from '../common-dto/query.dto';
import { MediaPlayerComponent } from '../media-player/media-player.component';
import { MediaPlayerConfig } from '../media-player/media-player.types';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ShortDatePipe } from '../../pipes/short-date.pipe';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'pb-media-list',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ProgressSpinnerModule,
    ToastModule,
    PageToolbarComponent,
    MediaPlayerComponent,
    InputTextModule,
    FormsModule,
    PaginatorModule,
  ],
  providers: [MessageService],
  template: `
    <pb-page-toolbar
      #toolbar
      [header]="config.header"
      [supportsAdd]="false"
      [supportsEdit]="false"
      [isEditing]="false"
      [actions]="config.customToolbarItems || []"
    ></pb-page-toolbar>

    <!-- Search bar -->
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

    <div class="loading-container" *ngIf="loading">
      <p-progressSpinner></p-progressSpinner>
    </div>

    <div class="error-message" *ngIf="error">
      {{ error }}
    </div>

    <div class="media-grid" [style.--columns]="currentColumns">
      <p-card
        *ngFor="let item of items"
        styleClass="media-card"
        [header]="item.title || 'Untitled'"
        (click)="selectItem(item)"
      >
        <div class="card-content">
          <pb-media-player
            [config]="mediaPlayerConfig"
            [media]="item"
          ></pb-media-player>
        </div>

        <ng-template pTemplate="footer">
          <div>
            {{ item.subTitle1 }}
          </div>
          <div>
            {{ item.createdAt | date : 'shortDate' }}
          </div>
          <div>
            <button
              *ngIf="config.openContent"
              pButton
              icon="pi pi-directions"
              label="Details"
              (click)="openContent(item, $event)"
            ></button>
          </div>
        </ng-template>
      </p-card>

      <div *ngIf="items?.length === 0 && !loading" class="no-results">
        No media items found
      </div>
    </div>

    <!-- Pagination at the bottom -->
    <div class="pagination-container mt-3">
      <p-paginator
        [rows]="pageSize"
        [totalRecords]="totalRecords"
        [rowsPerPageOptions]="[12, 24, 48]"
        (onPageChange)="onPageChange($event)"
        [first]="currentPage * pageSize"
      ></p-paginator>
    </div>

    <p-toast></p-toast>
  `,
  styles: [
    `
      .search-container {
        margin-bottom: 1.5rem;
      }

      .media-list-container {
        width: 100%;
        padding: 1rem;
      }

      .loading-container {
        display: flex;
        justify-content: center;
        padding: 2rem 0;
      }

      .error-message {
        color: #f44336;
        padding: 1rem;
        text-align: center;
        font-weight: bold;
      }

      .media-grid {
        display: grid;
        grid-template-columns: repeat(var(--columns, 3), 1fr);
        gap: 1.5rem;
        padding: 1rem 0;
      }

      .pagination-container {
        margin-top: 1.5rem;
        display: flex;
        justify-content: center;
      }

      .media-card {
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;

        &:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .card-thumbnail {
          position: relative;
          aspect-ratio: 16/9;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s;
          }

          .play-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.2);
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 0;
            transition: opacity 0.3s;

            i {
              font-size: 3rem;
              color: white;
              filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.5));
            }
          }

          &:hover {
            img {
              transform: scale(1.05);
            }

            .play-overlay {
              opacity: 1;
            }
          }
        }

        .card-content {
          padding: 0.5rem 0;

          .description {
            color: #666;
            margin-bottom: 0.5rem;
          }

          .duration {
            display: flex;
            align-items: center;
            font-size: 0.9rem;
            color: #777;

            i {
              margin-right: 0.3rem;
            }
          }
        }
      }

      .no-results {
        grid-column: span var(--columns, 3);
        text-align: center;
        padding: 2rem;
        color: #666;
        font-style: italic;
      }

      @media (max-width: 1200px) {
        .media-grid {
          --columns: 2;
        }
      }

      @media (max-width: 768px) {
        .media-grid {
          --columns: 1;
        }
      }
    `,
  ],
})
export class MediaListComponent implements OnInit, OnDestroy {
  @Input() config!: MediaListConfig;
  @ViewChild('toolbar') toolbar!: PageToolbarComponent;

  mediaPlayerConfig: MediaPlayerConfig = {
    showThumbnail: true,
    controls: false,
    autoplay: false,
    muted: false,
  };

  items: MediaDto[] = [];
  filterValue: string = '';
  loading = false;
  error?: string;

  isMobile: boolean = false;

  currentColumns: number = 2;

  // Pagination properties
  totalRecords: number = 0;
  currentPage: number = 0;
  pageSize: number = 12;

  // Add a subject for debouncing filter changes
  private filterSubject = new Subject<string>();
  private filterSubscription?: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.checkScreenSize();

    // Set up debounced filter handling
    this.filterSubscription = this.filterSubject
      .pipe(
        debounceTime(400), // Wait 400ms after the last event before emitting
        distinctUntilChanged() // Only emit if value changed
      )
      .subscribe((filterValue) => {
        this.currentPage = 0; // Reset to first page when filtering
        this.loadData({
          first: 0,
          rows: this.pageSize,
          filter: filterValue,
        });
      });

    this.loadData({
      skip: 0,
      take: this.pageSize,
    });
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    if (this.filterSubscription) {
      this.filterSubscription.unsubscribe();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event?: any) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;

    if (this.isMobile) {
      this.currentColumns = 1;
    } else {
      this.currentColumns = this.config?.maxColumns || 3;
    }
  }

  loadData(event: any): void {
    this.loading = true;
    this.error = undefined;

    const params = this.config.dataService.parseParams(
      this.route.snapshot.params,
      this.route.snapshot.queryParams
    );

    params.skip = event.first ?? event.skip;
    params.take = event.rows ?? event.take;

    // Add filter to params
    if (this.filterValue) {
      params.filter = this.filterValue;
    }

    this.config.dataService.loadItems(params).subscribe({
      next: (result: QueryResult<MediaDto>) => {
        this.items = result.items.map((item) => ({
          ...item,
          ...item.item,
        }));
        this.totalRecords = result.total;
        this.loading = false;

        if (this.config.dataService.updateHeader) {
          this.config.header = this.config.dataService.updateHeader(
            params,
            this.items,
            result.total
          );
        }

        if (this.config.dataService.updateMetrics) {
          this.config.metrics = this.config.dataService.updateMetrics(
            params,
            this.items,
            result.total
          );
          this.toolbar.metrics = this.config.metrics;
        }
      },
      error: (err) => {
        console.error('Error loading media items:', err);
        this.error = 'Failed to load media items. Please try again later.';
        this.loading = false;
      },
    });
  }

  selectItem(item: MediaDto): void {
    if (this.config.onSelect) {
      this.config.onSelect(item);
    }
  }

  playVideo(item: MediaDto, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/videos', item.id]);
  }

  openContent(item: MediaDto, event: Event): void {
    if (this.config.openContent) {
      event.stopPropagation(); // Prevent card click from being triggered
      this.config.openContent(item, event);
    }
  }

  // Update onFilterChange to use the subject
  onFilterChange(event: any) {
    this.filterSubject.next(event);
  }

  onPageChange(event: any) {
    this.currentPage = event.page;
    this.pageSize = event.rows;

    this.loadData({
      first: event.first,
      rows: event.rows,
      filter: this.filterValue,
    });
  }
}
