import Link from "next/link";


export default function Header(){


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



<nav className="
flex
items-center
gap-5
">


<Link

href="/contacts"

className="
bg-white
text-black
px-6
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



</header>

)

}