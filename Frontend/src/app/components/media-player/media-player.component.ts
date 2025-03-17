import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaDto } from '../../dto/media.dto';
import { MediaPlayerConfig } from './media-player.types';
import * as videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'pb-media-player', // Changed from app-media-player
  imports: [CommonModule, ToastModule],
  providers: [MessageService],
  template: `
    <!-- Media player container -->
    <div class="media-player-container">
      <!-- Show thumbnail if configured and available -->
      <div
        *ngIf="media && config.showThumbnail && !isPlaying"
        class="thumbnail-container"
        (click)="playVideo()"
      >
        <img
          [src]="media.thumbnailUrl"
          [alt]="media.title || 'Video thumbnail'"
          class="thumbnail"
        />

        <!-- Processing overlay -->
        <div *ngIf="isProcessing" class="processing-overlay">
          <span class="processing-badge">Processing</span>
        </div>

        <!-- Play button overlay (only if not processing) -->
        <div *ngIf="!isProcessing && isPlayable" class="play-button-overlay">
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
      .media-player-container {
        position: relative;
        width: 100%;
        height: 0;
        padding-bottom: 56.25%; // 16:9 aspect ratio
        background-color: #000;
        overflow: hidden;
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
            font-size: 64px;
            color: white;
            filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.5));
          }
        }

        &:hover {
          .play-button-overlay {
            opacity: 1;
          }
        }
      }

      .processing-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .processing-badge {
        background-color: rgba(255, 152, 0, 0.9);
        color: white;
        padding: 4px 12px;
        border-radius: 4px;
        font-weight: bold;
        font-size: 14px;
        text-transform: uppercase;
      }
    `,
  ],
})
export class MediaPlayerComponent implements OnDestroy {
  @Input() media!: MediaDto;
  @Input() config: MediaPlayerConfig = {
    showThumbnail: true,
    controls: true,
    autoplay: false,
    muted: false,
  };
  @ViewChild('videoPlayer') vp: ElementRef | undefined;

  private player?: Player;
  isPlaying = false;
  showVideoPlayer = false;

  get isProcessing(): boolean {
    return this.media?.status === 'Processing';
  }

  get isPlayable(): boolean {
    return !!(this.media?.hlsUrl || this.media?.dashUrl);
  }

  constructor(private messageService: MessageService) {}

  ngOnDestroy(): void {
    if (this.player) {
      this.player.dispose();
    }
  }

  playVideo() {
    // Don't play if the video is processing or doesn't have playable URLs
    if (this.isProcessing || !this.isPlayable) {
      return;
    }

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

      if (this.media.hlsUrl) {
        this.player.src({
          src: this.media.hlsUrl,
          type: 'application/x-mpegURL',
          preload: 'auto',
        });
        this.player.play();
        this.isPlaying = true;
      } else if (this.media.dashUrl) {
        this.player.src({
          src: this.media.dashUrl,
          type: 'application/dash+xml',
          preload: 'auto',
        });
        this.player.play();
        this.isPlaying = true;
      } else {
        this.isPlaying = false;
        this.showVideoPlayer = false;
        console.error('No video source available for playback');
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No video source available for playback',
        });
      }
    }, 100);
  }
}
