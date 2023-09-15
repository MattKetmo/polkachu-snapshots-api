const cheerio = require('cheerio')

export default async function handler(req, res) {
  const { query } = req
  const { chain,  testnet = '0' } = query

  let url = `https://polkachu.com/tendermint_snapshots/${chain}`
  if (testnet === '1') {
    url = `https://polkachu.com/testnets/${chain}/snapshots`
  }

  const response = await fetch(url)

  if (!response.ok) {
    res.status(response.status)
    res.json({
      error: "Unable to fetch origin",
      origin: url,
      status: response.status,
    })
    return
  }

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
}

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
