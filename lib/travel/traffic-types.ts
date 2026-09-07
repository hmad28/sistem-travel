export type TrafficSnapshot = {
  liveVisitors:number; visitorsToday:number; visitors7Days:number; visitors30Days:number;
  pageViewsToday:number; updatedAt:string;
  history:{date:string;visitors:number}[];
  popularPages:{path:string;views:number}[];
  devices:{device:string;visitors:number}[];
  recentViews:{id:string;path:string;device:string;lastSeenAt:string;referrer:string}[];
};
