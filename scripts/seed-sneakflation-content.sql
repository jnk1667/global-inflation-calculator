-- ============================================================
-- Sneakflation Calculator — SEO content seed
-- Run once against the production Supabase database.
-- Tables: seo_content (blog essay), faqs (FAQ rows)
-- ============================================================

-- ── 1. Blog essay ─────────────────────────────────────────────────────────────

INSERT INTO seo_content (id, title, content, updated_at)
VALUES (
  'sneakflation_essay',
  'Sneakflation: The Hidden Fee Epidemic',
  E'## Sneakflation: The Hidden Fee Epidemic\n\nSneakflation is what happens when companies quietly add new fees, raise existing ones, or remove previously included benefits — all without changing the headline price you originally signed up for. The bill looks roughly the same until you read the fine print. Then you realise you are paying separately for things that used to be free: the checked bag, the reserved seat, the HD quality, the account that was free, the locker, the parking, the resort surcharge.\n\nThe word "sneakflation" entered widespread use during the 2021–2024 inflationary period, when input costs surged and companies looked for ways to recover margin without triggering the alarm that comes with a visible price increase. Raising the headline price causes cancellations and headlines. Quietly adding a £35 resort fee or a $15-per-month account maintenance charge mostly goes unnoticed — which is exactly the point.\n\n### Why Sneakflation Is Harder to Spot Than Shrinkflation\n\nShrinkflation is visible. You can pick up a crisp packet and feel that it is lighter. You can compare the weight on the label to an old photo. Skimpflation is one step harder — you need to compare cotton percentages or star ratings over time. Sneakflation is the hardest of all to detect, because the product or service itself may be unchanged. What changes is the ecosystem of charges surrounding it.\n\nAirlines are the most documented example. In 2008, American Airlines became the first major US carrier to charge for checked bags. By 2023, US airlines collected over $7 billion annually in bag fees alone. A return flight that appeared unchanged in base price was costing families $140–200 more once bags and seat selection were factored in. The same pattern has played out in banking, hospitality, fitness, and every subscription service category.\n\n### The Six Industries Most Affected\n\n**Aviation** pioneered the unbundling model. The flight itself is the base fare. Everything else — luggage, seat choice, boarding order, meal, Wi-Fi, a pillow — is now a separate fee. Budget carriers started it; legacy carriers copied it when they saw the revenue.\n\n**Banking and financial services** shifted from free current accounts with overdraft buffers to fee-laden accounts with charged overdrafts. In the UK, the FCA forced banks to restructure overdraft fees in 2020, but account maintenance fees rose to compensate. In the US, monthly service charges on checking accounts became standard at banks that once offered them free.\n\n**Streaming and subscription services** raised prices repeatedly between 2020 and 2024. Netflix, Disney+, Spotify, Apple TV+, Amazon Prime, and virtually every major streaming platform increased monthly rates while simultaneously reducing what the base tier includes — removing HD, adding ad tiers, and cracking down on account sharing, all of which effectively raised the real cost of accessing the same content.\n\n**Hotels and hospitality** added resort fees that appear after the room rate is quoted. A $129-per-night hotel room becomes $169 once the mandatory $40 resort fee is added at checkout. The practice became so widespread that the FTC issued guidance on drip pricing in 2023. Parking, early check-in, Wi-Fi, and safe deposits that were once complimentary are now common line items.\n\n**Fitness and wellness** shifted to model where the headline monthly fee is just the entry point. Annual registration fees, locker rental, towel hire, guest passes, and class booking fees have all proliferated — particularly at national gym chains that expanded rapidly in the 2010s and needed new revenue streams.\n\n**Restaurants** added service charges, credit card surcharges, eco fees, and bread basket covers across the UK, US, and Australia. The tipping culture has also intensified in the US, with digital terminals now prompting for 20–25% as the baseline rather than the traditional 15%.\n\n### The Regulatory Response\n\nGovernments and regulators began pushing back around 2022–2024. The Biden administration made eliminating "junk fees" a central consumer protection priority, directing the FTC and CFPB to crack down on hidden charges in banking, travel, and ticketing. The EU introduced the Omnibus Directive requiring all mandatory fees to be displayed in the total price before checkout. The UK Competition and Markets Authority (CMA) published guidance on drip pricing in 2023.\n\nHowever, enforcement is patchy and slow. Airlines successfully lobbied against mandatory bag fee inclusion in the US. Hotel resort fees remain widespread. And new fee categories emerge faster than regulators can categorise them.\n\n### The Compound Effect Nobody Calculates\n\nThe most insidious aspect of sneakflation is that each individual fee seems manageable. A $35 bag fee, a £10 monthly account charge, a $3 streaming price increase — none of these individually triggers urgency. But stack five years of sneakflation across airlines, banks, streaming, gym, and hotel stays and the annual figure is often well over £500–£1,000 per household compared to 2019.\n\nThis calculator exists to close that gap. By entering every fee — old amount, new amount, how often you pay it, when it started — you can see your true annual sneakflation burden in a single number. Then you can decide which fees to challenge, which services to cancel, and which contracts to renegotiate.\n\n### What You Can Do About It\n\nAwareness is the first step, which is why this calculator matters. Beyond that, the practical responses are: (1) audit every subscription and bank statement for fees that did not exist five years ago; (2) call and ask for fee waivers — banks especially will waive monthly charges for customers who ask; (3) choose services with inclusive pricing where possible; (4) check whether your credit card offers travel credits or fee reimbursements that offset airline and hotel charges; (5) use fee comparison sites when booking hotels to find resort-fee-free properties.\n\nSneakflation is not going away. The unbundling model is too profitable for companies to abandon voluntarily. But the more consumers quantify what it actually costs them, the harder it becomes to ignore.',
  now()
)
ON CONFLICT (id) DO UPDATE
  SET title      = EXCLUDED.title,
      content    = EXCLUDED.content,
      updated_at = EXCLUDED.updated_at;

