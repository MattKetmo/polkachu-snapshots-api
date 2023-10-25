import express, { Request, Response, NextFunction } from "express"
import { XMLParser } from "fast-xml-parser"

const routes = express.Router()

routes.get("/", async (req: Request, res: Response, next: NextFunction) => {
  return res.status(200).json({})
})

function getBaseUrl(network: string): string {
  return network === "testnet" ?
    "https://snapshots.polkachu.com/testnet-snapshots/" :
    "https://snapshots.polkachu.com/snapshots/"
}

async function getSnapshot(network: string, chain?: string): Promise<any> {
  const baseUrl = getBaseUrl(network)

  const resp = await fetch(baseUrl)
  const data = await resp.text()

  const parser = new XMLParser()
  const result = parser.parse(data)

  const keyRegex = /^\w+\/(\w+)_(\d+)\.tar\.lz4$/

  return result.ListBucketResult?.Contents?.map((item: any) => {
    const key = item.Key ?? ""
    const matches = key.match(keyRegex)

    const chain = matches?.length > 1 ? matches[1] : ""
    const height = matches?.length > 2 ? matches[2] : ""
    const date = new Date(item.LastModified)

    if (!height) {
      return null
    }

    return {
      chain,
      height,
      url: baseUrl + item.Key,
      timestamp: Math.round(date.getTime() / 1000),
    }
  }).filter((item: any) => chain ? item?.chain === chain : item !== null)
}

routes.get("/:network", async (req: Request, res: Response, next: NextFunction) => {
  const { network } = req.params
  return res.status(200).json(await getSnapshot(network))
})

routes.get("/:network/:chain", async (req: Request, res: Response, next: NextFunction) => {
  const { network, chain } = req.params
  return res.status(200).json(await getSnapshot(network, chain))
})

export default routes
