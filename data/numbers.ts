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
        url: "https://stackoverflow.com/questions/34001917/queryselectorall-with-multiple-conditions-in-javascript",
        queryFunction: () => {
            return Array.from( 
                document.querySelectorAll(".user-action-time > span.relativetime") )
                .map(x => x.innerText.split(" ")[1] 
            ).filter( x => x[0] == 4 )[0][0]
        }
    },
    {
        number: 5,
        url: "https://www.smogon.com/dex/sm/formats/ru/",
        queryFunction: () => {
            let [hp, atk] = document.querySelector("a[href='/dex/sm/pokemon/bewear/']")
                            .parentElement.parentElement.querySelectorAll(".PokemonAltRow-hp, .PokemonAltRow-atk");
            return atk.querySelector("span").innerText - hp.querySelector("span").innerText
        }
    },
    {
        number: 6,
        url: "https://pixlr.com/editor/",
        queryFunction: () => {
            return document.getElementById("splash-stars").innerText.split(" ").length + 1
        }
    },

]

export default data;
