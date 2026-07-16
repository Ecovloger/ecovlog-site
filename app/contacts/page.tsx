import {client} from "@/sanity/lib/client";
import {urlFor} from "@/sanity/lib/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";


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

<main className="
min-h-screen
bg-neutral-950
text-white
">


<Header />



<section className="
max-w-[1100px]
mx-auto
px-6
py-16
">



<div className="
grid
md:grid-cols-2
gap-12
items-center
">



<div className="
flex
justify-center
md:justify-start
">


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
w-[55%]
md:w-full
"

 />

)}


</div>




<div>


<h1 className="
text-5xl
font-bold
">

{contact.name}

</h1>



<p className="
mt-6
text-xl
text-white/70
">

{contact.description}

</p>




<div className="
mt-8
space-y-4
">



{contact.youtube && (

<a
href={contact.youtube}
className="
block
rounded-2xl
bg-white/10
px-6
py-4
hover:bg-white/20
"
>

📺 YouTube

</a>

)}



{contact.instagram && (

<a
href={contact.instagram}
className="
block
rounded-2xl
bg-white/10
px-6
py-4
hover:bg-white/20
"
>

📷 Instagram

</a>

)}



{contact.tiktok && (

<a
href={contact.tiktok}
className="
block
rounded-2xl
bg-white/10
px-6
py-4
hover:bg-white/20
"
>

🎵 TikTok

</a>

)}



{contact.telegram && (

<a
href={contact.telegram}
className="
block
rounded-2xl
bg-white/10
px-6
py-4
hover:bg-white/20
"
>

✈ Telegram

</a>

)}



</div>



<div className="mt-8 text-white/60">


{contact.email && (

<div>
✉ {contact.email}
</div>

)}


{contact.phone && (

<div>
☎ {contact.phone}
</div>

)}


</div>



</div>


</div>



</section>



<Footer />


</main>

)

}