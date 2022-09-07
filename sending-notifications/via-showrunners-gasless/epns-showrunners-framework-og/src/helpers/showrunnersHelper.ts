import { Container } from 'typedi';


export const showrunnersHelper = {
  // Check if Private Key is valid
  getValidWallet: async function(showrunnerName, wallets) {
    const Cache: any = Container.get('cached');
    const cacheKeyName = this.getCacheKeyName(showrunnerName);

    const numberOfWallets = Object.keys(wallets).length;
    let selectedWalletID = await Cache.getCache(cacheKeyName);

    if (selectedWalletID) {
      // Cache found, increment it and see if it fits
      selectedWalletID = parseInt(selectedWalletID) + 1;

      if (selectedWalletID > numberOfWallets) {
        selectedWalletID = 1; // Round robin back
      }
    } else {
      selectedWalletID = 1;
    }

    const result = await Cache.setCache(cacheKeyName, selectedWalletID);

    return {
      numOfWallets: numberOfWallets,
      currentWalletID: selectedWalletID,
    };
  },
  getCacheKeyName: function(showrunnerName) {
    return `${showrunnerName}WalletsMetaCacheKey`;
  },
};

export default showrunnersHelper;
