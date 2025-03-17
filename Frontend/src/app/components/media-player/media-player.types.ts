import { MediaDto } from '../../dto/media.dto';

export interface MediaPlayerConfig {
  autoplay?: boolean;
  controls?: boolean;
  muted?: boolean;
  showThumbnail?: boolean;
}
