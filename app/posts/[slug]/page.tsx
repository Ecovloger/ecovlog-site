import { client } from "@/sanity/lib/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageCarousel from "@/components/ImageCarousel";
import BackButton from "@/components/BackButton";

const query = `
*[_type == "post" && slug.current == $slug][0]{
  title,
  images,
  description,
  date,
  category
}
`;

export default async function PostPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;

  const post = await client.fetch(query, {
    slug,
  });

  if (!post) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white p-10">
        Публикация не найдена
      </main>
    );
  }

  return (
    <main
      className="
        min-h-screen
        bg-neutral-950
        text-white
      "
    >
      <Header />

      <section
        className="
          max-w-[1000px]
          mx-auto

          px-4
          md:px-6

          pt-0
          md:pt-1

          pb-12
        "
      >
        <BackButton />

        <div
          className="
            mt-0
            md:mt-1
          "
        >
          <ImageCarousel
            images={post.images}
            title={post.title}
          />
        </div>

        <p
          className="
            mt-8
            md:mt-10

            text-base
            md:text-xl

            text-white/70
            leading-relaxed
          "
        >
          {post.description}
        </p>
      </section>

      <Footer />
    </main>
  );
}