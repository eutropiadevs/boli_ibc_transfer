export const getPriceChartURL = (range) => {
  return `https://api-osmosis.imperator.co/tokens/v2/historical/CMDX/chart?tf=${range}`;
};

// tf = range 60- 1H, 1440 - 1D, 10080 - 1W,  43800 - 1M
export const CAMPAIGN_URL = "https://test-campaign.comdex.one";

export const API_URL = process.env.REACT_APP_API_URL;
export const COINGECKO_API_URL = "https://api.coingecko.com/api/v3/simple/price?ids=comdex,cosmos,osmosis,axlusdc,axlweth&vs_currencies=usd";
export const HARBOR_AIRDROP_API_URL = process.env.REACT_APP_HARBOR_AIRDROP_API_URL;