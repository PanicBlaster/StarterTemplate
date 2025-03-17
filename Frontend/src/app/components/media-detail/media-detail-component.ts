import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { MediaDetailConfig } from './media-detail';
import { MediaDto } from '../../dto/media.dto';
import { QueryOptions } from '../common-dto/query.dto';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ActivatedRoute } from '@angular/router';
import { PageToolbarComponent } from '../page-toolbar/page-toolbar.component';
import * as videojs from 'video.js';
import Player from 'video.js/dist/types/player';

@Component({
  selector: 'pb-media-detail', // Changed from app-media-detail
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule,
    InputTextModule,
    FormsModule,
    PageToolbarComponent,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <pb-page-toolbar
      [header]="config.header"
      [supportsEdit]="false"
      [supportsAdd]="false"
      [isEditing]="false"
      [actions]="config.customToolbarItems || []"
    ></pb-page-toolbar>

    <!-- Show thumbnail if configured and available -->
    <div class="video-player-container">
      <div
        *ngIf="media && config.showThumbnail"
        class="thumbnail-container"
        (click)="playVideo()"
      >
        <img
          [src]="media.thumbnailUrl"
          alt="Video thumbnail"
          class="thumbnail"
        />
        <div class="play-button-overlay">
          <i class="pi pi-play-circle"></i>
        </div>
      </div>

      <!-- Video element -->
      <video
        *ngIf="showVideoPlayer"
        #videoPlayer
        class="video-js vjs-default-skin vjs-16-9"
        controls
        crossorigin="anonymous"
      >
        Your browser does not support HTML5 video.
      </video>
    </div>
    <p-toast></p-toast>
  `,
  styles: [
    `
      .video-player-container {
        position: relative;
        width: 100%;
        height: 0;
        padding-bottom: 56.25%; // 16:9 aspect ratio
        background-color: #000;
        overflow: hidden;

        .loading-indicator {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .error-message {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #f44336;
          text-align: center;
          padding: 1rem;
        }

        .video-element {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .thumbnail-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;

          .thumbnail {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .play-button-overlay {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);

            i.pi-play-circle {
              font-size: 64px;
              color: white;
              opacity: 0.8;
            }
          }

          &:hover .play-button-overlay i.pi-play-circle {
            opacity: 1;
          }
        }
      }
    `,
  ],
})
export class MediaDetailComponent implements OnInit {
  @Input() config!: MediaDetailConfig;
  @Input() media?: MediaDto;
  @ViewChild('videoPlayer') vp: ElementRef | undefined;
  private player?: Player;

  error?: string;
  query?: QueryOptions;
  isPlaying: boolean = false;

  showVideoPlayer: boolean = false;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    console.log('Item detail ngOnInit');
    if (!this.media) {
      this.route.params.subscribe((params) => {
        this.query = this.config.dataService.parseParams(
          params,
          this.route.snapshot.queryParams
        );
        this.config.dataService.loadItem(this.query).subscribe({
          next: (result) => {
            this.media = result;

            if (this.config.dataService.updateMetrics) {
              this.config.metrics = this.config.dataService.updateMetrics(
                this.query!,
                result
              );
            } else {
              if ((this.media as any).metrics) {
                this.config.metrics = (this.media as any).metrics;
              }
            }
          },
          error: (err) => {
            this.error = 'Failed to load video';
            console.error('Video player error:', err);
          },
        });
      });
    }
  }

  playVideo() {
    this.showVideoPlayer = true;

    setTimeout(() => {
      this.player = videojs.default(this.vp?.nativeElement, {
        textTrackSettings: false,
        controlBar: {
          pictureInPictureToggle: false,
        },
        autoplay: true,
        bigPlayButton: false,
      });
      this.player.src({
        src: this.media?.hlsUrl,
        type: 'application/x-mpegURL',
        preload: 'auto',
      });
      this.player.play();
      this.isPlaying = true;
    }, 50);
  }
}
