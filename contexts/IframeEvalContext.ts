import { createContext } from "react";

interface IframeEvalContextValue {
    result: string | undefined
    setResult: (result: string) => void
    startTime: number | undefined,
    setStartTime: (startTime: number) => void
    elapsedTime: number | undefined
    setElapsedTime: (elapsedTime: number) => void
}

// This context keeps track of the execution time in the iframe
export const IframeEvalContext = createContext<IframeEvalContextValue>({
    result: undefined,
    setResult: () => {},
    startTime: undefined,
    setStartTime: () => {},
    elapsedTime: undefined,
    setElapsedTime: () => {},
})