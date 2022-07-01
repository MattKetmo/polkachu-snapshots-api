const express = require('express')
const cheerio = require('cheerio')

const app = express()
const port = 3000

app.get('/', async (req, res) => {
  res.send('Polkachu Snapshots API')
})

app.get('/:chain.json', async (req, res) => {
  const response = await fetch("https://polkachu.com/tendermint_snapshots/" + req.params['chain'])
  const html = await response.text()
  const $ = cheerio.load(html)

  const data = $('table tbody tr').toArray().map((tr) => {
    const cells = $(tr).find('td')
    const height = Number($(cells[1]).text().trim())
    const size = $(cells[2]).text().trim()
    const date = $(cells[3]).text().trim()
    const timestamp = parseTimeAgo(date)
    const url = $(cells[4]).find('a').attr('href')

    return {
      height,
      size,
      date,
      timestamp,
      url,
    }
  })

  res.json(data)
})

app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})

function parseTimeAgo(timeAgo) {
  const re = /(\d+) (\w+) ago/
  const match = re.exec(timeAgo)

  let mul = 0

  switch (match[2]) {
    case "day":
    case "days":
      mul = 24*3600
      break;

    case "hour":
    case "hours":
      mul = 3600
      break;

    case "minute":
    case "minutes":
      mul = 60
      break;

    case "second":
    case "seconds":
      mul = 1
      break;
  }

  return Math.floor(Date.now()/1000) - Number(match[1]) * mul
}
