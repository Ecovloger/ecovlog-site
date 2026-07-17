import {client} from "@/sanity/lib/client";
import {urlFor} from "@/sanity/lib/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {PortableText} from "@portabletext/react";


const query = `

*[_type == "article" && slug.current == $slug][0]{

title,
category,
cover,
description,
content,
date

}

`;


const categories = {

news:"Новости",

investigation:"Расследования",

science:"Научные материалы",

analytics:"Аналитика"

};

export async function generateMetadata({

params,

}: {

params: Promise<{
slug: string
}>

}) {


const {slug} = await params;


const article = await client.fetch(

query,

{
slug
}

);


if(!article){

return {
title: "Статья не найдена"
}

}


return {

title: article.title,

description: article.description,

openGraph: {

title: article.title,

description: article.description,

images: article.cover
? [urlFor(article.cover).width(1200).height(630).url()]
: undefined,

type: "article"

},

twitter: {

card: "summary_large_image",

title: article.title,

description: article.description,

images: article.cover
? [urlFor(article.cover).width(1200).height(630).url()]
: undefined

}

}

}

export default async function ArticlePage({

params,

}:{

params: Promise<{
slug:string
}>

}){


const {slug} = await params;



const article = await client.fetch(

query,

{
slug
}

);



if(!article){

return (

<main className="
min-h-screen
bg-neutral-950
text-white
p-10
">

Статья не найдена

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



<article className="
max-w-[900px]
mx-auto
px-6
py-16
">



<div className="
text-green-400
text-sm
uppercase
">

{
categories[article.category as keyof typeof categories]
}

</div>




<h1 className="
mt-4
text-4xl
md:text-5xl
font-bold
leading-tight
">

{article.title}

</h1>




<div className="
mt-4
text-white/40
">

{article.date}

</div>





{article.cover && (

<div className="
mt-8
flex
justify-center
">


<img

src={
urlFor(article.cover)
.width(600)
.url()
}

alt={article.title}

className="
rounded-2xl
w-full
max-w-[600px]
max-h-[350px]
object-cover
"

/>


</div>

)}





{article.description && (

<p className="
mt-8
text-xl
text-white/70
leading-relaxed
">

{article.description}

</p>

)}






<div className="
mt-10
prose
prose-invert
prose-lg
max-w-none
">


<PortableText value={article.content}/>


</div>




</article>



<Footer />


</main>

)

}