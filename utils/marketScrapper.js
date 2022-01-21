const gplay = require('google-play-scraper');
const countriesList = require('countries-list');

const getGMarketCategory = async () => {
    return await gplay.categories();
};

const productsList = async ({category, country, collection}) => {
    return await gplay.list({
        category: category ? category : '',
        country: country ? country : 'us',
        collection: collection ? collection : gplay.collection.TOP_FREE
    });
};

const getAppData = async (appId) => {
    return await gplay.app({appId});
};

module.exports = ({
    getProducts: (options) => productsList(options),
    getGMarketCategory: async () => await getGMarketCategory(),
    countries: countriesList.countries,
    collections: gplay.collection,
    getAppData: async (appId) => await getAppData(appId)
});