-- ── 2. FAQs ───────────────────────────────────────────────────────────────────

INSERT INTO faqs (id, category, question, answer, order_index, is_active, created_at, updated_at)
VALUES

  ('sneakflation_faq_1', 'sneakflation', 'What is sneakflation?',
   'Sneakflation is the practice of quietly adding new fees, increasing existing charges, or removing previously included benefits while keeping the advertised headline price the same or raising it only slightly. Unlike shrinkflation (less quantity) or skimpflation (lower quality), sneakflation works by fragmenting costs — separating what was once included into separately charged line items. Common examples include airline baggage fees, hotel resort fees, streaming price hikes, bank account maintenance fees, and gym registration charges.',
   1, true, NOW(), NOW()),

  ('sneakflation_faq_2', 'sneakflation', 'What is the difference between sneakflation, shrinkflation, and skimpflation?',
   'All three are forms of hidden inflation. Shrinkflation reduces the physical quantity of a product (e.g. a 200g pack becomes 165g at the same price). Skimpflation reduces the quality of a product or service (e.g. cotton content drops from 100% to 60%, or a hotel drops from 4.5 stars to 3.8 stars). Sneakflation adds new fees or removes previously included perks — the product or service nominally stays the same but you now pay extra for things that were once free (baggage, seat selection, parking, HD streaming, etc.). Together they form the hidden inflation trilogy.',
   2, true, NOW(), NOW()),

  ('sneakflation_faq_3', 'sneakflation', 'What are the most common examples of sneakflation?',
   'The most widespread sneakflation examples include: airlines (checked bag fees, seat selection fees, change fees, priority boarding charges); hotels (resort fees, destination fees, parking, early check-in, Wi-Fi charges); streaming services (price hikes, removal of HD from base plans, password sharing fees); banks (account maintenance fees, overdraft fees, ATM fees, wire transfer fees); gyms (annual registration fees, locker fees, guest pass charges on top of monthly membership); and restaurants (service charges, credit card surcharges, eco/container fees). All were either zero or substantially lower 5–10 years ago.',
   3, true, NOW(), NOW()),

  ('sneakflation_faq_4', 'sneakflation', 'Are junk fees the same as sneakflation?',
   'Junk fees is the term used by regulators — particularly the US Federal Trade Commission (FTC) and Consumer Financial Protection Bureau (CFPB) — for hidden or deceptive fees that are obscured until checkout or billing. Sneakflation is the broader consumer term covering the same phenomenon: fees that inflate the true cost of a product or service above its advertised price. The Biden administration''s 2023 junk fee crackdown specifically targeted resort fees, ticketing fees, bank fees, and early termination charges — all classic sneakflation examples.',
   4, true, NOW(), NOW()),

  ('sneakflation_faq_5', 'sneakflation', 'How do I calculate how much sneakflation is costing me per year?',
   'For each fee: (1) Identify the original amount (or 0 if it is a new fee) and the current amount. (2) Calculate the difference: current minus original. (3) Multiply by the annual frequency: weekly fees times 52, monthly times 12, quarterly times 4, annual times 1, one-off times 1. (4) Sum all fees for your total annual sneakflation burden. Our calculator automates all of this across unlimited fees with a breakdown table and bar chart.',
   5, true, NOW(), NOW()),

  ('sneakflation_faq_6', 'sneakflation', 'What currencies does the sneakflation calculator support?',
   'Our sneakflation calculator supports 8 currencies: US Dollar (USD), British Pound (GBP), Euro (EUR), Canadian Dollar (CAD), Australian Dollar (AUD), Swiss Franc (CHF), Japanese Yen (JPY), and New Zealand Dollar (NZD). Each currency comes with locale-specific example presets covering airlines, streaming, banking, fitness, hotels, and restaurants — reflecting real-world documented fee changes in each country.',
   6, true, NOW(), NOW()),

  ('sneakflation_faq_7', 'sneakflation', 'How do I use the perk removed fee type?',
   'For a removed perk, enter the monetary value of the benefit you used to receive as the Original amount and 0 as the Current amount. For example, if a credit card removed a £200/year airport lounge membership that was previously included, enter Original: £200, Current: £0, Frequency: Annual. The calculator will count £200 as your annual loss. This lets you quantify not just direct fee increases but also the inflation caused by benefit erosion.',
   7, true, NOW(), NOW())

ON CONFLICT (id) DO UPDATE
  SET category    = EXCLUDED.category,
      question    = EXCLUDED.question,
      answer      = EXCLUDED.answer,
      order_index = EXCLUDED.order_index,
      is_active   = EXCLUDED.is_active,
      updated_at  = NOW();
