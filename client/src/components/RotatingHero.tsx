import { useState, useEffect } from "react";
import BrandStripes from "./BrandStripes";
import bmwImage1 from "@assets/FB_IMG_1751951510231_1755750547262.jpg";
import bmwImage2 from "@assets/FB_IMG_1751951504094_1755750547274.jpg";
import bmwMeetImage from "@assets/DSC_1899_1755751395846.jpg";
import evoImage from "@assets/DSC_1850_1755751434966.jpg";

const VEHICLE_IMAGES = [
  "/vehicle-1.jpg", // Black BMW E36 in parking lot (your upload)
  "/vehicle-2.jpg", // Green BMW M3/M4 in forest (your upload)  
  bmwImage1, // BMW M2 Competition Track Beast
  bmwImage2, // BMW M2 Competition Blue Thunder
  bmwMeetImage, // BMW M4 Competition Meet
  evoImage, // Mitsubishi Lancer Evolution IX
];

export default function RotatingHero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % VEHICLE_IMAGES.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative isolate">
      {/* Rotating vehicle images */}
      <div className="relative h-[56vh] w-full overflow-hidden bg-slate-900">
        {VEHICLE_IMAGES.map((imageUrl, index) => (
          <img
            key={imageUrl}
            src={imageUrl}
            alt={`Featured community build ${index + 1}`}
            className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-1000 ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      {/* Dark overlay for readable text */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Watermark badge in the background */}
      <img
        src="/vintage-badge.png"
        alt="VINtage Garage badge"
        className="pointer-events-none select-none absolute right-8 bottom-6 w-40 opacity-40 mix-blend-overlay hidden md:block"
      />

      {/* Copy + CTAs */}
      <div className="absolute inset-0 flex items-center">
        <div className="mx-auto w-full max-w-6xl px-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">Trust every mile.</h1>
          <p className="mt-3 text-white/90 max-w-xl">
            Real builds from the community. Share it. Transfer it. Preserve it.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/register" className="px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold">Create VIN profile</a>
            <a href="/signin" className="px-4 py-2 rounded-lg border border-white/80 text-white">Sign up / Sign in</a>
          </div>
          <div className="mt-6"><BrandStripes/></div>
        </div>
      </div>

      {/* Image indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {VEHICLE_IMAGES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentImageIndex ? "bg-white" : "bg-white/50"
            }`}
            aria-label={`Show image ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}