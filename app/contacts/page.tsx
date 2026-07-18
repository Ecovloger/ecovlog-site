import {client} from "@/sanity/lib/client";
import {urlFor} from "@/sanity/lib/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactButtons from "@/components/ContactButtons";

export const dynamic = "force-dynamic";

const query = `
*[_type == "contact"][0]{
  name,
  photo,
  description,
  youtube,
  instagram,
  tiktok,
  telegram,
  email,
  phone
}
`;

export default async function ContactsPage(){

  const contact = await client.fetch(query);

  if(!contact){
    return (
      <main className="p-10 text-white">
        Контакты не найдены
      </main>
    )
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
        max-w-[1100px]
        mx-auto

        px-4
        md:px-6

        pt-2
        pb-8

        md:py-16
      "
      >

        <div
          className="
          grid
          md:grid-cols-2

          gap-2
          md:gap-12

          items-center
        "
        >

          {/* Фото */}

          <div
            className="
            flex
            justify-center
            md:justify-start
          "
          >

            {contact.photo && (

              <img
                src={
                  urlFor(contact.photo)
                    .width(700)
                    .url()
                }

                alt={contact.name}

                className="
                rounded-3xl

                w-[38%]
                sm:w-[34%]

                md:w-full
              "
              />

            )}

          </div>

          {/* Правая колонка */}

          <div>

            <h1
              className="
              text-4xl
              md:text-5xl

              font-bold
              leading-tight

              text-center
              md:text-left
            "
            >
              {contact.name}
            </h1>

            <p
              className="
              mt-2
              md:mt-6

              text-sm
              md:text-xl

              text-white/70

              text-center
              md:text-left
            "
            >
              {contact.description}
            </p>

            <ContactButtons
              youtube={contact.youtube}
              instagram={contact.instagram}
              tiktok={contact.tiktok}
              telegram={contact.telegram}
              email={contact.email}
              phone={contact.phone}
            />

          </div>

        </div>

      </section>

      <Footer />

    </main>
  )
}