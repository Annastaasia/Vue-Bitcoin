const API_KEY = "48de590e35424ff2ffd093e88bc25b8c6865e3ff8b7e3229cd78451b1c368503";

const tickersHandlers = new Map();
const socket = new WebSocket(
    `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

const AGGREGATE_INDEX = "5";

socket.addEventListener('message', e => {
    const { TYPE: type, FROMSYMBOL: currency, PRICE: newPrice } = JSON.parse(e.data)
    if (type !== AGGREGATE_INDEX || newPrice === undefined) {
        return
    }
    // debugger;
    const handlers = tickersHandlers.get(currency) ?? [];
    handlers.forEach(fn => fn(newPrice))
})

function sendToWebSocket(message) {
    const stringifiedMessage = JSON.stringify(message);
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(stringifiedMessage)
        return
    }
    socket.addEventListener('open', () => { socket.send(stringifiedMessage) }, { once: true })
}

function subscribeToTickerOnWS(ticker) {
    sendToWebSocket({
        action: "SubAdd",
        subs: [`5~CCCAGG~${ticker}~USD`]
    });
}

function unsubscribeFromTickerOnWS(ticker) {
    sendToWebSocket({
        action: "SubRemove",
        subs: [`5~CCCAGG~${ticker}~USD`]
    });
}

export const subscribeToTicker = (ticker, callback) => {
    const subscribes = tickersHandlers.get(ticker) || [];
    tickersHandlers.set(ticker, [...subscribes, callback])
    subscribeToTickerOnWS()
}

export const unsubscribeToTicker = ticker => {
    tickersHandlers.delete(ticker);
    unsubscribeFromTickerOnWS(ticker);

}

// window.tickersHandlers = tickersHandlers


// export const loadTickers = () => {
//     if (tickersHandlers.size === 0) { return; }

//     fetch(
//         `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[
//             ...tickersHandlers.keys()
//         ].join(",")}&tsyms=USD&api_key=${API_KEY} `
//     )
//         .then(r => r.json())
//         .then(rowData => {
//             const updatePrices = Object.fromEntries(
//                 Object.entries(rowData).map(([key, value]) => [key, value.USD])
//             );

//             Object.entries(updatePrices).forEach(([currency, newPrice]) => {
//                 const handlers = tickersHandlers.get(currency) ?? [];
//                 handlers.forEach(fn => fn(newPrice))
//             });
//         });
// };


// setInterval(loadTickers, 5000);