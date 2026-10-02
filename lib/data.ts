// Sample data. Replace with Supabase queries once the schema is applied.
export const PHASES = ["Quotation","Booked","Shoot","Selection","Editing","Albums","Delivered"] as const;
export type Payment = { date: string; amount: number };
export type Slot = { event: string; role: string; status: "assigned" | "pending" | "agency"; person?: string; agency?: string };
export type Booking = { id:string; couple:string; phone:string; status:string; phase:number; total:number;
  events:{name:string; date:string; venue:string}[]; slots: Slot[]; payments:Payment[] };
export const paidOf = (b: Booking) => b.payments.reduce((s, p) => s + p.amount, 0);
export const bookings: Booking[] = [
 { id:"RBA-2026-001", couple:"Sara & Usman", phone:"923001234567", status:"Confirmed", phase:1, total:105000,
   events:[{name:"Mehndi",date:"2026-10-12",venue:"Pearl Marquee"},{name:"Baraat",date:"2026-10-13",venue:"Royal Palm"},{name:"Walima",date:"2026-10-14",venue:"Avari Lahore"}],
   slots:[
    {event:"Mehndi",role:"Photographer",status:"assigned",person:"Ali"},{event:"Mehndi",role:"Videographer",status:"assigned",person:"Ahmed"},
    {event:"Baraat",role:"Photographer 1",status:"agency",agency:"Studio Nine"},{event:"Baraat",role:"Photographer 2",status:"pending"},
    {event:"Baraat",role:"Videographer",status:"assigned",person:"Ahmed"},{event:"Baraat",role:"Drone operator",status:"pending"},
    {event:"Walima",role:"Photographer",status:"assigned",person:"Ali"},{event:"Walima",role:"Videographer",status:"pending"}],
   payments:[{date:"2026-10-01",amount:52500}] },
 { id:"RBA-2026-002", couple:"Hamza & Noor", phone:"923007654321", status:"Post-production", phase:4, total:180000,
   events:[{name:"Baraat",date:"2026-09-20",venue:"Lake City Hall"}],
   slots:[{event:"Baraat",role:"Photographer",status:"assigned",person:"Usman"},{event:"Baraat",role:"Videographer",status:"assigned",person:"Bilal"}],
   payments:[{date:"2026-08-10",amount:90000},{date:"2026-09-20",amount:45000},{date:"2026-09-28",amount:45000}] },
];
