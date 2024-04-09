
const http = require("http");
const fs = require("fs");
const requests = require("request");

const homeFile = fs.readFileSync("home.html", "utf-8");

const replaceVal = (tempval, orgVal) => {
    let temperature = tempval.replace("{%tempval%}", (orgVal.main.temp - 273.15).toFixed(2));
    temperature = temperature.replace("{%%tempmin}", (orgVal.main.temp_min - 273.15).toFixed(2));
    temperature = temperature.replace("{%tempmax%}", (orgVal.main.temp_max - 273.15).toFixed(2));
    temperature = temperature.replace("{%location%}", orgVal.name);
    temperature = temperature.replace("{%country%}", orgVal.sys.country);
    temperature = temperature.replace("{%tempstatus%}", orgVal.weather[0].main);

    return temperature;
}

const server = http.createServer((req, res) => {
    if (req.url == "/") {
        requests("https://api.openweathermap.org/data/2.5/weather?q=bangalore&appid=dd04268601c8ca0f81a6b21277402d5e")
            .on("data", (chunk) => {
                const objdata = JSON.parse(chunk);
                const arrData = [objdata];
                const realTimeData = arrData.map((val) =>
                    replaceVal(homeFile, val)).join("");
                res.writeHead(200, { "Content-type": "text/html" });
                res.write(realTimeData);
                res.end();
            })
            .on("error", (err) => {
                console.error('Error:', err);
                res.writeHead(500, { "Content-type": "text/plain" });
                res.write("Internal Server Error");
                res.end();
            });
    } else if (req.url.startsWith("/weather")) {
        const urlParams = new URLSearchParams(req.url.split('?')[1]);
        const city = urlParams.get('city');
        if (city) {
            requests(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=dd04268601c8ca0f81a6b21277402d5e`)
                .on("data", (chunk) => {
                    const objdata = JSON.parse(chunk);
                    const arrData = [objdata];
                    const realTimeData = arrData.map((val) =>
                        replaceVal(homeFile, val)).join("");
                    res.writeHead(200, { "Content-type": "text/html" });
                    res.write(realTimeData);
                    res.end();
                })
                .on("error", (err) => {
                    console.error('Error:', err);
                    res.writeHead(500, { "Content-type": "text/plain" });
                    res.write("Internal Server Error");
                    res.end();
                });
        } else {
            res.writeHead(400, { "Content-type": "text/plain" });
            res.write("Bad Request: City parameter is missing");
            res.end();
        }
    } else {
        res.writeHead(404, { "Content-type": "text/plain" });
        res.write("Not Found");
        res.end();
    }
});

server.listen(3000, (err) => {
    if (err) throw err;
    console.log('app is running');
});
