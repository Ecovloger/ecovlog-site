import {client} from "@/sanity/lib/client";
import {urlFor} from "@/sanity/lib/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";


const query = `

*[_type == "post"] | order(date desc){

title,
slug,
images,
description,
date,
category

}

`;



const categories = {

eco:"Экология",

animals:"Животные",

nature:"Природа",

other:"Другое"

};



export default async function PostsPage(){


const posts = await client.fetch(query);



return (

<main className="
min-h-screen
bg-neutral-950
text-white
">



<Header />



<section className="
max-w-[1400px]
mx-auto
px-3
md:px-6
pt-2
md:pt-12
pb-6
md:pb-12
">



<h1 className="
text-4xl
font-bold
">

Публикации

</h1>



<p className="
mt-4
text-lg
text-white/60
">

Короткие экологические материалы,
факты и визуальные истории.

</p>




<div className="
grid
sm:grid-cols-2
lg:grid-cols-3
xl:grid-cols-4
gap-6
mt-10
">



{posts.map((post:any)=>(


<Link

key={post.slug.current}

href={`/posts/${post.slug.current}`}

>



<article className="
bg-white/10
rounded-2xl
overflow-hidden
border
border-white/10
hover:scale-[1.03]
transition
duration-300
">



{post.images?.[0] && (

<img

src={
urlFor(post.images[0])
.width(500)
.height(500)
.url()
}

alt={post.title}

className="
w-full
aspect-square
object-cover
"

/>

)}




<div className="
p-4
">



<div className="
text-xs
text-green-400
uppercase
">

{
categories[post.category as keyof typeof categories]
}

</div>



<h2 className="
mt-2
text-xl
font-bold
line-clamp-2
">

{post.title}

</h2>



<p className="
mt-2
text-sm
text-white/60
line-clamp-3
">

{post.description}

</p>



</div>



</article>



</Link>


))}



</div>



</section>



<Footer />


</main>

)

}