import Link from "next/link";

type VideoProps = {
  title: string;
  description: string;
  date: string;
  slug: {
    current: string;
  };
  youtubeUrl: string;
};


export default function VideoCard({
  title,
  description,
  date,
  slug,
  youtubeUrl,
}: VideoProps) {


  function getYoutubeId(url: string) {

    if (!url) return null;


    if (url.includes("shorts/")) {
      return url.split("shorts/")[1].split("?")[0];
    }


    if (url.includes("watch?v=")) {
      return url.split("watch?v=")[1].split("&")[0];
    }


    if (url.includes("youtu.be/")) {
      return url.split("youtu.be/")[1].split("?")[0];
    }


    return null;
  }


  const youtubeId = getYoutubeId(youtubeUrl);


  const preview = youtubeId
    ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
    : "/images/video.jpg";


  return (

    <Link href={`/videos/${slug.current}`}>

      <article
        className="
        bg-white/10
        rounded-3xl
        overflow-hidden
        hover:scale-[1.03]
        transition
        duration-300
        cursor-pointer
        "
      >


        <div className="aspect-[9/16] bg-black">

          <img
            src={preview}
            alt={title}
            className="
            w-full
            h-full
            object-cover
            "
          />

        </div>


        <div className="p-6">


          <div className="text-sm text-white/50">
            {date}
          </div>


          <h2 className="text-2xl font-bold mt-2">
            {title}
          </h2>


          <p className="mt-3 text-white/70">
            {description}
          </p>


        </div>


      </article>

    </Link>

  );
}