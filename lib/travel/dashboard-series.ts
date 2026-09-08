export function dashboardMonths(now = new Date()) {
  const key = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit' }).format(now);
  const [year,month] = key.split('-').map(Number);
  return Array.from({length:6},(_,i)=>{
    const date=new Date(Date.UTC(year,month-6+i,1));
    return date.toISOString().slice(0,7);
  });
}
export function fillDashboardSeries(months:string[],rows:{month:string;amount:number|string}[]){
  const values=new Map(rows.map(row=>[row.month,Number(row.amount)]));
  return months.map(month=>({month,value:Math.max(0,values.get(month)||0)}));
}
export function chartPercent(value:number,total:number){return total>0?Math.min(100,Math.max(0,value/total*100)):0;}
