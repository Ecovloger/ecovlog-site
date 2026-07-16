"use client";


export default function PageBackground({

children

}:{

children: React.ReactNode

}){


return (

<div className="
relative
min-h-screen
overflow-hidden
">


<div

className="
fixed
inset-0
bg-cover
bg-center
bg-no-repeat
"

style={{

backgroundImage:

`
linear-gradient(
rgba(5,5,5,0.82),
rgba(5,5,5,0.92)
),
url('/images/site-bg.jpg')
`

}}

/>


<div className="
relative
z-10
">

{children}

</div>


</div>

)

}