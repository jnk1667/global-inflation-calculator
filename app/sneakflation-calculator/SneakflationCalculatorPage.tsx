"use client"

import { useState, useCallback, useMemo, useEffect, useId } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import Link from "next/link"
import { AlertTriangle, TrendingUp, Plus, Trash2, BookOpen, ChevronRight, Eye } from "lucide-react"
import FAQ from "@/components/faq"
import { supabase } from "@/lib/supabase"
import { getCachedContent } from "@/lib/cached-content"

// ─── Types ────────────────────────────────────────────────────────────────────

type FeeType = "new_fee" | "fee_increase" | "perk_removed" | "surcharge"

interface FeeRow {
  id: string
  label: string
  feeType: FeeType
  oldAmount: string
  newAmount: string
  currency: CurrencyCode
  frequency: FeeFrequency
  startYear: string
}

type FeeFrequency = "one_off" | "weekly" | "monthly" | "quarterly" | "annual"

const FREQ_LABEL: Record<FeeFrequency, string> = {
  one_off:   "One-off",
  weekly:    "Weekly",
  monthly:   "Monthly",
  quarterly: "Quarterly",
  annual:    "Annual",
}

const FREQ_MULTIPLIER: Record<FeeFrequency, number> = {
  one_off:   1,
  weekly:    52,
  monthly:   12,
  quarterly: 4,
  annual:    1,
}

const FEE_TYPE_LABEL: Record<FeeType, string> = {
  new_fee:      "New fee added",
  fee_increase: "Fee increase",
  perk_removed: "Perk/benefit removed",
  surcharge:    "Surcharge added",
}

// ─── Currency config ──────────────────────────────────────────────────────────

const CURRENCIES = {
  USD: { symbol: "$",   name: "US Dollar",         flag: "us" },
  GBP: { symbol: "£",   name: "British Pound",      flag: "gb" },
  EUR: { symbol: "€",   name: "Euro",               flag: "eu" },
  CAD: { symbol: "C$",  name: "Canadian Dollar",    flag: "ca" },
  AUD: { symbol: "A$",  name: "Australian Dollar",  flag: "au" },
  CHF: { symbol: "Fr",  name: "Swiss Franc",        flag: "ch" },
  JPY: { symbol: "¥",   name: "Japanese Yen",       flag: "jp" },
  NZD: { symbol: "NZ$", name: "New Zealand Dollar", flag: "nz" },
} as const

type CurrencyCode = keyof typeof CURRENCIES

// ─── Locale-aware presets ─────────────────────────────────────────────────────

type PresetGroup = {
  label: string
  category: string
  fees: Omit<FeeRow, "id" | "currency">[]
}

