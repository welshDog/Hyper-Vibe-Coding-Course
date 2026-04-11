// VideoPlayer.tsx
// Detects the video URL type and renders the right player automatically.
//
// Supported formats:
//   YouTube  — youtube.com/watch?v=ID  |  youtu.be/ID  |  youtube.com/embed/ID
//   Vimeo    — vimeo.com/ID  |  player.vimeo.com/video/ID
//   Direct   — any .mp4 / .mov / .webm / .ogg URL
//   Empty    — shows a "no video yet" placeholder

import { PlayCircle } from 'lucide-react';

// ── URL parsers ───────────────────────────────────────────────────────────────

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    // Already an embed URL
    if (u.hostname === 'www.youtube.com' && u.pathname.startsWith('/embed/')) {
      return u.pathname.split('/embed/')[1].split('/')[0] || null;
    }
    // Standard watch URL
    if (
      (u.hostname === 'www.youtube.com' || u.hostname === 'youtube.com') &&
      u.pathname === '/watch'
    ) {
      return u.searchParams.get('v');
    }
    // Short URL
    if (u.hostname === 'youtu.be') {
      return u.pathname.slice(1).split('/')[0] || null;
    }
  } catch {
    // Not a valid URL — fall through
  }
  return null;
}

function extractVimeoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === 'vimeo.com' || u.hostname === 'www.vimeo.com') {
      return u.pathname.slice(1).split('/')[0] || null;
    }
    if (u.hostname === 'player.vimeo.com') {
      // /video/ID
      return u.pathname.split('/video/')[1]?.split('/')[0] ?? null;
    }
  } catch {
    // Not a valid URL — fall through
  }
  return null;
}

function isDirectVideo(url: string): boolean {
  return /\.(mp4|mov|webm|ogg)(\?.*)?$/i.test(url);
}

// ── Sub-renders ───────────────────────────────────────────────────────────────

function YouTubeEmbed({ videoId, title }: { videoId: string; title: string }) {
  return (
    <iframe
      className="absolute inset-0 w-full h-full"
      src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
      title={title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );
}

function VimeoEmbed({ videoId, title }: { videoId: string; title: string }) {
  return (
    <iframe
      className="absolute inset-0 w-full h-full"
      src={`https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`}
      title={title}
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
    />
  );
}

function DirectVideo({ url, title }: { url: string; title: string }) {
  return (
    <video
      className="absolute inset-0 w-full h-full"
      controls
      preload="metadata"
      title={title}
    >
      <source src={url} />
      Your browser does not support the video tag.
    </video>
  );
}

function NoVideo() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center px-8">
        <PlayCircle className="h-16 w-16 mx-auto opacity-40 mb-4" />
        <p className="text-lg font-semibold opacity-80">Video coming soon</p>
        <p className="text-sm text-gray-500 mt-1">
          Check the written content below while we finish production.
        </p>
      </div>
    </div>
  );
}

// ── Public component ──────────────────────────────────────────────────────────

interface VideoPlayerProps {
  url?: string | null;
  title: string;
}

export function VideoPlayer({ url, title }: VideoPlayerProps) {
  const renderInner = () => {
    if (!url || url.trim() === '') return <NoVideo />;

    const youtubeId = extractYouTubeId(url);
    if (youtubeId) return <YouTubeEmbed videoId={youtubeId} title={title} />;

    const vimeoId = extractVimeoId(url);
    if (vimeoId) return <VimeoEmbed videoId={vimeoId} title={title} />;

    if (isDirectVideo(url)) return <DirectVideo url={url} title={title} />;

    // Unknown URL format — show placeholder rather than a broken embed
    return <NoVideo />;
  };

  return (
    <div
      className="bg-black rounded-lg shadow-lg overflow-hidden mb-8 relative"
      style={{ paddingBottom: '56.25%' }}
      data-testid="video-player"
    >
      {renderInner()}
    </div>
  );
}
