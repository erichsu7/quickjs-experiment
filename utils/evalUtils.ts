import { getQuickJS } from "quickjs-emscripten"; 

// runs code using quickjs
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

// runs code using native eval
function evalTimes(code: string, iterations = 1) {
  let result: string | undefined;
  for (let i = 0; i < iterations; i++) {
    result = eval(code);
  }
  return result;
}

export async function evalAll(code: string, iterations = 1) {
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
      // this measures the time spent running eval in the iframe, excluding the transfer of code + data from the main
      // window to the iframe via postMessage
      evalQuickJSResultTimeLoopOnly: elapsedTime,
    };
}
