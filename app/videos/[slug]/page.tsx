import { client } from "@/sanity/lib/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";


const query = `
*[_type == "video" && slug.current == $slug][0]{
  title,
  description,
  youtubeUrl,
  date
}
`;


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



export default async function VideoPage({
  params,
}: {
  params: Promise<{slug: string}>
}) {


  const {slug} = await params;


  const video = await client.fetch(query, {
    slug,
  });



  if (!video) {

    return (
      <main className="min-h-screen bg-neutral-950 text-white p-10">

        Видео не найдено

      </main>
    );

  }



  const youtubeId = getYoutubeId(video.youtubeUrl);



  return (

    <main className="min-h-screen bg-neutral-950 text-white">


      <Header />


      <section
        className="
        max-w-[1200px]
        mx-auto
        px-6
        md:px-10
        py-16
        "
      >


        <div className="grid md:grid-cols-[400px_1fr] gap-12 items-start">


          <div
            className="
            rounded-3xl
            overflow-hidden
            bg-black
            aspect-[9/16]
            "
          >

            <iframe

              src={`https://www.youtube.com/embed/${youtubeId}`}

              className="
              w-full
              h-full
              "

              allowFullScreen

            />

          </div>



          <div>


            <h1 className="text-5xl font-bold">

              {video.title}

            </h1>



            <p
              className="
              mt-8
              text-xl
              text-white/70
              "
            >

              {video.description}

            </p>



            <div
              className="
              mt-6
              text-white/40
              "
            >

              {video.date}

            </div>


          </div>


        </div>


      </section>


      <Footer />


    </main>

  );

}