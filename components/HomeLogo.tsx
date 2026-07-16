import Link from "next/link";


export default function HomeLogo(){


return (

<Link

href="/"

className="
fixed
top-6
left-6
z-50
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

)

}