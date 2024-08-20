'use client'

import * as t from 'io-ts'
import { useEffect, useState } from 'react'
import { Relay } from 'nostr-tools/relay'

enum License {
  CC0 = 'CC0',
  CC_BY = 'CC_BY',
  CC_BY_SA = 'CC_BY_SA',
  OTHER = 'OTHER',
}

const NostrEvent = t.type({
  kind: t.literal(30142),
  tags: t.array(t.tuple([t.string, t.string])),
})

const NostrResource = t.partial({
  image: t.string,
  name: t.string,
  license: t.string,
  author: t.string,
})

interface Resource {
  name?: string
  author?: string
  license?: License
  licenseUrl?: string
}

export default function Home() {
  const [resources, setResources] = useState<Resource[]>([])

  useEffect(() => {
    if (resources.length > 0) return

    void loadResources()

    async function loadResources() {
      const relay = new Relay('wss://relay.sc24.steffen-roertgen.de')
      let resources: Resource[] = []

      try {
        await relay.connect()

        const sub = relay.subscribe([{ kinds: [30142] }], {})

        sub.onevent = (event) => {
          if (!NostrEvent.is(event)) return

          const basicResource = Object.fromEntries(event.tags)

          if (!NostrResource.is(basicResource)) return

          resources.push({
            ...basicResource,
            license: basicResource.license
              ? getLicense(basicResource.license)
              : License.OTHER,
            licenseUrl: basicResource.license,
          })
        }

        sub.oneose = () => {
          setResources(resources)
        }
      } catch (error) {
        console.error(error)
      }
    }
  }, [resources])

  return (
    <main>
      <h1>Resources</h1>
      <ul>
        {resources.map((resource, index) => (
          <li key={index}>
            <img src={resource.image} alt={resource.name} />
            <p>{resource.name}</p>
            <p>{resource.author}</p>
            <p>{resource.license}</p>
            <a href={resource.licenseUrl}>License</a>
          </li>
        ))}
      </ul>
    </main>
  )
}

function getLicense(license: string): License {
  const lowerCaseLicense = license.toLowerCase()

  if (
    lowerCaseLicense.includes('cc0') ||
    lowerCaseLicense.includes('publicdomain')
  ) {
    return License.CC0
  } else if (lowerCaseLicense.includes('by-sa')) {
    return License.CC_BY_SA
  } else if (lowerCaseLicense.includes('cc-by')) {
    return License.CC_BY
  } else {
    return License.OTHER
  }
}
