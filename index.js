const fs = require('fs')
const request = require('request-promise')
const HTMLParser = require('node-html-parser');

if (process.argv.length > 3) {
    parse();
}

async function parse() {
    const urls = fs.readFileSync(process.argv[2]).toString().split('\n')
    const result = []
    for (const url of urls) {
        const response = await request.get(url.trim(), {
            headers: {
                'User-Agent': 'LocomotiveBot/1.0'
            }
        }).then(body => HTMLParser.parse(body))

        const items = response.querySelectorAll(process.argv[3])
        for (const item of items) {
            if (process.argv.length == 4) {
                result.push(`${item.text.trim()};${url}`)
            } else {
                result.push(`${item.attributes[process.argv[4]].trim()};${url}`)
            }
        }
        console.log(url, 'parsed')
    }
    fs.writeFileSync('result.csv', result.join('\n'), { encoding: 'utf-8' })
}