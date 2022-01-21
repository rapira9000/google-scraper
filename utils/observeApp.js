const fs = require('fs');
const path = require('path');
const filePath = '../observeApp.json';
const observeJsonData = require(filePath);
const marketScrapper = require('./marketScrapper');

const isAppObserveAlreadyByUser = ({userId, appId}, observeJsonData) => {
    return !!observeJsonData.filter(item => item.userId === userId && item.appId === appId).length;
};

const addObserveApp = async ({userId, appId}) => {
    let observeJsonDataClone = [...observeJsonData];

    if (!isAppObserveAlreadyByUser({userId, appId}, observeJsonData)) {
        try {
            const appData = await marketScrapper.getAppData(appId);
            const appDataFilter = {
                userId,
                icon: appData.icon,
                url: appData.url,
                appId: appData.appId,
                scoreText: appData.scoreText,
                title: appData.title,

            };
            observeJsonDataClone.push(appDataFilter);

            await fs.writeFile(path.join(__dirname, filePath), JSON.stringify(observeJsonDataClone), 'utf8', (err) => {
                if (err) throw err;
                console.log(`added observed app with userId=${userId} appId=${appId}`);
            });
            return 'done'
        } catch (err) {
            if (err) throw err;
            return 'error';
        }

    }

    console.log(`app is observing with userId=${userId} appId=${appId}`);
    return `this app is observing, appId=${appId}`;
};

const removeObserveApp = async ({userId, appId}) => {
    let observeJsonDataClone = [...observeJsonData];
    if (isAppObserveAlreadyByUser({userId, appId}, observeJsonData)) {
        const filteredObserveJsonDataClone = observeJsonDataClone.filter(item => item.userId !== userId && item.appId !== appId);
        try {
            await fs.writeFile(path.join(__dirname, filePath), JSON.stringify(filteredObserveJsonDataClone), 'utf8', (err) => {
                if (err) throw err;
                console.log(`removed observed app with userId=${userId} appId=${appId}`);
            });
            return 'done'
        } catch (err) {
            if (err) throw err;
            return 'error';
        }
    }

    console.log(`app is removed from observing with userId=${userId} appId=${appId}`);
    return `this app is removed from observing, appId=${appId}`;
};

const checkProducts = ({products, userId}) => {
    return products.map(product => ({
        ...product,
        observing: isAppObserveAlreadyByUser({userId, appId: product.appId}, observeJsonData)
    }))
};

module.exports = ({
    addObserveApp: async (options) => await addObserveApp(options),
    removeObserveApp: async (options) => await removeObserveApp(options),
    checkProducts: (options) => checkProducts(options),
    getObserveApp: (userId) => observeJsonData.filter(item => item.userId === userId)
});