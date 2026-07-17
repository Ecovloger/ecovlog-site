export default function Footer() {

return (

<footer className="

hidden
md:block

py-10
mt-20
border-t
border-white/10

">


<div className="

max-w-[1400px]
mx-auto
px-6
md:px-10
text-white/50
text-sm

">


© {new Date().getFullYear()} EcoVlog


</div>


</footer>


);

}