#!/root/.nvm/versions/node/v16.13.0/bin/node
import 'env.js'
import fss from 'fs' // DO NOT change to fs/promises because 'The "path" argument must be of type string or an instance of Buffer or URL. Received type number (0)'
import fs from 'fs/promises'
import fetch from 'node-fetch'
import anekdots from './anekdots.js'

const __dirname = new URL('.', import.meta.url).pathname

console.log('Content-type:text/plain')
console.log('')

async function processBody() {
  const stdinBuffer = fss.readFileSync(process.stdin.fd)
  const stdin = stdinBuffer.toString()
  let body = {}
  try {
    body = JSON.parse(stdin)
  } catch(e) {
    return await fs.appendFile(`${__dirname}error.log`, `Error while parsing body: ${JSON.stringify(e, Object.getOwnPropertyNames(e))}\n`)
  }
  const token = process.env.TOKEN
  const inlineQuery = body.inline_query
  if(!inlineQuery) return
  await fetch(`https://api.telegram.org/bot${token}/answerInlineQuery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      inline_query_id: inlineQuery.id,
      results: anekdots.map((text, i) => ({
        type: 'article',
        id: i,
        title: text.substring(0, 35) + '…',
        description: text,
        input_message_content: {
          message_text: (inlineQuery.query ? inlineQuery.query.trim() + ' ' : '') + text
        }
      }))
    })
  })
}

await processBody()
console.log('OK')
process.exit(0)
