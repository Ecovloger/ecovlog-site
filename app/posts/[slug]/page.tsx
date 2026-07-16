import {client} from "@/sanity/lib/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageCarousel from "@/components/ImageCarousel";


const query = `

*[_type == "post" && slug.current == $slug][0]{

title,
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



export default async function PostPage({

params,

}:{

params: Promise<{
slug:string
}>

}){


const {slug} = await params;



const post = await client.fetch(

query,

{
slug
}

);



if(!post){

return (

<main className="
min-h-screen
bg-neutral-950
text-white
p-10
">

Публикация не найдена

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
max-w-[1000px]
mx-auto
px-6
py-16
">



<div className="
text-green-400
uppercase
text-sm
">

{
categories[
post.category as keyof typeof categories
]
}

</div>




<h1 className="
mt-4
text-5xl
font-bold
leading-tight
">

{post.title}

</h1>




<div className="
mt-4
text-white/40
">

{post.date}

</div>





<div className="
mt-10
">

<ImageCarousel

images={post.images}

title={post.title}

/>

</div>





<p className="
mt-10
text-xl
text-white/70
leading-relaxed
">

{post.description}

</p>




</section>



<Footer />


</main>

)

}