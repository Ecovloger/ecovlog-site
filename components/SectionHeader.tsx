import Link from "next/link";


export default function SectionHeader({

searchAction = "/",
searchPlaceholder = "Поиск..."

}: {

searchAction?: string;
searchPlaceholder?: string;

}){


return (

<header className="
w-full
px-6
py-5
flex
items-center
justify-between
gap-6
">


<Link

href="/"

className="
hover:scale-105
transition
duration-300
shrink-0
"

>

<img

src="/images/ecovlog-logo.png"

alt="EcoVlog"

className="
h-16
w-auto
object-contain
"

/>

</Link>




<div className="
flex
items-center
gap-6
ml-auto
">


<div className="
relative
">


<form

action={searchAction}

className="
relative
"

>


<input

name="search"

placeholder={searchPlaceholder}

className="
w-[180px]
md:w-[240px]
rounded-full
bg-white/10
border
border-white/20
px-5
py-2.5
text-sm
text-white
placeholder:text-white/50
outline-none
focus:bg-white/20
transition
"

/>


</form>


</div>





<nav className="
flex
items-center
gap-5
text-white/80
text-sm
">


<Link

href="/videos"

className="
hover:text-white
transition
"

>

Видео

</Link>



<Link

href="/articles"

className="
hover:text-white
transition
"

>

Статьи

</Link>



<Link

href="/posts"

className="
hover:text-white
transition
"

>

Публикации

</Link>



<Link

href="/map"

className="
hover:text-white
transition
"

>

Экокарта

</Link>



<Link

href="/contacts"

className="
bg-white
text-black
px-5
py-2
rounded-full
font-semibold
hover:scale-105
transition
"

>

Контакты

</Link>



</nav>


</div>


</header>

)

}