const API_KEY = "48de590e35424ff2ffd093e88bc25b8c6865e3ff8b7e3229cd78451b1c368503";

const tickersHandlers = new Map();
const socket = new WebSocket(
    `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

const AGGREGATE_INDEX = 5;

socket.addEventListener('message', e => {
    const messageContent = JSON.parse(e.data)
    if (messageContent.TYPE !== AGGREGATE_INDEX) {
        return
    }
})


export const loadTickers = () => {
    if (tickersHandlers.size === 0) { return; }


    fetch(
        `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[
            ...tickersHandlers.keys()
        ].join(",")}&tsyms=USD&api_key=${API_KEY} `
    )
        .then(r => r.json())
        .then(rowData => {
            const updatePrices = Object.fromEntries(
                Object.entries(rowData).map(([key, value]) => [key, value.USD])
            );


            Object.entries(updatePrices).forEach(([currency, newPrice]) => {
                const handlers = tickersHandlers.get(currency) ?? [];
                handlers.forEach(fn => fn(newPrice))
            });
        });

};

function subscribeToTickerOnWS(ticker) {
    const message = JSON.stringify({
        action: "SubAdd",
        subs: [`5~CCCAGG~${ticker}~USD`]

    });
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(message)
        return
    }
    socket.addEventListener('open', () => { socket.send(message) }, { once: true })
}

export const subscribeToTicker = (ticker, callback) => {

    const subscribes = tickersHandlers.get(ticker) || [];
    tickersHandlers.set(ticker, [...subscribes, callback])
    subscribeToTickerOnWS()
}

export const unsubscribeToTicker = (ticker, callback) => {
    const subscribes = tickersHandlers.get(ticker) || [];
    tickersHandlers.set(ticker, subscribes.filter(f => f !== callback))
}

setInterval(loadTickers, 5000);

window.tickersHandlers = tickersHandlers