import { AdData } from '../components/common/AdBanner';

// Sample ads data - Replace with your actual ad management system
export const SAMPLE_ADS: AdData[] = [
  // Banner Ads (Long horizontal banners)
  // {
  //   id: 'banner_1',
  //   imageUrl: 'https://www.webfx.com/wp-content/uploads/2023/11/brita-banner-ad-example.png',
  //   link: 'https://www.example.com/product1',
  //   size: 'banner',
  //   title: 'Brita Water Filter',
  // },
  // {
  //   id: 'banner_2',
  //   imageUrl: 'https://www.webfx.com/wp-content/uploads/2010/06/cera-ve-banner-ad.png',
  //   size: 'banner',
  //   title: 'Brita Water Filter',
  // },


  // Full Page Ads

  // {
  //   id: 'fullpage_1',
  //   imageUrl: 'https://static-cse.canva.com/blob/2193110/Febreeze_magazinead.jpg',
  //   link: 'https://www.example.com/fullpage1',
  //   size: 'fullpage',
  //   title: 'Febreze Magazine Ad',
  // },
  // {
  //   id: 'fullpage_2',
  //   imageUrl: 'https://www.webfx.com/wp-content/uploads/2010/06/up-and-up-banner-ad.png',
  //   size: 'fullpage',
  //   title: 'Febreze Magazine Ad',
  // },

  // Half Page Ads
  // {
  //   id: 'halfpage_1',
  //   imageUrl: 'https://static-cse.canva.com/blob/2193110/Febreeze_magazinead.jpg',
  //   link: 'https://www.example.com/halfpage1',
  //   size: 'halfpage',
  //   title: 'Health Products',
  // },
  // {
  //   id: 'halfpage_2',
  //   imageUrl: 'https://static-cse.canva.com/blob/2193110/Febreeze_magazinead.jpg',
  //   link: 'https://www.example.com/halfpage1',
  //   size: 'halfpage',
  //   title: 'Health Products',
  // },
];

// Ad placement configuration
export const AD_PLACEMENTS = {
  PROFILE_TOP: 'profile_top',
  PROFILE_MIDDLE: 'profile_middle',
  PROFILE_BOTTOM: 'profile_bottom',
  HOME_TOP: 'home_top',
  BLOG_LIST: 'blog_list',
  SETTINGS: 'settings',
};

// Function to get ads by placement and size
export const getAdsByPlacement = (
  placement: string,
  size: 'banner' | 'fullpage' | 'halfpage'
): AdData[] => {
  // In a real app, this would fetch from your backend/ad service
  // For now, return sample ads filtered by size
  return SAMPLE_ADS.filter(ad => ad.size === size);
};

// Function to track ad impressions (integrate with your analytics)
export const trackAdImpression = (adId: string, placement: string) => {
  console.log(`Ad Impression: ${adId} at ${placement}`);
  // Implement your analytics tracking here
};

// Function to track ad clicks
export const trackAdClick = (adId: string, placement: string) => {
  console.log(`Ad Click: ${adId} at ${placement}`);
  // Implement your analytics tracking here
};
