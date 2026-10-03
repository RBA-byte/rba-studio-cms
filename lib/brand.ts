export const BRAND = {
  name: "RBA Films and Photography",
  tagline: "Wedding Films & Photography",
  services: "Weddings",
  address: "27-A, Hadayatullah Block, Mustafa Town, Lahore (54000)",
  cell: "+92 335 6726627",
  email: "refractionsbyammar@gmail.com",
};
export const todayPK = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Karachi" });
export const longDate = (d?: string) => new Date(d ?? todayPK()).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" });
export const shortDate = (d?: string) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "date TBC");
