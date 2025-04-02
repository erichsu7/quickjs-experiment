"use client";

import styles from "./page.module.css";
import { useState, useCallback, useEffect, useContext } from "react";
import { evalAll } from "../../utils/evalUtils";
import { EvalIframe } from "../../components/EvalIframe";
import { IframeEvalContext } from "../../contexts/IframeEvalContext";
import bigAppTemplate from '../../public/big_app_template.json'

// sends a message to the iframe to trigger its eval
function evalIframe(code: string, setIframeEvalStart: (startTime: number) => void, iterations = 1) {
  setIframeEvalStart(performance.now())
  const params = { code, iterations };
  // uncomment this next line to test serialization of a large object in the iframe
  // const params = { code, iterations, bigAppTemplate: JSON.stringify(bigAppTemplate) };
  document
    .getElementById("eval-iframe")!
    .contentWindow.postMessage(`start evalIframe: ${JSON.stringify(params)}`);
}

function App() {
  const [code, setCode] = useState("Math.sqrt(100)");
  const [iterations, setIterations] = useState(1_000_000);
  const [result, setResult] = useState<any>();

  const {
    result: iframeResult,
    setResult: setIframeResult,
    startTime: iframeStartTime,
    setStartTime: setIframeStartTime,
    elapsedTime: iframeElapsedTime,
    setElapsedTime: setIframeElapsedTime,
  } = useContext(IframeEvalContext)


  useEffect(() => {
    const handler = (event: MessageEvent<any>) => {
      if (
        typeof event.data === "string" &&
        event.data.startsWith("finish evalIframe:")
      ) {
        const result = JSON.parse(
          event.data.slice("finish evalIframe: ".length)
        );
        setIframeResult(result.result);
        setIframeElapsedTime(performance.now() - iframeStartTime!);
      }
    };

    window.addEventListener("message", handler);
    return () => {
      window.removeEventListener("message", handler);
    };
  }, [setIframeResult, iframeStartTime, setIframeElapsedTime]);

  const evalCode = useCallback(
    async (code: string, iterations: number) => {
      const result = await evalAll(code, iterations);
      setResult(result);
      evalIframe(code, setIframeStartTime, iterations);
    },
    [setResult, setIframeStartTime]
  );

  return (
    <div className={styles.page}>
      <EvalIframe />
      <main className={styles.main}>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await evalCode(code, iterations);
          }}
        >
          <div>
            <label htmlFor="code">Code</label>
            <br />
            <input
              name="code"
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="code">Iterations</label>
            <br />
            <input
              name="iterations"
              id="iterations"
              type="number"
              value={iterations}
              onChange={(e) => setIterations(parseInt(e.target.value))}
            />
          </div>
          <button type="submit">Run code</button>
          {result && (
            <table>
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Result</th>
                  <th>Elapsed time (ms)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    QuickJS <code>evalCode</code>
                  </td>
                  <td>{result.evalQuickJSResult}</td>
                  <td>{result.evalQuickJSResultTime}</td>
                </tr>
                <tr>
                  <td>
                    Native <code>eval</code>
                  </td>
                  <td>{result.evalResult}</td>
                  <td>{result.evalResultTime}</td>
                </tr>
                <tr>
                  <td>
                    iframe <code>eval</code>
                  </td>
                  <td>{iframeResult}</td>
                  <td>{iframeElapsedTime}</td>
                </tr>
              </tbody>
            </table>
          )}
        </form>
      </main>
    </div>
  );
}

export default function AppContainer() {
  const [result, setResult] = useState("");
  const [startTime, setStartTime] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0);

  return (
    <IframeEvalContext.Provider
      value={{
        result,
        setResult,
        startTime,
        setStartTime,
        elapsedTime,
        setElapsedTime,
      }}
    >
      <App />
    </IframeEvalContext.Provider>
  );
}
