const API_KEY = "48de590e35424ff2ffd093e88bc25b8c6865e3ff8b7e3229cd78451b1c368503";

const tickers = new Map();

export const loadTickers = tickers => {
    fetch(
        `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${tickers.join(",")}&tsyms=USD&api_key=${API_KEY} `
    ).then(r => r.json())
        .then(rowData => Object.fromEntries(
            Object.entries(rowData).map(([key, value]) => [key, value.USD])
        ))

};

export const subscribeToTicker = (ticker, callback) => {

    const subscribes = tickers.get(ticker) || [];
    tickers.set(ticker, [...subscribes, callback])

}

export const unsubscribeToTicker = (ticker, callback) => {
    const subscribes = tickers.get(ticker) || [];
    tickers.set(ticker, subscribes.filter(f => f !== callback))
}