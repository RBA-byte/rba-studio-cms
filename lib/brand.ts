export const BRAND = {
  name: "The Refractions Studio",
  tagline: "Professional Photography & Social Media Marketing Services",
  services: "Weddings | Portraits | Products | Commercial | Event Coverage",
  address: "27-A, Hadayatullah Block, Mustafa Town, Lahore (54000)",
  cell: "+92 335 6726627",
  email: "refractionsbyammar@gmail.com",
};
export const todayPK = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Karachi" });
export const longDate = (d?: string) => new Date(d ?? todayPK()).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" });
