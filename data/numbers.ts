// @ts-nocheck
/**
 * Type checking is disabled for this file to make query functions easier.
 */

import ScrapeQuery from "../src/types/ScrapeQuery.ts";

/**
 * Fetches the number from the links given below.
 * Please read [the golden rules](https://github.com/SuppliedOrange/WebscrapeCounting?tab=readme-ov-file#the-golden-rules) before contributing.
 */

const data: ScrapeQuery[] = [

    {
        number: 1,
        url: "https://cloud.google.com/text-to-speech/docs/release-notes",
        queryFunction: () => {
            return document.querySelector("#May_14_2024").innerText[4];
        }
    },
    {
        number: 2,
        url: "https://remove.bg/privacy",
        queryFunction: () => {
            return document.querySelectorAll('h2.h4')[2].innerText[0]
        }
    },
    {
        number: 3,
        url: "https://www.npmjs.com/package/terminal-link?activeTab=readme",
        queryFunction: () => {
            return Array.from(
                document.querySelector("div.border-box > div > a[aria-label='Npm']")
                .parentElement.parentElement.children
            ).filter( x => x.tagName == "SPAN")[0].innerText.length.toString()
        }
    },
    {
        number: 4,
        url: "https://pokemondb.net/pokedex/charmander",
        queryFunction: () => {
            return document.querySelector("td").innerText.substring(3,4)
        }
    },
    {
        number: 5,
        url: "https://apps.apple.com/us/app/nyan-cat-lost-in-space/id433592592",
        queryFunction: () => {
            return Math.ceil(document.querySelector(".we-customer-ratings__averages__display").innerText)
        }
    },
    {
        number: 6,
        url: "https://dotnet.microsoft.com/en-us/download/dotnet/6.0",
        queryFunction: () => {
            return document.querySelector("h1").innerText.substring(14)
        }
    },

]

export default data;
