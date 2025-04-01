"use client";

import styles from "./page.module.css";
import { useState, useCallback } from "react";
import { getQuickJS } from "quickjs-emscripten"; 

async function evalQuickJSTimes(code: string, iterations = 1) {
  const QuickJS = await getQuickJS();
  const vm = QuickJS.newContext();
  let result: any;

  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    result = vm.evalCode(code);

    if (result.error) {
      const error = vm.dump(result.error);
      result.error.dispose();
      throw new Error(vm.dump(error));
    }
  }
  const elapsedTime = performance.now() - start;
  const returnValue = vm.dump(result.value);
  result.value.dispose();
  vm.dispose();
  return { result: returnValue, elapsedTime: elapsedTime.toString() };
}

function evalTimes(code: string, iterations = 1) {
  let result: string | undefined;
  for (let i = 0; i < iterations; i++) {
    result = eval(code);
  }
  return result;
}

async function evalBoth(code: string, iterations = 1) {
    if (typeof code !== "string" || typeof iterations !== "number") {
      throw new Error('Invalid input')
    }

    const startEvalResult = performance.now();
    const evalResult = evalTimes(code, iterations);
    const evalResultTime = (
      performance.now() - startEvalResult
    ).toString();

    const startEvalQuickJSResult = performance.now();
    const { result: evalQuickJSResult, elapsedTime } = await evalQuickJSTimes(
      code,
      iterations
    );
    const evalQuickJSResultTime = (
      performance.now() - startEvalQuickJSResult
    ).toString();

    return {
      evalResult,
      evalResultTime,
      evalQuickJSResult,
      evalQuickJSResultTime,
      evalQuickJSResultTimeLoopOnly: elapsedTime,
    };
}

export default function Home() {
  const [code, setCode] = useState("Math.sqrt(100)");
  const [iterations, setIterations] = useState(1_000_000);
  const [result, setResult] = useState<any>();

  const evalCode = useCallback(async (code: string, iterations: number) => {
      const result = await evalBoth(code, iterations)
      setResult(result);
  }, [setResult]);

  return (
    <div className={styles.page}>
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
          <button type="submit" >Run code</button>
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
                    Native <code>eval</code>
                  </td>
                  <td>{result.evalResult}</td>
                  <td>{result.evalResultTime}</td>
                </tr>
                <tr>
                  <td>
                    QuickJS <code>evalCode</code>
                  </td>
                  <td>{result.evalQuickJSResult}</td>
                  <td>{result.evalQuickJSResultTime}</td>
                </tr>
              </tbody>
            </table>
          )}
        </form>
      </main>
    </div>
  );
}
