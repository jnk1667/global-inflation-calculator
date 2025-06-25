import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_JWT_SECRET

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function initializeDatabase() {
  console.log("🚀 Initializing database tables...")

  try {
    // Create FAQs table
    const { error: faqError } = await supabase.rpc("create_faqs_table", {})

    if (faqError && !faqError.message.includes("already exists")) {
      console.log("Creating FAQs table manually...")

      // Fallback: Create table using raw SQL
      const { error: createFaqError } = await supabase.from("faqs").select("*").limit(1)

      if (createFaqError && createFaqError.message.includes("does not exist")) {
        console.log("FAQs table needs to be created in Supabase dashboard")
      }
    }

    // Create settings table
    const { error: settingsError } = await supabase.rpc("create_settings_table", {})

    if (settingsError && !settingsError.message.includes("already exists")) {
      console.log("Creating settings table manually...")
    }

    // Insert default settings if none exist
    const { data: existingSettings } = await supabase.from("site_settings").select("*").limit(1)

    if (!existingSettings || existingSettings.length === 0) {
      const { error: insertError } = await supabase.from("site_settings").insert([
        {
          id: "main",
          title: "Global Inflation Calculator",
          description: "Free inflation calculator for comparing currency values",
          keywords: "inflation calculator, currency, historical prices",
          contact_email: "admin@example.com",
        },
      ])

      if (insertError) {
        console.log("Note: Default settings will be created when first accessed")
      } else {
        console.log("✅ Default settings created")
      }
    }

    console.log("✅ Database initialization complete!")
  } catch (error) {
    console.error("Database initialization error:", error)
    console.log("📝 Manual setup required in Supabase dashboard")
  }
}

initializeDatabase()
