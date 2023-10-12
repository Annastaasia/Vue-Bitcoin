const API_KEY = "48de590e35424ff2ffd093e88bc25b8c6865e3ff8b7e3229cd78451b1c368503"

export const loadTicker = tickerName => {
    fetch(
        `https://min-api.cryptocompare.com/data/price?fsym=${tickerName}&tsyms=USD&api_key=${API_KEY}`
    ).then(r => r.json())

}