import Link from "next/link";


export default function HomeHeader(){


return (

<header className="
w-full
px-6
py-5
flex
items-center
justify-between
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



<Link

href="/contacts"

className="
bg-white
text-black
px-6
py-3
rounded-full
font-semibold
shadow-lg
hover:scale-105
transition
"

>

Контакты

</Link>



</header>

)

}