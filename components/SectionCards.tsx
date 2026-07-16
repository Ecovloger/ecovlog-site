"use client";


import Link from "next/link";
import {useState} from "react";


const sections = [

  {
    title: "Видео",
    image: "/images/video.jpg",
    link: "/videos",
  },

  {
    title: "Статьи",
    image: "/images/articles.jpg",
    link: "/articles",
  },

  {
    title: "Публикации",
    image: "/images/posts.jpg",
    link: "/posts",
  },

  {
    title: "Экокарта",
    image: "/images/map.jpg",
    link: "/map",
  },

];



export default function SectionCards(){


const [active,setActive] = useState<number | null>(null);



return (

<section className="
max-w-[1500px]
mx-auto
px-4
md:px-6
py-10
md:py-16
">


<div className="
flex
gap-3
md:gap-5
justify-center
items-center
h-[320px]
md:h-[520px]
">


{/* ДЕСКТОПНАЯ ВЕРСИЯ */}


<div className="
hidden
md:flex
w-full
gap-5
h-[520px]
">


{sections.map((item,index)=>(


<Link

key={item.title}

href={item.link}

onMouseEnter={()=>setActive(index)}

onMouseLeave={()=>setActive(null)}

className={`
transition-all
duration-500
ease-out

${

active === index

? "flex-[1.35]"

: active !== null

? "flex-[0.85]"

: "flex-1"

}

`}

>


<div className="
relative
h-[450px]
rounded-3xl
overflow-hidden
cursor-pointer
shadow-2xl
">


<img

src={item.image}

alt={item.title}

className="
absolute
inset-0
w-full
h-full
object-cover
"

/>



<div className="
absolute
inset-0
bg-black/40
"
/>



<h2 className="
absolute
bottom-8
left-0
right-0
text-center
text-4xl
font-bold
">

{item.title}

</h2>



</div>


</Link>


))}


</div>





{/* МОБИЛЬНАЯ ВЕРСИЯ */}


<div className="
flex
md:hidden
w-full
gap-2
h-[300px]
">


{sections.map((item)=>(


<Link

key={item.title}

href={item.link}

className="
flex-1
"

>


<div className="
relative
h-[300px]
rounded-2xl
overflow-hidden
shadow-xl
">


<img

src={item.image}

alt={item.title}

className="
absolute
inset-0
w-full
h-full
object-cover
"

/>



<div className="
absolute
inset-0
bg-black/40
"
/>



<h2 className="
absolute
inset-0
flex
flex-col
items-center
justify-center
text-lg
font-bold
tracking-widest
text-center
">


{item.title.split("").map((letter,index)=>(

<span

key={index}

className="block"

>

{letter}

</span>

))}



</h2>



</div>


</Link>


))}


</div>




</div>


</section>

)

}