import {client} from "@/sanity/lib/client";
import VideoCard from "@/components/VideoCard";
import SectionHeader from "@/components/SectionHeader";
import Footer from "@/components/Footer";


const VIDEOS_PER_PAGE = 20;



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
[$start...$end]
{

_id,
title,
description,
youtubeUrl,
date,
slug

}

`;



const countQuery = `

count(*[
_type == "video" &&
defined(slug.current) &&
(
!defined($search)
||
title match $search
||
description match $search
)

])

`;







export default async function Videos({

searchParams,

}:{

searchParams: Promise<{
search?: string;
page?: string;
}>

}) {



const params = await searchParams;



const search = params.search
? `*${params.search}*`
: null;



const currentPage =
Number(params.page || "1");



const start =
(currentPage - 1) * VIDEOS_PER_PAGE;



const end =
start + VIDEOS_PER_PAGE;







const [videos,totalVideos] =

await Promise.all([



client.fetch(

query,

{

search,

start,

end

}

),



client.fetch(

countQuery,

{

search

}

)


]);








const totalPages = Math.ceil(

totalVideos / VIDEOS_PER_PAGE

);







return (

<main

className="
min-h-screen
bg-neutral-950
text-white
"

>





<SectionHeader

current="/videos"

searchAction="/videos"

searchPlaceholder="Поиск видео..."

 />









<section

className="
max-w-[1400px]
mx-auto
px-3
md:px-10
pt-2
md:pt-16
pb-6
md:pb-16
"

>





<h1

className="
text-3xl
md:text-5xl
font-bold
"

>

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





{

videos.length > 0 ? (



videos.map((video:any)=>(



<VideoCard

key={video._id}

{...video}

/>


))


)

:

(


<p

className="
text-white/50
mt-10
"

>

Ничего не найдено

</p>


)


}





</div>









{

totalPages > 1 && (



<div

className="
flex
justify-center
gap-2
mt-12
flex-wrap
"

>





{

Array.from({

length: totalPages

}).map((_,index)=>{


const page = index + 1;



return (



<a

key={page}

href={

search

?

`/videos?page=${page}&search=${params.search}`

:

`/videos?page=${page}`

}

className={`

px-4
py-2
rounded-full
text-sm
border
transition


${

currentPage === page

?

"bg-white text-black border-white"

:

"bg-white/10 text-white border-white/20 hover:bg-white/20"

}

`}

>

{page}

</a>


)


})


}





</div>


)


}





</section>







<Footer />






</main>

)

}