interface VideoBlockProps {
  src?: string;
  embedUrl?: string;
  title?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1';
  autoplay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
}

export default function VideoBlock({
  src,
  embedUrl,
  title,
  aspectRatio = '16:9',
  autoplay = false,
  controls = true,
  loop = false,
  muted = false,
}: VideoBlockProps) {
  const aspectRatioClasses = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-4/3',
    '1:1': 'aspect-square',
  };

  if (embedUrl) {
    // YouTube, Vimeo, etc.
    return (
      <div className={`relative ${aspectRatioClasses[aspectRatio]} my-8`}>
        <iframe
          src={embedUrl}
          title={title || 'Video'}
          className="absolute inset-0 w-full h-full rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (src) {
    // Video locale
    return (
      <div className={`relative ${aspectRatioClasses[aspectRatio]} my-8`}>
        <video
          src={src}
          className="w-full h-full rounded-lg object-cover"
          autoPlay={autoplay}
          controls={controls}
          loop={loop}
          muted={muted}
          playsInline
        >
          Votre navigateur ne supporte pas la lecture vidéo.
        </video>
      </div>
    );
  }

  return null;
}