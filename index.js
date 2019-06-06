var http = require("http"),
  https = require("https");

const virtuals = {
  "a.example.com": {
    hostname: "account-d.docusign.com",
    port: 443
  },
  "b.example.com": { 
    hostname: "demo.docusign.net",
    port: 443
  }
}

http
  .createServer((req, res) => {
    console.log("Request Listener");
    // console.log(["method", "headers", "url"].map(x => req[x]));
    const {hostname, port} = virtuals[ req.headers.host.split(':')[0]]
    // console.log( hostname, port )

    // method: OPTIONS
    // 'access-control-request-method': 'GET'
    // origin: 'http://localhost:3000',
    // 'access-control-request-headers': 'authorization'
    if (req.method === "OPTIONS") {
      res.setHeader("access-control-allow-origin", req.headers.origin);
      res.setHeader("access-control-allow-methods", "POST, GET, OPTIONS");
      res.setHeader(
        "access-control-allow-headers",
        req.headers["access-control-request-headers"]
      );
      res.setHeader("access-control-max-age", 86400);
      res.end();
    } else {
      const options = {
        hostname,
        port,
        path: req.url,
        method: req.method,
        headers: req.headers,
        rejectUnauthorized: false
      };

      const request = https.request(options, response => {
        console.log(`STATUS: ${response.statusCode}`);
        // console.log("HEADERS: ", response.headers);
        let data = "";
        response.on("data", d => {
          data += d;
        });
        response.on("end", () => {
          console.log("data", JSON.parse(data));
          res.setHeader("access-control-allow-origin", req.headers.origin);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(data);
        });
      });

      request.on("error", e => {
        console.error(`problem with request: ${e.message}`);
      });

      request.end();
    }

  })
  .listen(8000);

