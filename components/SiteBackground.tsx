"use client";


export default function SiteBackground({

children

}:{

children: React.ReactNode

}){


return (

<div

className="
relative
min-h-screen
text-white
"

>


<div

className="
fixed
inset-0
bg-cover
bg-center
bg-no-repeat
z-0
"

style={{

backgroundImage:
"url('/images/site-bg.jpg')"

}}

/>



<div

className="
fixed
inset-0
bg-black/70
z-0
"

/>



<div

className="
relative
z-10
min-h-screen
"

>

{children}

</div>



</div>

)

}