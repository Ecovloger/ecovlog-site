import "./globals.css";

import PageBackground from "@/components/PageBackground";


export const metadata = {

title: "EcoVlog — экологические новости России",

description:
"Экологические расследования, новости природы, научные материалы и карта экологических нарушений.",

keywords: [
"экология",
"экологические новости",
"экологические нарушения",
"природа России",
"экологические расследования",
"Зелёный Фронт",
"EcoVlog"
],

authors: [
{
name: "EcoVlog"
}
],

openGraph: {

title:
"EcoVlog — экологические новости России",

description:
"Экологические расследования, новости природы и мониторинг экологических нарушений.",

type:
"website",

locale:
"ru_RU"

},

};



export default function RootLayout({

children,

}:{

children: React.ReactNode

}){


return (

<html lang="ru">

<body>

<PageBackground>

{children}

</PageBackground>


</body>

</html>

)

}