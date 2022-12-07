import { chromium } from "playwright";

// Generar resultados de google

async function getResultsFromGoogle(query, browser) {

    const page = await browser.newPage()
    await page.goto('https://www.google.com/')
    await page.waitForSelector('input[name="q"]')
    await page.type('input[name="q"]', query)
    await page.keyboard.press('Enter')

    await page.waitForNavigation({ waitUntil: 'networkidle' })

    const listadoResultados = await page.evaluate(() => {
        let resultados = []
        document.querySelectorAll('div [data-header-feature] div a').forEach((anchor, index) => {
            resultados.push({
                index: index,
                title: anchor.innerText,
                url: anchor.href,
            })
        })
        return resultados
    })
    // console.log(listadoResultados);
    return listadoResultados
}

// async function visitResultAndGetContent(resultado, browser) {
    
//     const page = await browser.newPage()
//     await page.goto(resultado.url)
//     // await page.goto(resultado)
//     await page.waitForLoadState('domcontentloaded')

//     const content = await page.evaluate(() => {
//         const rawText = document.querySelector("main")?.innerText || document.querySelector('body')?.innerText
//         return rawText
//     })
//     // console.log(content);
//     // await browser.close()
//     return content
// }

async function visitResultAndGetContent(resultado) {

    const browser = await chromium.launch()
    const page = await browser.newPage()
    await page.goto(resultado.url)
    // await page.goto(resultado)
    await page.waitForLoadState('domcontentloaded')

    const content = await page.evaluate(() => {
        const rawText = document.querySelector("main")?.innerText || document.querySelector('body')?.innerText
        return rawText
    })
    // console.log(content);
    await browser.close()
    return content
}

async function startScraping(query) {

    const browser = await chromium.launch()
    const allText = []

    const listadoResultados = await
        getResultsFromGoogle(query, browser)

    //síncrono
    // listadoResultados.forEach(resultado => {
    //     visitResultAndGetContent(resultado, browser)
    // })
    // asíncrono
    console.log(typeof(listadoResultados));
    for await (const url of listadoResultados) {
        const contenido = await visitResultAndGetContent(url)
        allText.push(contenido)
        console.log(allText);
    }

    console.log(allText);

    await browser.close()
}

startScraping('nodejs')

// async function test() {
//     const browser = await chromium.launch()
//     const url = 'https://humedaleschile.mma.gob.cl/humedales-urbanos/'
//     const contenido = await visitResultAndGetContent(url, browser)
//     console.log(typeof(contenido));
// }

// test()