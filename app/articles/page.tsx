import {client} from "@/sanity/lib/client";
import {urlFor} from "@/sanity/lib/image";
import SectionHeader from "@/components/SectionHeader";
import Footer from "@/components/Footer";
import Link from "next/link";


const categories = [
  {
    title: "Все",
    value: ""
  },
  {
    title: "Новости",
    value: "news"
  },
  {
    title: "Расследования",
    value: "investigation"
  },
  {
    title: "Научные материалы",
    value: "science"
  },
  {
    title: "Аналитика",
    value: "analytics"
  }
];



export default async function ArticlesPage({

searchParams,

}: {

searchParams: Promise<{
category?: string;
search?: string;
}>

}) {



const params = await searchParams;


const category = params.category;


const search = params.search
? `*${params.search}*`
: null;



const query = `

*[
_type == "article" &&

(
!defined($category)
||
category == $category
)

&&

(
!defined($search)
||
title match $search
||
description match $search
)

]

| order(date desc){

title,
slug,
category,
cover,
description,
date

}

`;



const articles = await client.fetch(

query,

{

category: category || null,

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

searchAction="/articles"

searchPlaceholder="Поиск статей..."

 />



<section className="
max-w-[1500px]
mx-auto
px-3
md:px-6
pt-2
md:pt-12
pb-6
md:pb-12
">



<h1 className="
text-3xl
md:text-4xl
font-bold
">

Статьи

</h1>



<p className="
mt-3
md:mt-4
text-base
md:text-lg
text-white/60
">

Новости, экологические расследования,
научные материалы и аналитика.

</p>





<div className="
flex
flex-wrap
gap-2
md:gap-3
mt-5
md:mt-8
">



{categories.map((item)=>(


<Link

key={item.value}

href={
item.value
?
`/articles?category=${item.value}`
:
"/articles"
}

className={`
px-3
md:px-5
py-1.5
md:py-2
text-xs
md:text-base
rounded-full
border
transition

${
category === item.value ||
(!category && item.value === "")
?
"bg-white text-black"
:
"bg-white/10 text-white hover:bg-white/20"
}

`}

>

{item.title}

</Link>


))}



</div>





<div className="
grid
grid-cols-2
lg:grid-cols-3
xl:grid-cols-4
gap-3
md:gap-6
mt-6
md:mt-10
">



{articles.length > 0 ? (



articles.map((article:any)=>(


<Link

key={article.slug.current}

href={`/articles/${article.slug.current}`}

>



<article className="
rounded-xl
md:rounded-2xl
overflow-hidden
bg-white/10
border
border-white/10
hover:scale-[1.03]
transition
duration-300
">



{article.cover && (


<img

src={
urlFor(article.cover)
.width(600)
.height(350)
.url()
}

alt={article.title}

className="
w-full
h-24
md:h-44
object-cover
"

/>


)}




<div className="
p-2
md:p-4
">



<div className="
text-[9px]
md:text-xs
text-green-400
uppercase
">

{
categories.find(
(c)=>c.value===article.category
)?.title
}

</div>



<h2 className="
mt-1
md:mt-2
text-sm
md:text-xl
font-bold
line-clamp-2
">

{article.title}

</h2>



<p className="
mt-1
md:mt-2
text-xs
md:text-sm
text-white/60
line-clamp-2
">

{article.description}

</p>



<div className="
mt-2
md:mt-4
text-[10px]
md:text-xs
text-white/40
">

{article.date}

</div>



</div>



</article>



</Link>


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