const PRESETS_BY_CURRENCY: Record<CurrencyCode, PresetGroup[]> = {
  USD: [
    {
      label: "Airline Fees",
      category: "Aviation",
      fees: [
        { label: "Checked bag fee",         feeType: "new_fee",      oldAmount: "0",  newAmount: "35",  frequency: "one_off",  startYear: "2020" },
        { label: "Seat selection fee",       feeType: "new_fee",      oldAmount: "0",  newAmount: "15",  frequency: "one_off",  startYear: "2021" },
        { label: "Priority boarding",        feeType: "fee_increase", oldAmount: "9",  newAmount: "19",  frequency: "one_off",  startYear: "2022" },
      ],
    },
    {
      label: "Streaming Services",
      category: "Subscriptions",
      fees: [
        { label: "Netflix Standard plan",   feeType: "fee_increase", oldAmount: "13.99", newAmount: "22.99", frequency: "monthly", startYear: "2020" },
        { label: "Disney+ subscription",    feeType: "fee_increase", oldAmount: "6.99",  newAmount: "13.99", frequency: "monthly", startYear: "2020" },
        { label: "Spotify Premium",         feeType: "fee_increase", oldAmount: "9.99",  newAmount: "11.99", frequency: "monthly", startYear: "2021" },
      ],
    },
    {
      label: "Banking Fees",
      category: "Finance",
      fees: [
        { label: "Monthly account fee",     feeType: "new_fee",      oldAmount: "0",   newAmount: "12",  frequency: "monthly", startYear: "2021" },
        { label: "Overdraft fee",           feeType: "fee_increase", oldAmount: "25",  newAmount: "35",  frequency: "monthly", startYear: "2019" },
        { label: "Out-of-network ATM",      feeType: "fee_increase", oldAmount: "2.50",newAmount: "5",   frequency: "monthly", startYear: "2020" },
      ],
    },
    {
      label: "Gym Membership",
      category: "Fitness",
      fees: [
        { label: "Monthly membership",      feeType: "fee_increase", oldAmount: "29.99", newAmount: "44.99", frequency: "monthly",  startYear: "2020" },
        { label: "Annual registration fee", feeType: "new_fee",      oldAmount: "0",     newAmount: "49",    frequency: "annual",   startYear: "2022" },
        { label: "Guest pass fee",          feeType: "new_fee",      oldAmount: "0",     newAmount: "10",    frequency: "monthly",  startYear: "2023" },
      ],
    },
    {
      label: "Hotel Surcharges",
      category: "Hospitality",
      fees: [
        { label: "Resort fee",              feeType: "new_fee",      oldAmount: "0",  newAmount: "35",  frequency: "one_off",  startYear: "2019" },
        { label: "Parking fee",             feeType: "fee_increase", oldAmount: "15", newAmount: "40",  frequency: "one_off",  startYear: "2020" },
        { label: "Early check-in",          feeType: "new_fee",      oldAmount: "0",  newAmount: "50",  frequency: "one_off",  startYear: "2021" },
      ],
    },
    {
      label: "Restaurant Surcharges",
      category: "Food",
      fees: [
        { label: "Credit card surcharge",   feeType: "new_fee",      oldAmount: "0", newAmount: "3",  frequency: "monthly", startYear: "2022" },
        { label: "Service fee",             feeType: "new_fee",      oldAmount: "0", newAmount: "5",  frequency: "monthly", startYear: "2021" },
        { label: "Takeout container fee",   feeType: "new_fee",      oldAmount: "0", newAmount: "1",  frequency: "monthly", startYear: "2023" },
      ],
    },
  ],
  GBP: [
    {
      label: "Airline Fees",
      category: "Aviation",
      fees: [
        { label: "Hold luggage fee",        feeType: "new_fee",      oldAmount: "0",  newAmount: "33",  frequency: "one_off",  startYear: "2020" },
        { label: "Seat selection fee",      feeType: "new_fee",      oldAmount: "0",  newAmount: "12",  frequency: "one_off",  startYear: "2021" },
        { label: "Speedy boarding",         feeType: "fee_increase", oldAmount: "8",  newAmount: "17",  frequency: "one_off",  startYear: "2022" },
      ],
    },
    {
      label: "Streaming Services",
      category: "Subscriptions",
      fees: [
        { label: "Netflix Standard",        feeType: "fee_increase", oldAmount: "10.99", newAmount: "17.99", frequency: "monthly", startYear: "2020" },
        { label: "Disney+ subscription",    feeType: "fee_increase", oldAmount: "5.99",  newAmount: "11.99", frequency: "monthly", startYear: "2021" },
        { label: "Amazon Prime",            feeType: "fee_increase", oldAmount: "7.99",  newAmount: "11.99", frequency: "monthly", startYear: "2022" },
      ],
    },
    {
      label: "Banking Fees",
      category: "Finance",
      fees: [
        { label: "Monthly account charge",  feeType: "new_fee",      oldAmount: "0",   newAmount: "10",  frequency: "monthly", startYear: "2021" },
        { label: "Arranged overdraft fee",  feeType: "fee_increase", oldAmount: "0",   newAmount: "6",   frequency: "monthly", startYear: "2020" },
        { label: "Foreign transaction fee", feeType: "fee_increase", oldAmount: "1.50",newAmount: "2.99",frequency: "monthly", startYear: "2021" },
      ],
    },
    {
      label: "Gym Membership",
      category: "Fitness",
      fees: [
        { label: "Monthly membership",      feeType: "fee_increase", oldAmount: "24.99", newAmount: "39.99", frequency: "monthly", startYear: "2020" },
        { label: "Joining fee",             feeType: "new_fee",      oldAmount: "0",     newAmount: "30",    frequency: "annual",  startYear: "2022" },
        { label: "Locker rental",           feeType: "new_fee",      oldAmount: "0",     newAmount: "5",     frequency: "monthly", startYear: "2023" },
      ],
    },
    {
      label: "Hotel Charges",
      category: "Hospitality",
      fees: [
        { label: "Parking fee",             feeType: "fee_increase", oldAmount: "10", newAmount: "25",  frequency: "one_off",  startYear: "2020" },
        { label: "Early check-in",          feeType: "new_fee",      oldAmount: "0",  newAmount: "30",  frequency: "one_off",  startYear: "2021" },
        { label: "Wi-Fi charge",            feeType: "new_fee",      oldAmount: "0",  newAmount: "8",   frequency: "one_off",  startYear: "2019" },
      ],
    },
    {
      label: "Restaurant Charges",
      category: "Food",
      fees: [
        { label: "Optional service charge", feeType: "fee_increase", oldAmount: "10", newAmount: "15", frequency: "monthly", startYear: "2021" },
        { label: "Card payment surcharge",  feeType: "new_fee",      oldAmount: "0",  newAmount: "2",  frequency: "monthly", startYear: "2022" },
        { label: "Bread & butter cover",    feeType: "new_fee",      oldAmount: "0",  newAmount: "3",  frequency: "monthly", startYear: "2023" },
      ],
    },
  ],
  EUR: [
    {
      label: "Airline Gebühren",
      category: "Aviation",
      fees: [
        { label: "Aufgegebenes Gepäck",     feeType: "new_fee",      oldAmount: "0",  newAmount: "30",  frequency: "one_off",  startYear: "2020" },
        { label: "Sitzplatzwahl",           feeType: "new_fee",      oldAmount: "0",  newAmount: "12",  frequency: "one_off",  startYear: "2021" },
        { label: "Priority-Boarding",       feeType: "fee_increase", oldAmount: "7",  newAmount: "16",  frequency: "one_off",  startYear: "2022" },
      ],
    },
    {
      label: "Streaming-Dienste",
      category: "Subscriptions",
      fees: [
        { label: "Netflix Standard",        feeType: "fee_increase", oldAmount: "11.99", newAmount: "17.99", frequency: "monthly", startYear: "2020" },
        { label: "Disney+",                 feeType: "fee_increase", oldAmount: "6.99",  newAmount: "11.99", frequency: "monthly", startYear: "2021" },
        { label: "Spotify Premium",         feeType: "fee_increase", oldAmount: "9.99",  newAmount: "11.99", frequency: "monthly", startYear: "2022" },
      ],
    },
    {
      label: "Bankgebühren",
      category: "Finance",
      fees: [
        { label: "Kontoführungsgebühr",     feeType: "fee_increase", oldAmount: "0",  newAmount: "9.90", frequency: "monthly", startYear: "2021" },
        { label: "Überziehungszinsen",      feeType: "fee_increase", oldAmount: "8",  newAmount: "14",   frequency: "monthly", startYear: "2020" },
        { label: "Fremdwährungsgebühr",     feeType: "fee_increase", oldAmount: "1",  newAmount: "2.50", frequency: "monthly", startYear: "2021" },
      ],
    },
    {
      label: "Fitnessstudio",
      category: "Fitness",
      fees: [
        { label: "Monatsbeitrag",           feeType: "fee_increase", oldAmount: "22.90", newAmount: "34.90", frequency: "monthly", startYear: "2020" },
        { label: "Jahresgebühr",            feeType: "new_fee",      oldAmount: "0",     newAmount: "29",    frequency: "annual",  startYear: "2022" },
        { label: "Spindgebühr",             feeType: "new_fee",      oldAmount: "0",     newAmount: "4",     frequency: "monthly", startYear: "2023" },
      ],
    },
    {
      label: "Hotelzuschläge",
      category: "Hospitality",
      fees: [
        { label: "Parkgebühr",              feeType: "fee_increase", oldAmount: "10", newAmount: "22",  frequency: "one_off",  startYear: "2020" },
        { label: "Früh-Check-in",           feeType: "new_fee",      oldAmount: "0",  newAmount: "25",  frequency: "one_off",  startYear: "2021" },
        { label: "Kurtaxe",                 feeType: "new_fee",      oldAmount: "0",  newAmount: "3",   frequency: "one_off",  startYear: "2019" },
      ],
    },
    {
      label: "Restaurant-Zuschläge",
      category: "Food",
      fees: [
        { label: "Servicegebühr",           feeType: "new_fee",      oldAmount: "0", newAmount: "3",  frequency: "monthly", startYear: "2022" },
        { label: "Brotkorb",                feeType: "new_fee",      oldAmount: "0", newAmount: "3",  frequency: "monthly", startYear: "2021" },
        { label: "Kreditkartenzuschlag",    feeType: "new_fee",      oldAmount: "0", newAmount: "2",  frequency: "monthly", startYear: "2023" },
      ],
    },
  ],
  CAD: [
    {
      label: "Airline Fees",
      category: "Aviation",
      fees: [
        { label: "Checked bag fee",         feeType: "new_fee",      oldAmount: "0",  newAmount: "40",  frequency: "one_off",  startYear: "2020" },
        { label: "Seat selection",          feeType: "new_fee",      oldAmount: "0",  newAmount: "20",  frequency: "one_off",  startYear: "2021" },
        { label: "Priority boarding",       feeType: "fee_increase", oldAmount: "10", newAmount: "22",  frequency: "one_off",  startYear: "2022" },
      ],
    },
    {
      label: "Streaming Services",
      category: "Subscriptions",
      fees: [
        { label: "Netflix Standard",        feeType: "fee_increase", oldAmount: "14.99", newAmount: "22.99", frequency: "monthly", startYear: "2020" },
        { label: "Crave subscription",      feeType: "fee_increase", oldAmount: "9.99",  newAmount: "19.99", frequency: "monthly", startYear: "2021" },
        { label: "Spotify Premium",         feeType: "fee_increase", oldAmount: "9.99",  newAmount: "11.99", frequency: "monthly", startYear: "2022" },
      ],
    },
    {
      label: "Banking Fees",
      category: "Finance",
      fees: [
        { label: "Monthly account fee",     feeType: "fee_increase", oldAmount: "4",   newAmount: "16.95", frequency: "monthly", startYear: "2021" },
        { label: "NSF fee",                 feeType: "fee_increase", oldAmount: "40",  newAmount: "48",    frequency: "monthly", startYear: "2020" },
        { label: "Interac e-Transfer fee",  feeType: "new_fee",      oldAmount: "0",   newAmount: "1.50",  frequency: "monthly", startYear: "2022" },
      ],
    },
    {
      label: "Gym Membership",
      category: "Fitness",
      fees: [
        { label: "Monthly membership",      feeType: "fee_increase", oldAmount: "34.99", newAmount: "49.99", frequency: "monthly", startYear: "2020" },
        { label: "Annual enrollment fee",   feeType: "new_fee",      oldAmount: "0",     newAmount: "55",    frequency: "annual",  startYear: "2022" },
        { label: "Towel service",           feeType: "new_fee",      oldAmount: "0",     newAmount: "8",     frequency: "monthly", startYear: "2023" },
      ],
    },
    {
      label: "Hotel Surcharges",
      category: "Hospitality",
      fees: [
        { label: "Destination fee",         feeType: "new_fee",      oldAmount: "0",  newAmount: "28",  frequency: "one_off",  startYear: "2021" },
        { label: "Parking fee",             feeType: "fee_increase", oldAmount: "15", newAmount: "38",  frequency: "one_off",  startYear: "2020" },
        { label: "Pet fee",                 feeType: "new_fee",      oldAmount: "0",  newAmount: "45",  frequency: "one_off",  startYear: "2022" },
      ],
    },
    {
      label: "Restaurant Surcharges",
      category: "Food",
      fees: [
        { label: "Credit card surcharge",   feeType: "new_fee",      oldAmount: "0", newAmount: "3",  frequency: "monthly", startYear: "2022" },
        { label: "Eco fee (takeout)",       feeType: "new_fee",      oldAmount: "0", newAmount: "0.25",frequency: "monthly", startYear: "2023" },
        { label: "Service charge",          feeType: "new_fee",      oldAmount: "0", newAmount: "5",  frequency: "monthly", startYear: "2021" },
      ],
    },
  ],
  AUD: [
    {
      label: "Airline Fees",
      category: "Aviation",
      fees: [
        { label: "Checked bag fee",         feeType: "new_fee",      oldAmount: "0",  newAmount: "45",  frequency: "one_off",  startYear: "2020" },
        { label: "Seat selection",          feeType: "new_fee",      oldAmount: "0",  newAmount: "18",  frequency: "one_off",  startYear: "2021" },
        { label: "Priority boarding",       feeType: "fee_increase", oldAmount: "10", newAmount: "22",  frequency: "one_off",  startYear: "2022" },
      ],
    },
    {
      label: "Streaming Services",
      category: "Subscriptions",
      fees: [
        { label: "Netflix Standard",        feeType: "fee_increase", oldAmount: "15.99", newAmount: "22.99", frequency: "monthly", startYear: "2020" },
        { label: "Stan subscription",       feeType: "fee_increase", oldAmount: "10",    newAmount: "16",    frequency: "monthly", startYear: "2021" },
        { label: "Binge Standard",          feeType: "fee_increase", oldAmount: "10",    newAmount: "18",    frequency: "monthly", startYear: "2022" },
      ],
    },
    {
      label: "Banking Fees",
      category: "Finance",
      fees: [
        { label: "Monthly account fee",     feeType: "fee_increase", oldAmount: "0",  newAmount: "8",   frequency: "monthly", startYear: "2021" },
        { label: "Dishonour fee",           feeType: "fee_increase", oldAmount: "15", newAmount: "25",  frequency: "monthly", startYear: "2020" },
        { label: "International transfer",  feeType: "fee_increase", oldAmount: "15", newAmount: "22",  frequency: "monthly", startYear: "2022" },
      ],
    },
    {
      label: "Gym Membership",
      category: "Fitness",
      fees: [
        { label: "Monthly membership",      feeType: "fee_increase", oldAmount: "39.99", newAmount: "59.99", frequency: "monthly", startYear: "2020" },
        { label: "Joining fee",             feeType: "new_fee",      oldAmount: "0",     newAmount: "49",    frequency: "annual",  startYear: "2022" },
        { label: "Towel hire",              feeType: "new_fee",      oldAmount: "0",     newAmount: "5",     frequency: "monthly", startYear: "2023" },
      ],
    },
    {
      label: "Hotel Surcharges",
      category: "Hospitality",
      fees: [
        { label: "Resort fee",              feeType: "new_fee",      oldAmount: "0",  newAmount: "30",  frequency: "one_off",  startYear: "2021" },
        { label: "Parking fee",             feeType: "fee_increase", oldAmount: "15", newAmount: "40",  frequency: "one_off",  startYear: "2020" },
        { label: "Booking fee",             feeType: "new_fee",      oldAmount: "0",  newAmount: "10",  frequency: "one_off",  startYear: "2022" },
      ],
    },
    {
      label: "Restaurant Surcharges",
      category: "Food",
      fees: [
        { label: "Public holiday surcharge",feeType: "fee_increase", oldAmount: "10", newAmount: "15", frequency: "monthly", startYear: "2021" },
        { label: "Card surcharge",          feeType: "new_fee",      oldAmount: "0",  newAmount: "1.5",frequency: "monthly", startYear: "2022" },
        { label: "Corkage fee",             feeType: "fee_increase", oldAmount: "10", newAmount: "25", frequency: "monthly", startYear: "2021" },
      ],
    },
  ],
  CHF: [
    {
      label: "Airline Gebühren",
      category: "Aviation",
      fees: [
        { label: "Aufgegebenes Gepäck",     feeType: "new_fee",      oldAmount: "0",  newAmount: "38",  frequency: "one_off",  startYear: "2020" },
        { label: "Sitzplatzwahl",           feeType: "new_fee",      oldAmount: "0",  newAmount: "14",  frequency: "one_off",  startYear: "2021" },
        { label: "Priority-Boarding",       feeType: "fee_increase", oldAmount: "9",  newAmount: "19",  frequency: "one_off",  startYear: "2022" },
      ],
    },
    {
      label: "Streaming-Dienste",
      category: "Subscriptions",
      fees: [
        { label: "Netflix Standard",        feeType: "fee_increase", oldAmount: "14.90", newAmount: "20.90", frequency: "monthly", startYear: "2020" },
        { label: "Disney+",                 feeType: "fee_increase", oldAmount: "8.90",  newAmount: "13.90", frequency: "monthly", startYear: "2021" },
        { label: "Spotify Premium",         feeType: "fee_increase", oldAmount: "12.95", newAmount: "14.95", frequency: "monthly", startYear: "2022" },
      ],
    },
    {
      label: "Bankgebühren",
      category: "Finance",
      fees: [
        { label: "Kontoführungsgebühr",     feeType: "fee_increase", oldAmount: "0",  newAmount: "7",   frequency: "monthly", startYear: "2021" },
        { label: "Debitkartenwechsel",      feeType: "fee_increase", oldAmount: "10", newAmount: "20",  frequency: "annual",  startYear: "2022" },
        { label: "Fremdwährungsgebühr",     feeType: "fee_increase", oldAmount: "1.5",newAmount: "3",   frequency: "monthly", startYear: "2021" },
      ],
    },
    {
      label: "Fitnesscenter",
      category: "Fitness",
      fees: [
        { label: "Monatsbeitrag",           feeType: "fee_increase", oldAmount: "75", newAmount: "99",  frequency: "monthly", startYear: "2020" },
        { label: "Aufnahmegebühr",          feeType: "new_fee",      oldAmount: "0",  newAmount: "80",  frequency: "annual",  startYear: "2022" },
        { label: "Spindmiete",              feeType: "new_fee",      oldAmount: "0",  newAmount: "8",   frequency: "monthly", startYear: "2023" },
      ],
    },
    {
      label: "Hotelzuschläge",
      category: "Hospitality",
      fees: [
        { label: "Parkgebühr",              feeType: "fee_increase", oldAmount: "15", newAmount: "35",  frequency: "one_off",  startYear: "2020" },
        { label: "Früh-Check-in",           feeType: "new_fee",      oldAmount: "0",  newAmount: "30",  frequency: "one_off",  startYear: "2021" },
        { label: "Kurtaxe",                 feeType: "new_fee",      oldAmount: "0",  newAmount: "4",   frequency: "one_off",  startYear: "2019" },
      ],
    },
    {
      label: "Restaurant-Zuschläge",
      category: "Food",
      fees: [
        { label: "Brotkorb",                feeType: "new_fee",      oldAmount: "0",  newAmount: "4",  frequency: "monthly", startYear: "2021" },
        { label: "Servicegebühr",           feeType: "new_fee",      oldAmount: "0",  newAmount: "5",  frequency: "monthly", startYear: "2022" },
        { label: "Kreditkartenzuschlag",    feeType: "new_fee",      oldAmount: "0",  newAmount: "2",  frequency: "monthly", startYear: "2023" },
      ],
    },
  ],
  JPY: [
    {
      label: "航空会社の手数料",
      category: "Aviation",
      fees: [
        { label: "受託手荷物料金",            feeType: "new_fee",      oldAmount: "0",    newAmount: "3300", frequency: "one_off",  startYear: "2020" },
        { label: "座席指定料金",              feeType: "new_fee",      oldAmount: "0",    newAmount: "1200", frequency: "one_off",  startYear: "2021" },
        { label: "優先搭乗",                 feeType: "fee_increase", oldAmount: "800",  newAmount: "1800", frequency: "one_off",  startYear: "2022" },
      ],
    },
    {
      label: "動画配信サービス",
      category: "Subscriptions",
      fees: [
        { label: "Netflix スタンダード",      feeType: "fee_increase", oldAmount: "1490", newAmount: "1980", frequency: "monthly", startYear: "2020" },
        { label: "Disney+",                  feeType: "fee_increase", oldAmount: "770",  newAmount: "1320", frequency: "monthly", startYear: "2021" },
        { label: "Spotify プレミアム",        feeType: "fee_increase", oldAmount: "980",  newAmount: "1180", frequency: "monthly", startYear: "2022" },
      ],
    },
    {
      label: "銀行手数料",
      category: "Finance",
      fees: [
        { label: "ATM時間外手数料",           feeType: "fee_increase", oldAmount: "110",  newAmount: "220",  frequency: "monthly", startYear: "2021" },
        { label: "振込手数料",               feeType: "fee_increase", oldAmount: "165",  newAmount: "330",  frequency: "monthly", startYear: "2020" },
        { label: "口座管理料",               feeType: "new_fee",      oldAmount: "0",    newAmount: "550",  frequency: "monthly", startYear: "2022" },
      ],
    },
    {
      label: "フィットネスジム",
      category: "Fitness",
      fees: [
        { label: "月会費",                   feeType: "fee_increase", oldAmount: "7500", newAmount: "9800", frequency: "monthly", startYear: "2020" },
        { label: "入会金",                   feeType: "fee_increase", oldAmount: "5000", newAmount: "11000",frequency: "annual",  startYear: "2022" },
        { label: "ロッカー使用料",            feeType: "new_fee",      oldAmount: "0",    newAmount: "550",  frequency: "monthly", startYear: "2023" },
      ],
    },
    {
      label: "ホテル追加料金",
      category: "Hospitality",
      fees: [
        { label: "駐車料金",                 feeType: "fee_increase", oldAmount: "1000", newAmount: "2500", frequency: "one_off",  startYear: "2020" },
        { label: "アーリーチェックイン",       feeType: "new_fee",      oldAmount: "0",    newAmount: "3000", frequency: "one_off",  startYear: "2021" },
        { label: "クリーニング料金",           feeType: "new_fee",      oldAmount: "0",    newAmount: "1500", frequency: "one_off",  startYear: "2022" },
      ],
    },
    {
      label: "飲食店の追加料金",
      category: "Food",
      fees: [
        { label: "席料（チャージ）",           feeType: "fee_increase", oldAmount: "300",  newAmount: "600",  frequency: "monthly", startYear: "2021" },
        { label: "テイクアウト容器代",         feeType: "new_fee",      oldAmount: "0",    newAmount: "50",   frequency: "monthly", startYear: "2022" },
        { label: "クレジットカード手数料",      feeType: "new_fee",      oldAmount: "0",    newAmount: "100",  frequency: "monthly", startYear: "2023" },
      ],
    },
  ],
  NZD: [
    {
      label: "Airline Fees",
      category: "Aviation",
      fees: [
        { label: "Checked bag fee",         feeType: "new_fee",      oldAmount: "0",  newAmount: "55",  frequency: "one_off",  startYear: "2020" },
        { label: "Seat selection",          feeType: "new_fee",      oldAmount: "0",  newAmount: "20",  frequency: "one_off",  startYear: "2021" },
        { label: "Priority boarding",       feeType: "fee_increase", oldAmount: "12", newAmount: "24",  frequency: "one_off",  startYear: "2022" },
      ],
    },
    {
      label: "Streaming Services",
      category: "Subscriptions",
      fees: [
        { label: "Netflix Standard",        feeType: "fee_increase", oldAmount: "16.99", newAmount: "23.99", frequency: "monthly", startYear: "2020" },
        { label: "Disney+ subscription",    feeType: "fee_increase", oldAmount: "9.99",  newAmount: "14.99", frequency: "monthly", startYear: "2021" },
        { label: "Neon subscription",       feeType: "fee_increase", oldAmount: "14.99", newAmount: "19.99", frequency: "monthly", startYear: "2022" },
      ],
    },
    {
      label: "Banking Fees",
      category: "Finance",
      fees: [
        { label: "Monthly account fee",     feeType: "fee_increase", oldAmount: "0",  newAmount: "8",   frequency: "monthly", startYear: "2021" },
        { label: "Dishonour fee",           feeType: "fee_increase", oldAmount: "15", newAmount: "22",  frequency: "monthly", startYear: "2020" },
        { label: "International transfer",  feeType: "fee_increase", oldAmount: "15", newAmount: "22",  frequency: "monthly", startYear: "2022" },
      ],
    },
    {
      label: "Gym Membership",
      category: "Fitness",
      fees: [
        { label: "Monthly membership",      feeType: "fee_increase", oldAmount: "34.99", newAmount: "54.99", frequency: "monthly", startYear: "2020" },
        { label: "Joining fee",             feeType: "new_fee",      oldAmount: "0",     newAmount: "49",    frequency: "annual",  startYear: "2022" },
        { label: "Towel hire",              feeType: "new_fee",      oldAmount: "0",     newAmount: "5",     frequency: "monthly", startYear: "2023" },
      ],
    },
    {
      label: "Hotel Surcharges",
      category: "Hospitality",
      fees: [
        { label: "Resort levy",             feeType: "new_fee",      oldAmount: "0",  newAmount: "25",  frequency: "one_off",  startYear: "2021" },
        { label: "Parking fee",             feeType: "fee_increase", oldAmount: "10", newAmount: "30",  frequency: "one_off",  startYear: "2020" },
        { label: "Early check-in",          feeType: "new_fee",      oldAmount: "0",  newAmount: "40",  frequency: "one_off",  startYear: "2022" },
      ],
    },
    {
      label: "Restaurant Surcharges",
      category: "Food",
      fees: [
        { label: "Public holiday surcharge",feeType: "fee_increase", oldAmount: "10", newAmount: "15", frequency: "monthly", startYear: "2021" },
        { label: "Card surcharge",          feeType: "new_fee",      oldAmount: "0",  newAmount: "2",  frequency: "monthly", startYear: "2022" },
        { label: "Corkage fee",             feeType: "fee_increase", oldAmount: "15", newAmount: "30", frequency: "monthly", startYear: "2021" },
      ],
    },
  ],
}

