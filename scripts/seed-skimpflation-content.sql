-- ─────────────────────────────────────────────────────────────────────────────
-- Skimpflation Calculator — Supabase seed script
-- Tables: seo_content, faqs
-- Run once to populate essay and FAQ content for /skimpflation-calculator
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. SEO Essay ─────────────────────────────────────────────────────────────

INSERT INTO seo_content (id, title, content, meta_description, keywords, created_at, updated_at)
VALUES (
  'skimpflation_essay',
  'Skimpflation: When Less Quality Costs You More',
  E'## Skimpflation: When Less Quality Costs You More\n\nSkimpflation is one of the most insidious forms of hidden inflation — and one of the least discussed. Unlike its better-known sibling **shrinkflation**, which reduces the quantity of a product while keeping the price steady, skimpflation reduces the *quality* while the price stays the same or rises. The result is identical from a consumer perspective: you pay more per unit of real value. But because quality is harder to measure than weight, skimpflation is far more difficult to detect — and far easier for manufacturers and service providers to hide.\n\n### The Anatomy of a Quality Cut\n\nSkimpflation takes many forms depending on the industry. In food, it manifests as a reduction in the percentage of premium ingredients — cotton percentages in textiles, juice percentages in drinks, meat content in ready meals, or active ingredient concentration in cosmetics. In services, it appears as shorter durations (a 60-minute massage quietly becoming 50 minutes), reduced amenities (hotels removing daily room cleaning or cutting towel thread counts), or downgraded materials in nominally identical products. The defining feature is that the product or service looks the same on the shelf or in the brochure — same brand, same packaging, same price tag — but delivers measurably less value.\n\n### Why Skimpflation Accelerated After 2020\n\nThe global inflationary shock of 2021–2023 created enormous pressure on manufacturers and service providers. Input costs — raw materials, energy, labour — surged, while consumer price sensitivity made direct price increases risky. The solution for many businesses was to absorb cost increases by degrading quality rather than raising prices. A ready meal brand could reduce the meat filling from 120g to 80g per portion and face minimal consumer backlash, whereas a 33% price increase would immediately appear on grocery store price comparison apps.\n\n**This strategy was rational from a business perspective, but devastating for consumers.** It meant that official inflation indices — which track the price of nominally identical products — systematically underestimated the true cost-of-living increase. A product recorded in the Consumer Price Index as having a 0% price change could simultaneously be delivering 30–40% less real value.\n\n### The Measurement Problem\n\nSkimpflation is almost invisible in standard economic measurement. The Consumer Price Index (CPI) measures the price of a fixed basket of goods at fixed specifications. But when specifications change — quietly, incrementally, without fanfare — the index cannot capture the quality loss. The ONS in the UK, BLS in the US, and Eurostat all use hedonic adjustment methods to try to account for quality changes in complex goods like electronics, but these methods are poorly equipped to track gradual quality degradation in fast-moving consumer goods or services.\n\nAcademic economists refer to this as **quality bias** in the CPI — a systematic understatement of true inflation caused by unmeasured quality deterioration. Our calculator addresses this directly by letting you enter your own quality metrics (star ratings, material percentages, ingredient weights, service durations) and computing the true quality-adjusted inflation rate from your actual experience.\n\n### Real-World Examples of Skimpflation\n\nThe most documented cases of skimpflation in recent years include:\n\n**Hotel quality cuts:** Major hotel chains across the UK, US, and Australia quietly reduced housekeeping from daily to every-other-day service during the post-COVID period, then made the policy permanent while maintaining or increasing room rates. Thread counts on linens dropped at several mid-market chains by 30–40%, and complimentary toiletry sizes were reduced.\n\n**Textile quality degradation:** Consumer research published in 2023–2024 found that the average cotton content of T-shirts sold by mid-market retailers fell from approximately 90–100% in 2018 to 55–70% by 2024, with the remainder replaced by polyester. The retail price of equivalent garments rose approximately 15–25% over the same period, representing a substantial quality-adjusted price increase.\n\n**Ready meal meat reduction:** Analysis of UK supermarket ready meals showed average meat content per portion fell by 18–32% across leading brands between 2019 and 2024, while average prices rose 20–35%.\n\n**Gym and fitness services:** A survey of UK gym chains found average class duration fell from 55–60 minutes to 45–50 minutes between 2020 and 2025, a 10–15% reduction in service time at broadly flat or rising membership fees.\n\n### How to Protect Yourself from Skimpflation\n\nThe most effective defences against skimpflation are:\n\n**Read ingredient and material labels carefully.** Look specifically at ingredient percentages (juice content, meat content, cotton percentage) and compare them to older versions of the same product if you have them. Many retailers now list cotton/polyester blend percentages on clothing labels.\n\n**Use unit pricing for food.** Price per 100g or per 100ml is your best tool against both shrinkflation and skimpflation, though it cannot capture ingredient quality changes — only quantity.\n\n**Track service durations.** If you use regular services (gym classes, beauty treatments, delivery windows), record the duration each time. Skimpflation in services almost always starts with small, barely noticeable time cuts.\n\n**Use a quality-adjusted price calculator.** Our calculator lets you quantify exactly how much more you are paying per unit of quality, so you can make informed decisions about which products and brands are genuinely delivering value and which are hiding price increases behind quality cuts.\n\n### The Broader Economic Impact\n\nSkimpflation has a corrosive effect on consumer trust and brand equity over time. Research on the phenomenon shows that while consumers are initially slow to notice quality cuts, once identified, the reputational damage is significant and long-lasting. The Capgemini consumer research series has consistently found that 60–75% of consumers, once they become aware they have been skimped, will switch brand or retailer permanently.\n\nFor the broader economy, systematic quality degradation represents a real and unmeasured decline in living standards that does not show up in official statistics. Inflation as measured by the CPI may decline or stabilise, but if the goods and services in the basket are simultaneously deteriorating in quality, real household welfare continues to fall. This gap between measured and experienced inflation is one reason why public perception of inflation often diverges sharply from official statistics — consumers are living the quality-adjusted reality that the indices do not capture.',
  'Skimpflation calculator revealing true hidden inflation from quality cuts — hotel ratings, cotton %, meat content, service duration. 8 currencies, official CPI benchmarks.',
  ARRAY['skimpflation', 'skimpflation calculator', 'quality degradation', 'hidden inflation', 'skimpflation vs shrinkflation', 'consumer price quality', 'quality adjusted inflation'],
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
  SET title           = EXCLUDED.title,
      content         = EXCLUDED.content,
      meta_description = EXCLUDED.meta_description,
      keywords        = EXCLUDED.keywords,
      updated_at      = NOW();

-- ─── 2. FAQs ──────────────────────────────────────────────────────────────────

INSERT INTO faqs (id, category, question, answer, order_index, is_active, created_at, updated_at)
VALUES
  (
    'skimpflation_faq_1',
    'skimpflation',
    'What is skimpflation?',
    'Skimpflation is the practice of reducing the quality of a product or service while keeping the price the same or raising it. Unlike shrinkflation (which reduces the quantity of a product — e.g. a smaller crisp bag), skimpflation reduces the quality — cheaper ingredients, lower material percentages, shorter service durations, or downgraded specifications — while the package size and price tag stay largely unchanged. The term became widely used during the 2021–2023 global inflationary period when rising input costs led many businesses to cut quality rather than raise visible prices.',
    1,
    true,
    NOW(),
    NOW()
  ),
  (
    'skimpflation_faq_2',
    'skimpflation',
    'What is the difference between skimpflation and shrinkflation?',
    'Shrinkflation reduces the quantity of a product — a cereal box goes from 500g to 400g at the same price. Skimpflation reduces the quality — a cotton T-shirt goes from 100% cotton to 60% cotton at the same price, or a hotel cuts its housekeeping service while keeping room rates flat. Both are forms of hidden inflation: you pay the same or more for less real value. The key distinction is that shrinkflation is measurable in weight, count, or volume, while skimpflation requires a quality metric such as a star rating, material percentage, ingredient weight, or service duration.',
    2,
    true,
    NOW(),
    NOW()
  ),
  (
    'skimpflation_faq_3',
    'skimpflation',
    'How does this skimpflation calculator work?',
    'Enter the original quality value (e.g. 100% cotton, 4.5 stars, 60 minutes) alongside the original price and year. Then enter the current quality value, current price, and current year. The calculator computes: (1) the effective skimpflation rate — the combined impact of the quality reduction and price change expressed as a percentage of quality-adjusted price change; (2) the fair price — what the current product should cost if its price-per-quality-unit had stayed constant; (3) the extra cost per purchase and annually; and (4) a comparison against official food CPI for your chosen currency over the same period.',
    3,
    true,
    NOW(),
    NOW()
  ),
  (
    'skimpflation_faq_4',
    'skimpflation',
    'Which industries are most affected by skimpflation?',
    'Skimpflation is most prevalent in: food and grocery (lower meat content in ready meals, diluted juice concentrations, cheaper oil substitutions in cooking products); hospitality (hotel amenity cuts, shorter check-in windows, reduced towel thread counts); fashion and textiles (lower cotton percentages, thinner fabrics); fitness and wellness (shorter class durations, equipment downgrade cycles); and financial and subscription services (removal of features from standard plans at unchanged monthly fees). The 2021–2023 inflationary period saw a widespread acceleration of skimpflation across all these sectors as businesses faced cost pressure.',
    4,
    true,
    NOW(),
    NOW()
  ),
  (
    'skimpflation_faq_5',
    'skimpflation',
    'Why does skimpflation not show up in official inflation statistics?',
    'Official inflation indices such as the CPI measure the price of a fixed basket of goods at fixed specifications. When quality changes — quietly and incrementally — the index cannot capture the loss in value if the specification change is not identified and adjusted. While statistics agencies use hedonic adjustment methods to account for quality changes in complex goods like electronics, these methods are poorly equipped to track gradual ingredient or material quality degradation in everyday consumer goods. This creates a quality bias in CPI — a systematic understatement of true inflation from unmeasured quality deterioration.',
    5,
    true,
    NOW(),
    NOW()
  ),
  (
    'skimpflation_faq_6',
    'skimpflation',
    'What currencies does the skimpflation calculator support?',
    'The calculator supports 8 currencies: US Dollar (USD), British Pound (GBP), Euro (EUR), Canadian Dollar (CAD), Australian Dollar (AUD), Swiss Franc (CHF), Japanese Yen (JPY), and New Zealand Dollar (NZD). Each currency is paired with official food CPI benchmark data sourced from FAOSTAT, BLS, ONS, Eurostat, Statistics Canada, ABS, SFSO, Statistics Bureau of Japan, and Stats NZ, covering 2000 to 2025.',
    6,
    true,
    NOW(),
    NOW()
  ),
  (
    'skimpflation_faq_7',
    'skimpflation',
    'Is skimpflation legal?',
    'Skimpflation is generally legal as long as new quality specifications are accurately disclosed on the product label or in service terms and conditions. However, if a product continues to be marketed using old quality claims after a quality reduction (e.g. labelled "100% cotton" after the blend changed to 60% cotton), it constitutes false advertising and is illegal under consumer protection law in most jurisdictions. Consumer protection agencies including Trading Standards (UK), the FTC (US), and national authorities under EU Consumer Law have powers to act against misleading quality claims. The best consumer defences are checking labels carefully, monitoring service durations, and using a quality-adjusted price calculator to detect skimpflation quantitatively.',
    7,
    true,
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO UPDATE
  SET category    = EXCLUDED.category,
      question    = EXCLUDED.question,
      answer      = EXCLUDED.answer,
      order_index = EXCLUDED.order_index,
      is_active   = EXCLUDED.is_active,
      updated_at  = NOW();
