import { describe,it,expect } from 'vitest';
import { dashboardMonths,fillDashboardSeries,chartPercent } from './dashboard-series';
describe('dashboard chart series',()=>{
  it('uses Jakarta month boundaries and crosses years',()=>expect(dashboardMonths(new Date('2026-12-31T18:00:00Z'))).toEqual(['2026-08','2026-09','2026-10','2026-11','2026-12','2027-01']));
  it('fills missing months with zero, without invented activity',()=>expect(fillDashboardSeries(['2026-08','2026-09'],[{month:'2026-09',amount:'5000000'}])).toEqual([{month:'2026-08',value:0},{month:'2026-09',value:5000000}]));
  it('keeps empty and over-capacity charts finite',()=>{expect(chartPercent(0,0)).toBe(0);expect(chartPercent(50,40)).toBe(100);});
});
