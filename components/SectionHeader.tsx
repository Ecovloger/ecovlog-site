import Link from "next/link";
import SectionNavigation from "@/components/SectionNavigation";


export default function SectionHeader({

searchAction = "/",
searchPlaceholder = "Поиск...",
current

}: {

searchAction?: string;
searchPlaceholder?: string;
current?: string;

}){


return (

<header
className="
w-full
px-3
md:px-6
py-4
md:py-5
flex
items-center
justify-between
gap-3
overflow-x-hidden
"
>


<Link

href="/"

className="
group
hover:scale-105
transition
duration-300
shrink-0
"

>


<div
className="
relative
overflow-hidden
rounded-3xl
p-2
bg-white/10
border
border-white/20
backdrop-blur-2xl
shadow-[0_8px_40px_rgba(255,255,255,0.15)]
"
>


<div
className="
absolute
inset-0
bg-gradient-to-br
from-white/30
via-transparent
to-transparent
pointer-events-none
"
/>



<img

src="/images/ecovlog-logo.png"

alt="EcoVlog"

className="
relative
h-12
md:h-16
w-auto
object-contain
"

/>


</div>


</Link>





<div
className="
flex
flex-col
items-end
gap-3
ml-auto
min-w-0
w-full
md:w-auto
"
>





<div
className="
flex
items-center
justify-end
gap-2
w-full
"
>





<form

action={searchAction}

className="
relative
w-full
md:w-auto
"

>


<input

name="search"

placeholder={searchPlaceholder}

className="
w-full
md:w-[240px]
rounded-full
bg-white/10
border
border-white/20
backdrop-blur-xl
px-4
py-2
text-xs
md:text-sm
text-white
placeholder:text-white/50
outline-none
focus:bg-white/20
transition
"

/>


</form>






<nav

className="
hidden
md:flex
items-center
gap-5
text-white/80
text-sm
"

>


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
relative
overflow-hidden
bg-white/10
text-white
px-5
py-2
rounded-full
font-semibold
border
border-white/25
backdrop-blur-xl
shadow-[0_8px_30px_rgba(255,255,255,0.12)]
hover:bg-white/20
hover:scale-105
transition
duration-300
"

>

<span
className="
relative
z-10
"
>
Контакты
</span>


<div
className="
absolute
inset-0
bg-gradient-to-br
from-white/30
via-transparent
to-transparent
pointer-events-none
"
/>


</Link>


</nav>



</div>





<SectionNavigation

current={current}

/>





</div>





</header>

)

}