## If you're contributing numbers

Make sure you put in your contributions in the [numbers.ts](https://github.com/SuppliedOrange/WebscrapeCounting/blob/main/data/numbers.ts) file

## The Golden Rules

1) You shall not repeat domains. If `google.com` has been used, you cannot re-use it. But you may use `google.co.uk`.
2) The nature of the linked websites must not, to a considerable extent, cater to NSFW content. `Reddit` is fine, `Onlyfans` is not.
3) Your evaluation function must always return a string or a number containing the number.
4) The site must be somewhat reputable and must appear to be concrete. This rule exists because such domains usually disappear shortly or may have harmful content. Additionally, the data you are pulling from must not be volatile.
5) You need to fetch your number or numbers that equate to your number from a place that is visible to the user as text (or is in an element for a similar purpose, visible or not). You may not source numbers or text from class names, tags etc. but you may source them from places like `.innerHTML` and `.innerText` of an element.
6) You shall count in order. If the last number is 14, you may not add anything above 15 until you have added 15 to the numbers list.
7) The scraping must not be based on chance or race conditions. Obviously, this rule is hard to implement, but some sites like chess.com that lazy load and fire the `window load` event before content is rendered must be avoided. It's easy to see what sites cause this by running the scraper a few times.
