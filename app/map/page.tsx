import SectionHeader from "@/components/SectionHeader";
import Footer from "@/components/Footer";
import Link from "next/link";


export default function MapPage(){


return (

<main className="
min-h-screen
bg-neutral-950
text-white
">


<SectionHeader />



<section className="
max-w-[1200px]
mx-auto
px-4
md:px-6
pt-2
md:pt-20
pb-10
md:pb-20
text-center
">



<h1 className="
text-3xl
md:text-5xl
font-bold
">

Народная карта экологических нарушений

</h1>



<p className="
mt-4
md:mt-6
text-base
md:text-xl
text-white/60
max-w-3xl
mx-auto
">

Здесь вы отмечаете природоохранные нарушения,
а мы принимаем меры к их устранению.

</p>





<Link

href="https://greenfront.su/eco-map/"

target="_blank"

className="
block
mt-6
md:mt-12
mx-auto
max-w-[750px]
group
"

>



<div className="
relative
rounded-3xl
overflow-hidden
bg-white/10
border
border-white/20
backdrop-blur-xl
shadow-[0_20px_60px_rgba(255,255,255,0.12)]
transition-all
duration-500
group-hover:scale-[1.03]
">





<img

src="/images/ecocard.png"

alt="Народная карта экологических нарушений"

className="
w-full
h-auto
object-contain
p-2
md:p-6
"

/>





<div className="
absolute
inset-0
bg-gradient-to-b
from-transparent
via-transparent
to-black/40
"
/>





<div className="
absolute
inset-0
flex
items-center
justify-center
">



<span className="
text-xl
md:text-3xl
font-bold
bg-black/60
border
border-white/20
backdrop-blur-xl
px-5
md:px-8
py-3
md:py-4
rounded-full
shadow-xl
transition
group-hover:bg-black/75
">

Открыть Экокарту

</span>



</div>





</div>



</Link>





</section>



<Footer />


</main>

)

}