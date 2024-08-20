'use client'

import { useEffect, useMemo, useState } from 'react'
import { Relay } from 'nostr-tools/relay'

export default function Home() {
  const relay = useMemo(
    () => new Relay('wss://relay.sc24.steffen-roertgen.de'),
    [],
  )
  const [connected, setConnected] = useState(false)
  const sub = useMemo(() => {
    if (connected) {
      const sub = relay.subscribe([{ kinds: [30142] }], {})

      sub.onevent = (event) => {
        console.log(event)
      }

      return sub
    } else {
      return null
    }
  }, [connected, relay])

  useEffect(() => {
    void connectRelay()

    async function connectRelay() {
      await relay.connect()
      setConnected(relay.connected)
    }
  }, [relay])

  return (
    <main>
      <h1>IsConnected</h1>
      {connected}
    </main>
  )
}
