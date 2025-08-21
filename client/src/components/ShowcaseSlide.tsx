import MediaFit from "./MediaFit";

export default function ShowcaseSlide({ photoUrl, title }: { photoUrl: string; title: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Lock the frame to 16:9 on desktop, 4:3 on small */}
      <div className="aspect-[16/9] sm:aspect-[16/9] md:aspect-[21/9]">
        <MediaFit src={photoUrl} alt={title} className="rounded-2xl" />
      </div>
    </div>
  );
}