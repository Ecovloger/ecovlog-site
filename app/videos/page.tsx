import { client } from "@/sanity/lib/client";
import VideoCard from "@/components/VideoCard";
import SectionHeader from "@/components/SectionHeader";
import Footer from "@/components/Footer";


const query = `

*[
_type == "video" &&
defined(slug.current) &&
(
!defined($search)
||
title match $search
||
description match $search
)

]
| order(date desc)
{
  _id,
  title,
  description,
  youtubeUrl,
  date,
  slug
}

`;



export default async function Videos({

searchParams,

}: {

searchParams: Promise<{
search?: string
}>

}) {



const params = await searchParams;


const search = params.search
? `*${params.search}*`
: null;



const videos = await client.fetch(

query,

{
search
}

);



return (

<main className="
min-h-screen
bg-neutral-950
text-white
">



<SectionHeader

searchAction="/videos"

searchPlaceholder="Поиск видео..."

 />




<section className="
max-w-[1400px]
mx-auto
px-3
md:px-10
pt-2
md:pt-16
pb-6
md:pb-16
">



<h1 className="
text-3xl
md:text-5xl
font-bold
">

Видео

</h1>




<div
className="
grid
grid-cols-2
lg:grid-cols-4
gap-3
md:gap-8
mt-6
md:mt-12
"
>



{videos.length > 0 ? (


videos.map((video:any)=>(


<VideoCard

key={video._id}

{...video}

/>


))


) : (


<p className="
text-white/50
mt-10
">

Ничего не найдено

</p>


)}



</div>



</section>



<Footer />



</main>

)

}