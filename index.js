const fs = require('fs')
const request = require('request-promise')
const HTMLParser = require('node-html-parser');

if (process.argv.length > 3) {
    parse();
}

async function parse() {
    const urls = fs.readFileSync(process.argv[2]).toString().split('\n')
    const result = []
    let index = 0;
    for (let i = 0; i < urls.length; i += 5) {
        const chunk = urls.slice(i, i + 5).map(url => url.trim());

        const requests = chunk.map(
            url => request.get(url, { headers: { 'User-Agent': 'LocomotiveBot/1.0' } })
                .then(body => {
                    return { url, document: HTMLParser.parse(body) }
                })
                .catch(err => {
                    console.log(url, err)
                    return null
                })
        )
        const responses = (await Promise.all(requests)).filter(item => !!item)

        for (const { url, document } of responses) {
            const items = document.querySelectorAll(process.argv[4])
            for (const item of items) {
                if (process.argv.length == 5) {
                    result.push(`${item.text.trim()}\t${url}`)
                } else {
                    result.push(`${item.attributes[process.argv[5]].trim()}\t${url}`)
                }
            }
            console.log(++index, '/', urls.length, url.trim(), 'parsed')
        }
    }

    fs.writeFileSync(process.argv[3], result.join('\n'), { encoding: 'utf-8' })
}

