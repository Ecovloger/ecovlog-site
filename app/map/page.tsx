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
px-6
pt-4
md:pt-20
pb-20
text-center
">



<h1 className="
text-5xl
font-bold
">

Народная карта экологических нарушений

</h1>



<p className="
mt-6
text-xl
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
mt-12
mx-auto
max-w-[750px]
group
"

>



<div className="
relative
rounded-3xl
overflow-hidden
bg-white/5
border
border-white/10
shadow-2xl
transition-all
duration-500
group-hover:scale-105
group-hover:shadow-white/20
">



<div className="
h-[450px]
flex
items-center
justify-center
p-10
">


<img

src="/images/ecocard.png"

alt="Народная карта экологических нарушений"

className="
max-h-full
max-w-full
object-contain
"

/>



</div>




<div className="
absolute
inset-0
bg-black/30
group-hover:bg-black/10
transition
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
text-3xl
font-bold
bg-black/70
px-8
py-4
rounded-full
backdrop-blur-sm
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