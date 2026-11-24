import Image from "next/image";
import { getPaintingImageUrl } from "@/lib/utils/imageUrl";

/** Neutral block until a portrait exists. Takes a storage path once one is configured. */
export default function PortraitPlaceholder({ imagePath }: { imagePath?: string | null }) {
  const size = "w-[min(100%,calc(60svh*0.8))] lg:w-full";
  if (imagePath) {
    return (
      <div className={`relative aspect-[4/5] ${size}`}>
        <Image
          src={getPaintingImageUrl(imagePath)}
          alt=""
          fill
          sizes="(max-width: 1024px) 80vw, 40vw"
          className="object-cover"
        />
      </div>
    );
  }
  return <div aria-hidden className={`aspect-[4/5] bg-placeholder ${size}`} />;
}
