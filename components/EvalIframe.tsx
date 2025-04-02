// This iframe receives messages from the main window and executes the code in the payload
export function EvalIframe() {
  return (
    <iframe
      id="eval-iframe"
      style={{ display: "none" }}
      srcDoc={`
        <!DOCTYPE html>
        <html>
        <head>
          <script type="text/javascript">
            function evalTimes(code, bigAppTemplate, iterations = 1) {
              let result;
              for (let i = 0; i < iterations; i++) {
                // Uncomment this next line to test parsing a big object on every iteration. Only enable this for
                // iterations below 1000, otherwise the app freezes.
                // JSON.parse(bigAppTemplate)
                result = eval(code);
              }
              return result;
            }

            window.addEventListener("message", (event) => {
              if (event.data.startsWith("start evalIframe:")) {
                const params = JSON.parse(event.data.slice("start evalIframe: ".length));
                const result = evalTimes(params.code, params.bigAppTemplate, params.iterations);
                event.source.postMessage(
                  'finish evalIframe: ' + JSON.stringify({ result })
                );
              }
          });
          </script>
        </head>
        </html>
  `}
    />
  );
}
