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
        url: "https://imgur.com/upload",
        queryFunction: () => {
            return document.querySelector(".PopUpActions-textPicker > input").placeholder.split(" ").length
        }
    },

]

export default data;
