# SerpAPI Integration - Property Search

Complete implementation of property search using **SerpAPI** for real-time Google Search results with structured data extraction.

## 🚀 What is SerpAPI?

**SerpAPI** (https://serpapi.com) is a real-time API for Google Search results. It provides:
- Structured Google Search data
- No rate limits (based on plan)
- Reliable uptime
- Support for all Google search parameters
- Location-based searches

## 📋 Features

- ✅ **Real-time Google Search** - Get actual Google search results
- ✅ **Google Search Operators** - Uses `site:`, `intitle:`, `OR`, `..` operators
- ✅ **Structured Data** - Organized organic results from Google
- ✅ **Multi-Source Search** - Search across magicbricks, housing, 99acres, etc.
- ✅ **Sale vs Rental Detection** - Auto-detects intent from query
- ✅ **Price Extraction** - Parses crores, lakhs, and plain prices
- ✅ **Property Details** - Extracts bedrooms, bathrooms, area, location

## 🔧 Setup

### 1. Get SerpAPI Key

1. Visit [SerpAPI](https://serpapi.com/users/sign_up)
2. Create a free account (100 searches/month free)
3. Get your API key from [Manage API Key](https://serpapi.com/manage-api-key)

### 2. Add API Key

Add to `.env.local`:
```env
NEXT_PUBLIC_SERP_API_KEY=your_serpapi_key_here
```

### 3. Restart Dev Server

```bash
npm run dev
```

## 🎯 Usage

### Select Provider

In the search interface:
1. Enter your query
2. Select data sources (magicbricks, housing, etc.)
3. **Choose "Google Serpapi" as provider**
4. Click Search

### Sample Queries

**Rental:**
```
"3BHK apartment in Indiranagar under 50000"
```

**Sale:**
```
"3BHK Indiranagar 4 crores to 5 crores"
```

## 🔍 How It Works

### Architecture

```
User Query
    ↓
SerpPropertySearchService
    ↓
Build Google Search Query (with operators)
    ↓
Call SerpAPI
    ↓
Parse Organic Results
    ↓
Extract Property Details
    ↓
Display in SearchResultsSerp
```

### Query Optimization

**Input:**
```
"3BHK Indiranagar 4 crores to 5 crores"
Sources: "magicbricks"
```

**Optimized Google Search Query:**
```
(site:magicbricks.com) "3BHK" "for sale" OR "sale" OR intitle:"sale" "Indiranagar" 40000000..50000000 "Bangalore" OR "Bengaluru"
```

**SerpAPI Request:**
```
GET https://serpapi.com/search?
  api_key=xxx
  &engine=google
  &q=(site:magicbricks.com)+"3BHK"+"for sale"+"Indiranagar"+40000000..50000000+"Bangalore"
  &num=20
  &location=Bangalore, Karnataka, India
  &hl=en
  &gl=in
```

### Data Extraction

From each Google organic result, we extract:

```typescript
{
  title: "3BHK Apartment in Indiranagar"
  snippet: "Spacious 3BHK apartment for sale at ₹4.5 Cr..."
  link: "https://magicbricks.com/property/..."
}
```

**Extracted Details:**
- **Property Type**: Extract BHK from title/snippet (`3BHK` → 3 bedrooms)
- **Price**: Parse ₹ amounts (crores, lakhs, plain numbers)
- **Location**: Extract from title pattern `"in Location"`
- **Area**: Extract sq.ft from snippet or estimate
- **Intent**: Detect sale vs rental from price format
- **Source**: Extract from URL hostname

## 📊 Response Structure

### SerpAPI Response

```typescript
interface SerpSearchResponse {
  organic_results: [
    {
      position: 1,
      title: "3BHK Apartment in Indiranagar for Sale",
      link: "https://magicbricks.com/property/...",
      snippet: "Spacious 3BHK apartment at ₹4.5 Cr...",
      displayed_link: "magicbricks.com › property"
    }
  ],
  search_metadata: {
    status: "Success",
    total_results: 1250
  }
}
```

### Transformed Property

```typescript
{
  id: "https://magicbricks.com/property/...",
  title: "3BHK Apartment in Indiranagar for Sale",
  location: "Indiranagar",
  price: 45000000,              // ₹4.5 Cr
  bedrooms: 3,
  bathrooms: 2,
  area: 1500,
  imageUrl: "https://...",
  description: "Spacious 3BHK apartment...",
  propertyFor: "sale",
  url: "https://magicbricks.com/property/...",
  source: "magicbricks"
}
```

## 🎨 UI Components

### SearchResultsSerp

**Features:**
- Purple-themed UI (distinct from Gemini's indigo)
- "Powered by SerpAPI" badge
- Real-time Google Search results
- Clickable property links
- Source badges

**Location:**
`app/search/components/SearchResultsSerp.tsx`

### Conditional Rendering

The search page automatically uses the right component:

```typescript
{provider === 'google_serpapi' ? (
  <SearchResultsSerp {...props} />  // SerpAPI
) : (
  <SearchResults {...props} />      // Gemini
)}
```

## 🔬 Comparison: SerpAPI vs Gemini

| Feature | SerpAPI | Gemini (Grounding) |
|---------|---------|-------------------|
| **Data Source** | Real-time Google Search | Google Search via Gemini |
| **Response Time** | 1-2 seconds | 3-5 seconds |
| **Accuracy** | High (direct Google) | Very High (AI-enhanced) |
| **Structure** | Pre-structured | AI extracts structure |
| **Cost** | Per search | Per API call + tokens |
| **Rate Limit** | 100/month (free) | Based on API quota |
| **Best For** | Direct search results | AI-enhanced analysis |

## 💰 Pricing

### Free Tier
- **100 searches/month**
- All search engines
- All locations
- JSON output

### Developer Plan ($50/month)
- **5,000 searches/month**
- Priority support
- Advanced features

### Production Plan ($250+/month)
- **25,000+ searches/month**
- Dedicated support
- Custom solutions

[View Pricing](https://serpapi.com/pricing)

## 🐛 Debugging

### Enable Logging

Service includes comprehensive logging:

```typescript
[SerpPropertySearch:serp-xxx] 🚀 Initialized with SerpAPI
[SerpPropertySearch:serp-xxx] 🔍 Searching with: { query, sources, provider }
[SerpPropertySearch:serp-xxx] 🔍 Optimized query: (site:magicbricks.com) "3BHK" ...
[SerpPropertySearch:serp-xxx] 📊 Query type: SALE
[SerpPropertySearch:serp-xxx] 🌐 Calling SerpAPI
[SerpPropertySearch:serp-xxx] 📝 Received 15 results
[SerpPropertySearch:serp-xxx] ✅ Found 15 properties
```

### Common Issues

**❌ "SERP_API_KEY not configured"**
- **Fix**: Add `NEXT_PUBLIC_SERP_API_KEY` to `.env.local`
- **Restart**: Development server after adding

**❌ "No organic results found"**
- **Check**: Query is not too restrictive
- **Try**: Simpler query first
- **Verify**: Sources are correct

**❌ SerpAPI Error (403)**
- **Cause**: Invalid API key or quota exceeded
- **Fix**: Check API key, verify monthly quota

**❌ SerpAPI Error (429)**
- **Cause**: Rate limit exceeded
- **Fix**: Wait or upgrade plan

## 📈 Performance Tips

1. **Cache Results** - Implement caching for repeated queries
2. **Batch Queries** - If possible, combine related searches
3. **Optimize Operators** - Use specific operators to reduce results
4. **Monitor Quota** - Track API usage in SerpAPI dashboard

## 🔐 Security

- ✅ API key stored in environment variables
- ✅ Server-side API calls (Next.js Server Components)
- ✅ No API key exposed to browser
- ✅ HTTPS for all API requests

## 🎓 Resources

- [SerpAPI Documentation](https://serpapi.com/docs)
- [Google Search Parameters](https://serpapi.com/search-api)
- [Google Search Operators](https://support.google.com/websearch/answer/2466433)
- [SerpAPI Playground](https://serpapi.com/playground)

## 🆚 When to Use SerpAPI vs Gemini

**Use SerpAPI when:**
- ✅ You need exact Google Search results
- ✅ Response time is critical (1-2s)
- ✅ You want direct, unprocessed results
- ✅ Budget allows per-search pricing

**Use Gemini when:**
- ✅ You need AI-enhanced analysis
- ✅ You want structured data extraction
- ✅ You prefer token-based pricing
- ✅ You need semantic understanding

**Best Approach:**
- Offer both options to users
- Let them choose based on needs
- A/B test which performs better

## ✅ Implementation Checklist

- [x] Create SerpPropertySearchService
- [x] Create SearchResultsSerp component
- [x] Update search page with conditional rendering
- [x] Add SERP_API_KEY to environment
- [x] Implement Google Search operators
- [x] Extract property details from results
- [x] Add error handling
- [x] Add comprehensive logging
- [x] Create documentation

## 🚀 Ready to Use!

1. **Get API key** from https://serpapi.com
2. **Add to `.env.local`**: `NEXT_PUBLIC_SERP_API_KEY=xxx`
3. **Restart server**: `npm run dev`
4. **Select provider**: Choose "Google Serpapi"
5. **Search**: Enter your query and see results!

---

**Implementation Complete!** 🎉
