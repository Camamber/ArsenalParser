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
    for (const url of urls) {
        const response = await request.get(url.trim(), {
            headers: {
                'User-Agent': 'LocomotiveBot/1.0'
            }
        }).then(body => HTMLParser.parse(body))

        const items = response.querySelectorAll(process.argv[4])
        for (const item of items) {
            if (process.argv.length == 5) {
                result.push(`${item.text.trim()}\t${url}`)
            } else {
                result.push(`${item.attributes[process.argv[5]].trim()}\t${url}`)
            }
        }
        console.log(++index, '/', urls.length, url, 'parsed')
    }
    fs.writeFileSync(process.argv[3], result.join('\n'), { encoding: 'utf-8' })
}