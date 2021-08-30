const fs = require('fs')
const request = require('request-promise')
const HTMLParser = require('node-html-parser');

if (process.argv.length > 3) {
    parse();
}

async function parse() {
    const urls = fs.readFileSync(process.argv[2]).toString().split('\n')
    const result = []
    const info = { length: urls.length, index: 1 };

    const jobs = new Array(10).fill(1).map(i => worker(urls, info, result))
    await Promise.all(jobs)

    fs.writeFileSync(process.argv[3], result.join('\n'), { encoding: 'utf-8' })
}


async function worker(urls, info, result) {
    while (urls.length) {
        const popedUrl = urls.pop();
        const response = await request.get(popedUrl, { timeout: 10000, headers: { 'User-Agent': 'LocomotiveBot/1.0' } })
            .then(body => ({ url: popedUrl, document: HTMLParser.parse(body), status: 200 }))
            .catch(err => ({ url: popedUrl, document: null, status: err.statusCode }))

        const { url, document, status } = response
        if (status !== 200) {
            result.push(`${status}\t${url}`)
            console.log(info.index++, '/', info.length, url.trim(), 'parsed', status)
            continue
        }
        const items = document.querySelectorAll(process.argv[4])
        if(!items.length) {
            result.push(`NO_DATA\t${url}`)
        }
        for (const item of items) {
            if (process.argv.length == 5) {
                result.push(`${item.text.trim()}\t${url}`)
            } else {
                result.push(`${item.attributes[process.argv[5]].trim()}\t${url}`)
            }
        }
        console.log(info.index++, '/', info.length, url.trim(), 'parsed', status)
    }
}

