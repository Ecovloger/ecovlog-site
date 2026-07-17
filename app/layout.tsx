import "./globals.css";

import { Passion_One } from "next/font/google";
import PageBackground from "@/components/PageBackground";


const passionOne = Passion_One({
  subsets: ["cyrillic", "latin"],
  weight: ["700", "900"],
  variable: "--font-passion",
});


export const metadata = {

metadataBase: new URL("https://ecovloger.ru"),

title: {
default: "EcoVlog — экологические новости России",
template: "%s — EcoVlog"
},

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
"ru_RU",

url:
"https://ecovloger.ru",

siteName:
"EcoVlog",

images: [
{
url: "/images/ecovlog-logo.png",
width: 800,
height: 800,
alt: "EcoVlog"
}
]

},

twitter: {

card: "summary_large_image",

title: "EcoVlog — экологические новости России",

description:
"Экологические расследования, новости природы и мониторинг экологических нарушений.",

images: ["/images/ecovlog-logo.png"]

},

};



export default function RootLayout({

children,

}:{

children: React.ReactNode

}){


return (

<html lang="ru">

<body className={passionOne.variable}>

<PageBackground>

{children}

</PageBackground>


</body>

</html>

)

}