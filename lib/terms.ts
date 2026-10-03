// Final terms & conditions. They use the registered legal name; everything else in the app uses the brand name from Settings.
export const LEGAL_NAME = "The Refractions Studio";
export type TermsSection = { title: string; items: string[] };
export const TERMS_CLOSING = "By making the booking payment, the client acknowledges that they have received, read and agreed to these Terms & Conditions.";
export const termsFor = (n: string = LEGAL_NAME): TermsSection[] => [
  { title: "Booking & Payment", items: [
    "A booking is confirmed once the agreed advance payment has been received. Payment of the booking amount constitutes acceptance of these Terms & Conditions.",
    "The payment schedule will be as specified in the approved quotation. Any additional services or expenses outside the agreed package will be charged separately." ] },
  { title: "Event Coverage & Overtime", items: [
    "The client is responsible for providing the confirmed event schedule and ensuring timely commencement of events.",
    "Coverage is limited to the timings agreed upon at booking. Any extension beyond the agreed coverage hours will be charged as overtime at the applicable rate.",
    "Delays in the commencement of an event do not automatically extend the agreed coverage hours." ] },
  { title: "Delivery & Selection", items: [
    "Final edited photographs will be delivered within approximately 30 working days after the client's complete final selection.",
    "Final edited videos will be delivered within approximately 60 working days after the client's song selection and confirmation of editing requirements.",
    "Clients are requested to complete their photograph selection within 30 calendar days of receiving the selection gallery. Delayed selections will result in a revised delivery timeline.",
    "Only selected photographs will be professionally edited. Unselected high-resolution photographs may be provided with a visible studio watermark upon project closure.",
    "RAW photographs and original video footage are not included in standard packages unless specifically agreed upon." ] },
  { title: "Music & Editing", items: [
    "The client is responsible for providing the required music selections for the wedding films.",
    "Song changes requested after completion of the video edit will be treated as additional editing work and may incur extra charges.",
    "Every photographer has an established creative and editing style. By confirming the booking, the client acknowledges and accepts the studio's portfolio, colour grading and overall creative approach. Changes to the studio's artistic style will not be entertained. Genuine technical errors will, however, be addressed." ] },
  { title: "Couple Shoot & Important Guests", items: [
    "A minimum of 90 minutes is recommended for the couple's shoot to achieve the standard creative quality. Reduced shooting time may affect the variety and quality of the final results.",
    "The client must identify close family members and important guests to ensure they receive appropriate photographic coverage. The studio cannot guarantee photographs of individuals who are unavailable or inaccessible during the event." ] },
  { title: "Female Photographer Requests", items: [
    "Requests for female photographers must be communicated and confirmed at the time of booking, subject to availability. Last-minute or on-the-spot requests cannot be guaranteed." ] },
  { title: "Location & Outstation Events", items: [
    "The client is responsible for arranging necessary location permits, permissions and security clearances unless otherwise agreed.",
    "For outstation events, applicable travel, accommodation and other logistical expenses will be borne by the client and communicated in advance." ] },
  { title: "Team Conduct & Safety", items: [
    "We maintain the highest standards of professionalism and respect towards our clients, their families and guests, and expect the same courtesy towards our team.",
    `Abusive behaviour, harassment, intimidation, threats or any conduct compromising the safety of our team will not be tolerated. ${n} reserves the right to suspend or discontinue coverage in such circumstances, with financial matters handled in accordance with the circumstances and applicable law.` ] },
  { title: "Data Security & Technical Failure", items: [
    `${n} takes reasonable precautions to safeguard recorded material through professional equipment and backup procedures. However, electronic equipment and storage devices can malfunction.`,
    "In the event of data loss, the studio will make reasonable efforts to recover the affected material. If recovery is unsuccessful, any refund or compensation will be assessed in accordance with the extent of the loss, services performed and applicable law." ] },
  { title: "Cancellation & Postponement", items: [
    "If the client cancels the booking, any refund or cancellation charges will be determined according to the agreed cancellation terms, taking into account work performed, expenses incurred and applicable circumstances.",
    "In case of postponement, the studio will make reasonable efforts to accommodate the revised date, subject to availability.",
    "If the studio is unable to fulfil a confirmed booking and cannot arrange an acceptable alternative, amounts received for unperformed services will be refunded." ] },
  { title: "Portfolio & Social Media Usage", items: [
    `${n} reserves the right to share selected photographs and video clips from the event on its website, social media platforms, portfolio and other promotional materials.`,
    "By confirming the booking, the client acknowledges and agrees to this intended use of event content.",
    "Any objection or specific privacy restriction must be communicated to the studio at the time of booking so that it can be discussed and agreed upon in advance. Last-minute objections may not be accommodated once content has been published.",
    "The client should inform the studio of any individuals, particularly children, or specific moments that should not be featured publicly. Any additional consent required from identifiable individuals will be obtained where applicable." ] },
  { title: "Storage & Project Closure", items: [
    "The studio will retain final delivered photographs and videos for 90 calendar days following final delivery. After this period, project files may be permanently deleted.",
    "The client is responsible for downloading and maintaining backup copies of all delivered material." ] },
  { title: "General", items: [
    "Any changes to the agreed package, services or deliverables must be mutually communicated and confirmed in writing.",
    "These Terms & Conditions are governed by the applicable laws of Pakistan. Both parties will make reasonable efforts to resolve any disagreements amicably." ] },
];
export const TERMS_PT = 7.4; // pt; the PDF builder fits 7.8pt, the screen version stays a little smaller to be safe