// ─── Severity helpers ─────────────────────────────────────────────────────────

const getSeverity = (annualTotal: number, sym: string) => {
  if (annualTotal >= 1000) return { label: "Extreme",  color: "text-red-700 dark:text-red-400",     bg: "bg-red-50 dark:bg-red-900/20",      border: "border-red-200 dark:border-red-800" }
  if (annualTotal >= 500)  return { label: "Severe",   color: "text-red-600 dark:text-red-400",     bg: "bg-red-50 dark:bg-red-900/20",      border: "border-red-200 dark:border-red-800" }
  if (annualTotal >= 200)  return { label: "High",     color: "text-rose-600 dark:text-rose-400",   bg: "bg-rose-50 dark:bg-rose-900/20",    border: "border-rose-200 dark:border-rose-800" }
  if (annualTotal >= 60)   return { label: "Moderate", color: "text-orange-600 dark:text-orange-400",bg: "bg-orange-50 dark:bg-orange-900/20",border: "border-orange-200 dark:border-orange-800" }
  return                          { label: "Low",      color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20",  border: "border-green-200 dark:border-green-800" }
}

// ─── Unique id helper ─────────────────────────────────────────────────────────

let _idCounter = 0
const newId = () => `fee-${++_idCounter}`

// ─── Main component ───────────────────────────────────────────────────────────

export default function SneakflationCalculatorPage() {
  const [currency, setCurrency] = useState<CurrencyCode>("USD")
  const [rows, setRows] = useState<FeeRow[]>([
    {
      id: newId(),
      label: "",
      feeType: "new_fee",
      oldAmount: "",
      newAmount: "",
      currency: "USD",
      frequency: "monthly",
      startYear: "2020",
    },
  ])
  const [blogContent, setBlogContent] = useState("")
  const [blogLoading, setBlogLoading] = useState(true)

  // Sync row currencies when global currency changes
  const handleCurrencyChange = useCallback((c: CurrencyCode) => {
    setCurrency(c)
    setRows((prev) => prev.map((r) => ({ ...r, currency: c })))
  }, [])

  // ─── Load blog essay ──────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const defaultContent = `## Sneakflation: The Hidden Fee Epidemic\n\nSneakflation is what happens when companies quietly add new fees, raise existing ones, or remove previously included benefits — all without changing the headline price you originally signed up for. This calculator reveals the true annual cost of all the hidden fees creeping into your regular spending.`
      try {
        const content = await getCachedContent("sneakflation_essay_content", async () => {
          const { data, error } = await supabase
            .from("seo_content")
            .select("content")
            .eq("id", "sneakflation_essay")
            .single()
          if (error || !data?.content) return defaultContent
          return data.content
        })
        setBlogContent(content)
      } catch {
        setBlogContent(defaultContent)
      } finally {
        setBlogLoading(false)
      }
    }
    load()
  }, [])

  // ─── Row management ───────────────────────────────────────────────────────

  const addRow = useCallback(() => {
    setRows((prev) => [
      ...prev,
      { id: newId(), label: "", feeType: "new_fee", oldAmount: "", newAmount: "", currency, frequency: "monthly", startYear: "2020" },
    ])
  }, [currency])

  const removeRow = useCallback((id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const updateRow = useCallback(<K extends keyof FeeRow>(id: string, field: K, value: FeeRow[K]) => {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, [field]: value } : r))
  }, [])

  const applyPreset = useCallback((group: PresetGroup) => {
    const newRows: FeeRow[] = group.fees.map((f) => ({
      id: newId(),
      ...f,
      currency,
    }))
    setRows(newRows)
  }, [currency])

  // ─── Calculations ─────────────────────────────────────────────────────────

  const results = useMemo(() => {
    const currentYear = 2026
    const sym = CURRENCIES[currency].symbol

    const computed = rows
      .filter((r) => parseFloat(r.newAmount) > 0)
      .map((r) => {
        const oldAmt  = parseFloat(r.oldAmount) || 0
        const newAmt  = parseFloat(r.newAmount) || 0
        const diff    = newAmt - oldAmt
        const mult    = FREQ_MULTIPLIER[r.frequency]
        const annualDiff  = diff * mult
        const annualNew   = newAmt * mult
        const yearsSince  = Math.max(1, currentYear - (parseInt(r.startYear, 10) || 2020))
        const fiveYearCost = annualDiff * 5
        return {
          ...r,
          oldAmt, newAmt, diff,
          annualDiff, annualNew,
          yearsSince,
          totalSoFar: annualDiff * yearsSince,
          fiveYearCost,
        }
      })

    if (!computed.length) return null

    const totalAnnualExtra = computed.reduce((s, c) => s + c.annualDiff, 0)
    const totalFiveYear    = computed.reduce((s, c) => s + c.fiveYearCost, 0)
    const totalSoFar       = computed.reduce((s, c) => s + c.totalSoFar, 0)

    return { computed, totalAnnualExtra, totalFiveYear, totalSoFar, sym }
  }, [rows, currency])

  const sym = CURRENCIES[currency].symbol
  const presets = PRESETS_BY_CURRENCY[currency]
  const yearOptions = Array.from({ length: 2026 - 2000 + 1 }, (_, i) => String(2000 + i))

  // ─── Chart data ───────────────────────────────────────────────────────────

  const chartData = useMemo(() => {
    if (!results) return []
    return results.computed
      .filter((r) => r.annualDiff > 0)
      .sort((a, b) => b.annualDiff - a.annualDiff)
      .slice(0, 8)
      .map((r) => ({
        name: r.label || FEE_TYPE_LABEL[r.feeType],
        value: parseFloat(r.annualDiff.toFixed(2)),
        fill: r.feeType === "perk_removed" ? "#6366f1" : r.feeType === "surcharge" ? "#ef4444" : "#f43f5e",
      }))
  }, [results])

  // Markdown renderer (same pattern as skimpflation)
  const renderMarkdown = (text: string) => {
    const lines = text.split("\n")
    const elements: React.ReactNode[] = []
    let key = 0

    for (const line of lines) {
      if (line.startsWith("## ")) {
        elements.push(<h2 key={key++} className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-6 mb-3">{line.slice(3)}</h2>)
      } else if (line.startsWith("### ")) {
        elements.push(<h3 key={key++} className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-5 mb-2">{line.slice(4)}</h3>)
      } else if (line.startsWith("**") && line.endsWith("**")) {
        elements.push(<p key={key++} className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{line.slice(2, -2)}</p>)
      } else if (line.trim() === "") {
        elements.push(<div key={key++} className="mb-2" />)
      } else {
        // Bold inline
        const parts = line.split(/(\*\*[^*]+\*\*)/)
        const rendered = parts.map((p, i) =>
          p.startsWith("**") && p.endsWith("**")
            ? <strong key={i} className="font-semibold text-gray-900 dark:text-gray-100">{p.slice(2, -2)}</strong>
            : <span key={i}>{p}</span>
        )
        elements.push(<p key={key++} className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">{rendered}</p>)
      }
    }
    return elements
  }

  return (
    <main className="max-w-3xl mx-auto px-4 pt-32 pb-12 space-y-6">

      {/* Hero */}
      <div className="text-center mb-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-xs font-semibold uppercase tracking-wide mb-3">
          <Eye className="w-3.5 h-3.5" />
          Hidden Fee Detector
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3 text-balance">
          Sneakflation Calculator
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xl mx-auto leading-relaxed">
          Add every hidden fee, surcharge, and removed perk you are paying for. See your true annual cost across airlines, banks, streaming, gyms, and restaurants — in 8 currencies.
        </p>
      </div>

      {/* Currency selector */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3">
          Select your currency
        </p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(CURRENCIES) as CurrencyCode[]).map((c) => (
            <button
              key={c}
              onClick={() => handleCurrencyChange(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                currency === c
                  ? "bg-rose-600 text-white border-rose-600"
                  : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-rose-400"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Preset examples */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3">
          Quick examples — click to load
        </p>
        <div className="flex flex-wrap gap-2">
          {presets.map((g) => (
            <button
              key={g.label}
              onClick={() => applyPreset(g)}
              className="text-xs text-rose-700 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-300 px-3 py-1.5 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-rose-300 transition-all"
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Fee entry table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="w-5 h-5 text-rose-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Enter your hidden fees</h2>
        </div>

        <div className="space-y-4">
          {rows.map((row, idx) => (
            <div
              key={row.id}
              className="rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/40 p-4 space-y-3"
            >
              {/* Row header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  Fee {idx + 1}
                </span>
                {rows.length > 1 && (
                  <button
                    onClick={() => removeRow(row.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Remove fee row"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Fee label + type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Fee name <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={row.label}
                    onChange={(e) => updateRow(row.id, "label", e.target.value)}
                    placeholder={`e.g. Checked bag fee`}
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Fee type
                  </label>
                  <select
                    value={row.feeType}
                    onChange={(e) => updateRow(row.id, "feeType", e.target.value as FeeType)}
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    {(Object.keys(FEE_TYPE_LABEL) as FeeType[]).map((t) => (
                      <option key={t} value={t}>{FEE_TYPE_LABEL[t]}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Amounts */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Original ({sym})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={row.oldAmount}
                    onChange={(e) => updateRow(row.id, "oldAmount", e.target.value)}
                    placeholder="0"
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Current ({sym})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={row.newAmount}
                    onChange={(e) => updateRow(row.id, "newAmount", e.target.value)}
                    placeholder="e.g. 35"
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Frequency
                  </label>
                  <select
                    value={row.frequency}
                    onChange={(e) => updateRow(row.id, "frequency", e.target.value as FeeFrequency)}
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    {(Object.keys(FREQ_LABEL) as FeeFrequency[]).map((f) => (
                      <option key={f} value={f}>{FREQ_LABEL[f]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Since year
                  </label>
                  <select
                    value={row.startYear}
                    onChange={(e) => updateRow(row.id, "startYear", e.target.value)}
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              {/* Per-row inline result */}
              {parseFloat(row.newAmount) > 0 && (() => {
                const diff = (parseFloat(row.newAmount) || 0) - (parseFloat(row.oldAmount) || 0)
                const annual = diff * FREQ_MULTIPLIER[row.frequency]
                return annual > 0 ? (
                  <div className="text-xs text-rose-600 dark:text-rose-400 font-medium bg-rose-50 dark:bg-rose-900/20 rounded-lg px-3 py-1.5">
                    +{sym}{annual.toFixed(2)} / year extra for this fee
                  </div>
                ) : null
              })()}
            </div>
          ))}
        </div>

        <button
          onClick={addRow}
          className="mt-4 flex items-center gap-2 text-sm font-medium text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add another fee
        </button>
      </div>

      {/* Results */}
      {!results ? (
        <div className="bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/30 p-8 text-center">
          <TrendingUp className="w-8 h-8 text-rose-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter at least one current fee amount above to see your total hidden fee burden.
          </p>
        </div>
      ) : (
        <>
          {/* Top-line summary */}
          {(() => {
            const severity = getSeverity(results.totalAnnualExtra, sym)
            return (
              <div className={`rounded-2xl border p-6 ${severity.bg} ${severity.border}`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Total hidden fee burden per year
                    </p>
                    <p className={`text-4xl font-bold ${severity.color}`}>
                      {sym}{results.totalAnnualExtra.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className={`text-right shrink-0`}>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${severity.bg} ${severity.border} ${severity.color}`}>
                      {severity.label} impact
                    </span>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Paid since it started",
                value: `${sym}${results.totalSoFar.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                sub: "estimated total paid to date",
                color: "text-rose-600 dark:text-rose-400",
              },
              {
                label: "5-year projection",
                value: `${sym}${results.totalFiveYear.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                sub: "if fees don't change further",
                color: "text-orange-600 dark:text-orange-400",
              },
              {
                label: "Number of fees tracked",
                value: String(results.computed.length),
                sub: "hidden fees & surcharges",
                color: "text-gray-800 dark:text-gray-200",
              },
            ].map((s) => (
              <div key={s.label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color} mb-1`}>{s.value}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Per-fee breakdown table */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Fee-by-fee breakdown</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {results.computed.map((r) => (
                <div key={r.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {r.label || FEE_TYPE_LABEL[r.feeType]}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {FEE_TYPE_LABEL[r.feeType]} &middot; {FREQ_LABEL[r.frequency]} &middot; since {r.startYear}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                      +{sym}{r.annualDiff.toFixed(2)}/yr
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {sym}{r.oldAmt.toFixed(2)} &rarr; {sym}{r.newAmt.toFixed(2)} per {r.frequency.replace("_", " ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bar chart */}
          {chartData.length > 1 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">Annual extra cost by fee</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#6b7280" }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} tickFormatter={(v) => `${sym}${v}`} />
                  <Tooltip
                    formatter={(v: number) => [`${sym}${v.toFixed(2)}`, "Annual extra"]}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Methodology note */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">Calculation Methodology</h3>
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <strong className="text-gray-900 dark:text-gray-100">Annual extra per fee:</strong>
                <div className="mt-1.5 bg-gray-50 dark:bg-gray-700/60 rounded-lg px-3 py-2 font-mono text-xs text-gray-700 dark:text-gray-300">
                  (Current amount − Original amount) × Annual frequency multiplier
                </div>
                <p className="mt-1.5 leading-relaxed">For new fees the original is zero. For perk removals, enter the value of the perk as the original and zero as the current.</p>
              </div>
              <div>
                <strong className="text-gray-900 dark:text-gray-100">Total paid to date:</strong>
                <div className="mt-1.5 bg-gray-50 dark:bg-gray-700/60 rounded-lg px-3 py-2 font-mono text-xs text-gray-700 dark:text-gray-300">
                  Annual extra × (2026 − Since year)
                </div>
              </div>
              <div>
                <strong className="text-gray-900 dark:text-gray-100">5-year projection:</strong>
                <p className="mt-1 leading-relaxed">Annual extra × 5 — a conservative linear projection assuming fees do not increase further.</p>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
              <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-500 dark:text-gray-400 list-disc list-inside">
                <li>One-off fees are counted once, not annualised</li>
                <li>Perk removals: enter perk value as original, 0 as current</li>
                <li>All calculations run in-browser — no data is stored</li>
                <li>For educational purposes only, not financial advice</li>
              </ul>
            </div>
          </div>
        </>
      )}

      {/* Sibling callout — Skimpflation */}
      <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30 p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
          <ChevronRight className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Also try: Skimpflation Calculator
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Sneakflation adds hidden fees. Skimpflation quietly cuts product quality at the same price. Use our sister calculator to measure quality-adjusted inflation.
          </p>
          <Link
            href="/skimpflation-calculator"
            className="text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 transition-colors"
          >
            Go to Skimpflation Calculator &rarr;
          </Link>
        </div>
      </div>

      {/* Blog essay */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-rose-500" />
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Understanding Sneakflation</h2>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">How hidden fees quietly inflate your true cost of living</p>
        {blogLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />)}
          </div>
        ) : (
          <div className="prose-sm max-w-none">{renderMarkdown(blogContent)}</div>
        )}
      </div>

      {/* FAQ */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <FAQ category="sneakflation" />
      </div>

      {/* Internal links */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3">
          Related calculators
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { href: "/shrinkflation-calculator",    label: "Shrinkflation Calculator"    },
            { href: "/skimpflation-calculator",     label: "Skimpflation Calculator"     },
            { href: "/",                            label: "Global Inflation Calculator"  },
            { href: "/energy-inflation-calculator", label: "Energy Inflation Calculator"  },
            { href: "/budget-calculator",           label: "50/30/20 Budget Calculator"  },
            { href: "/salary-calculator",           label: "Salary & Real Wages"         },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-rose-700 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-300 px-3 py-1.5 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-rose-300 transition-all"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 bg-gray-900 text-white rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">

          {/* Col 1 */}
          <div>
            <h3 className="text-xl font-bold mb-3">Sneakflation Calculator</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Reveal the true cost of hidden fees, surcharges, and quietly removed perks across airlines, banks, streaming services, gyms, and restaurants — in 8 currencies.
            </p>
          </div>

          {/* Col 2 — page-specific: fee data is user-entered, no external CPI data used */}
          <div>
            <h4 className="text-lg font-semibold mb-4">About This Calculator</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• All fee data is user-entered</li>
              <li>• No data is stored or transmitted</li>
              <li>• Calculations run entirely in-browser</li>
              <li>• Pre-loaded examples based on publicly announced fee changes (2019–2026)</li>
              <li>• Covers: airlines, banking, streaming, gyms, hotels, restaurants</li>
              <li>• 8 currencies: USD, GBP, EUR, CAD, AUD, CHF, JPY, NZD</li>
            </ul>
          </div>

          {/* Col 3 — Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="text-gray-300 space-y-2">
              {[
                { href: "/",                                                label: "Home - Inflation Calculator"      },
                { href: "/mortgage-calculator",                              label: "Mortgage Calculator"              },
                { href: "/home-affordability-calculator/inflation-adjusted", label: "Home Affordability Calculator"    },
                { href: "/deflation-calculator",                             label: "Deflation Calculator"             },
                { href: "/shrinkflation-calculator",                         label: "Shrinkflation Calculator"         },
                { href: "/skimpflation-calculator",                          label: "Skimpflation Calculator"          },
                { href: "/energy-inflation-calculator",                      label: "Energy Inflation Calculator"      },
                { href: "/subscription-inflation-calculator",                label: "Subscription Inflation Calculator" },
                { href: "/charts",                                           label: "Charts & Analytics"               },
                { href: "/investment-race-calculator",                       label: "Investment Race Calculator"       },
                { href: "/global-compound-interest",                         label: "Compound Interest Calculator"     },
                { href: "/global-net-worth-calculator",                      label: "Global Net Worth Calculator"      },
                { href: "/ppp-calculator",                                   label: "PPP Calculator"                   },
                { href: "/auto-loan-calculator",                             label: "Auto Loan Calculator"             },
                { href: "/salary-calculator",                                label: "Salary Calculator"                },
                { href: "/salary-calculator/regional-cost-of-living",        label: "Regional Cost of Living"          },
                { href: "/retirement-calculator",                            label: "Retirement Calculator"            },
                { href: "/student-loan-calculator",                          label: "Student Loan Calculator"          },
                { href: "/budget-calculator",                                label: "Budget Calculator"                },
                { href: "/emergency-fund-calculator",                        label: "Emergency Fund Calculator"        },
                { href: "/roi-calculator",                                   label: "ROI Calculator"                   },
                { href: "/insurance-inflation-calculator",                   label: "Insurance Inflation Calculator"   },
                { href: "/legacy-planner",                                   label: "Legacy Planner"                   },
                { href: "/education-inflation-calculator",                   label: "Education Inflation Calculator"   },
                { href: "/dateflation-calculator",                           label: "Dateflation Calculator"           },
                { href: "/about",                                            label: "About Us"                         },
                { href: "/privacy",                                          label: "Privacy Policy"                   },
                { href: "/terms",                                            label: "Terms of Service"                 },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-rose-400 transition-colors text-sm">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="text-sm text-gray-500 mt-4">Last Updated: April 2026</p>
          </div>

        </div>
        <div className="border-t border-gray-700 px-8 py-6 text-center">
          <p className="text-sm text-gray-400">&copy; 2026 Global Inflation Calculator. Educational purposes only.</p>
        </div>
      </footer>
    </main>
  )
}
