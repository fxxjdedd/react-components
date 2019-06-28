import { useState, useRef } from 'react'

export function useReset(): [number, () => void] {
  const [uid, setUID] = useState(0)
  function reset() {
    setUID(uid + 1)
  }
  return [uid, reset]
}

export function useInitialValue(value: any): any {
  const initialValue = useRef(value)
  return initialValue.current
}
