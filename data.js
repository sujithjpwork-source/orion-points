export const rewards=[
 {id:'5',name:'$5 Discount',value:'$5',type:'DISCOUNT VOUCHER',cost:500,description:'Take $5 off a new account, reset or retry at checkout.',detail:'$5 off · 90-day voucher',icon:'tag',accent:'silver'},
 {id:'10',name:'$10 Discount',value:'$10',type:'DISCOUNT VOUCHER',cost:1000,description:'Take $10 off a new account, reset or retry at checkout.',detail:'$10 off · 90-day voucher',icon:'tag',accent:'blue'},
 {id:'25',name:'$25 Discount',value:'$25',type:'DISCOUNT VOUCHER',cost:2500,description:'Take $25 off a new account, reset or retry at checkout.',detail:'$25 off · 90-day voucher',icon:'tag',accent:'violet'},
 {id:'100',name:'$100 Discount',value:'$100',type:'DISCOUNT VOUCHER',cost:10000,description:'Take $100 off a new account, reset or retry at checkout.',detail:'$100 off · 90-day voucher',icon:'tag',accent:'gold'},
 {id:'weekly',name:'Weekly payouts',value:'Weekly',type:'PAYOUT PERK',cost:1500,variable:true,description:'Move one funded or evaluation account from bi-weekly to weekly...',detail:'Priced by account size · 90-day voucher',icon:'calendar',accent:'blue'},
 {id:'express',name:'Express payout',value:'24 hours',type:'PAYOUT PERK',cost:1500,variable:true,description:'Your next payout processed within 24 hours instead of the standard...',detail:'Priced by account size · 90-day voucher',icon:'bolt',accent:'violet'},
 {id:'labs',name:'Early access to Orion Labs',value:'Orion Labs',type:'EXCLUSIVE ACCESS',cost:2500,description:'Test new dashboard features and trading tools before public release.',detail:'Exclusive · 90-day voucher',icon:'flask',accent:'silver'}
];
export const activities=[
 {name:'Account purchase — Orion Standard $100,000',ref:'Account #241120',date:'Sep 16, 2026',points:943,status:'Pending',expires:'Dec 15, 2026',icon:'cart'},
 {name:'Funded account issued — Orion Standard $100,000',ref:'Account #220687',date:'Sep 13, 2026',points:629,status:'Available',expires:'Dec 12, 2026',icon:'flag'},
 {name:'Points reversed — order refunded',ref:'Order ORD-10902',date:'Sep 8, 2026',points:-73,status:'Reversed',expires:'—',icon:'alert'},
 {name:'Account purchase — Orion Standard $5,000',ref:'Order ORD-10902',date:'Sep 5, 2026',points:73,status:'Reversed',expires:'—',icon:'cart'},
 {name:'Phase 1 passed — Orion Standard $100,000',ref:'Account #220687',date:'Aug 26, 2026',points:314,status:'Available',expires:'Nov 24, 2026',icon:'award'},
 {name:'Account purchase — Orion Standard $100,000',ref:'Account #220687',date:'Aug 16, 2026',points:943,status:'Available',expires:'Nov 14, 2026',icon:'cart'},
 {name:'Funded account issued — Orion Standard $100,000',ref:'Account #158984',date:'Aug 6, 2026',points:629,status:'Available',expires:'Nov 4, 2026',icon:'flag'},
 {name:'Phase 1 passed — Orion Standard $100,000',ref:'Account #158984',date:'Jul 29, 2026',points:314,status:'Expiring soon',expires:'Oct 27, 2026',icon:'award'},
 {name:'Account purchase — Orion Standard $100,000',ref:'Account #158984',date:'Jul 14, 2026',points:943,status:'Expiring soon',expires:'Oct 12, 2026',icon:'cart'},
 {name:'Orion Points introductory bonus',ref:'Launch promotion',date:'Jul 14, 2026',points:5000,status:'Expiring soon',expires:'Oct 12, 2026',icon:'gift'}
];
export const storeRules='Discount vouchers and perks, paid fully in Points and issued as 90-day codes. Vouchers count inside the 20% Points limit at checkout. Oldest Points are used first.';
export const loyaltyRule='Orion Points are a loyalty benefit, not money. They cannot be withdrawn, transferred or used to request a payout, and are reversed if a purchase is refunded.';
