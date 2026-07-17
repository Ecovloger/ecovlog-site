import {client} from "@/sanity/lib/client";
import {urlFor} from "@/sanity/lib/image";
import SectionHeader from "@/components/SectionHeader";
import Footer from "@/components/Footer";
import Link from "next/link";


const POSTS_PER_PAGE = 20;


const query = `

*[_type == "post"]
| order(date desc)
[$start...$end]
{

title,
slug,
images,
description,
date,
category

}

`;


const countQuery = `

count(*[_type == "post"])

`;



export default async function PostsPage({

searchParams,

}:{

searchParams: Promise<{
page?: string
}>

}){


const params = await searchParams;


const currentPage =
Number(params.page || "1");


const start =
(currentPage - 1) * POSTS_PER_PAGE;


const end =
start + POSTS_PER_PAGE;



const [posts,totalPosts] =
await Promise.all([


client.fetch(
query,
{
start,
end
}
),


client.fetch(
countQuery
)

]);



const totalPages =
Math.ceil(
totalPosts / POSTS_PER_PAGE
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

current="/posts"

searchAction="/posts/search"

searchPlaceholder="Поиск публикаций..."

 />



<section

className="
max-w-[1400px]
mx-auto
px-3
md:px-6
pt-2
md:pt-12
pb-6
md:pb-12
"

>



<h1
className="
text-4xl
font-bold
"
>

Публикации

</h1>



<p
className="
mt-4
text-lg
text-white/60
"
>

Короткие экологические материалы,
факты и визуальные истории.

</p>





<div

className="
grid
grid-cols-2
lg:grid-cols-3
xl:grid-cols-4
gap-3
md:gap-6
mt-10
"

>


{

posts.map((post:any)=>(


<Link

key={post.slug.current}

href={`/posts/${post.slug.current}`}

>


<article

className="
bg-white/10
rounded-2xl
overflow-hidden
border
border-white/10
hover:scale-[1.03]
transition
duration-300
backdrop-blur-xl
"

>



{

post.images?.[0] && (

<div

className="
relative
w-full
aspect-[3/4]
bg-black/20
flex
items-center
justify-center
overflow-hidden
p-2
"

>


<img

src={

urlFor(post.images[0])
.width(900)
.height(1200)
.fit("max")
.auto("format")
.url()

}


alt={post.title}


className="
w-full
h-full
object-contain
rounded-xl
"

/>


</div>

)

}





<div

className="
p-3
md:p-4
"

>


<h2

className="
text-sm
md:text-xl
font-bold
line-clamp-2
leading-tight
"

>

{post.title}

</h2>



<p

className="
mt-2
text-xs
md:text-sm
text-white/60
line-clamp-3
"

>

{post.description}

</p>



</div>



</article>



</Link>


))

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


const page=index+1;


return (

<Link

key={page}

href={`/posts?page=${page}`}

className="
px-4
py-2
rounded-full
text-sm
border
border-white/20
bg-white/10
hover:bg-white/20
transition
"

>

{page}

</Link>

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