# Property Search with Gemini Grounding

This implementation uses **Google Gemini with Google Search grounding** to search for rental properties directly from the frontend, eliminating the need for a Python backend.

## Features

- 🔍 **Direct Gemini Integration** - Uses Google's Generative AI SDK with grounding
- 🌐 **Google Search Grounding** - Leverages real-time web search for accurate results
- 🏠 **Multi-Source Search** - Search across magicbricks, housing, 99acres, nobroker, etc.
- ⚡ **No Backend Required** - All processing happens in the Next.js server component
- 🎯 **Type-Safe** - Full TypeScript support

## Setup Instructions

### 1. Get Google AI API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key" or "Get API Key"
4. Copy the generated API key

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your API key to `.env.local`:
   ```env
   NEXT_PUBLIC_GOOGLE_AI_API_KEY=your_actual_api_key_here
   ```

### 3. Install Dependencies

```bash
npm install
```

The `@google/generative-ai` package is already included in package.json.

### 4. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000/search](http://localhost:3000/search)

## How It Works

### Architecture

```
User Input (SearchFilters)
    ↓
URL Parameters (query, sources, provider)
    ↓
SearchResults Component (Server Component)
    ↓
GeminiPropertySearchService
    ↓
Google Gemini API (with Google Search grounding)
    ↓
Parse & Transform Results
    ↓
Display in ResultCard Components
```

### Service Layer

**File**: `lib/services/gemini-property-search.service.ts`

The `GeminiPropertySearchService` class handles:
- Building structured search prompts
- Calling Gemini API with Google Search grounding
- Parsing JSON responses from Gemini
- Transforming results to match the `Property` interface

**Key features**:
- Uses `gemini-2.0-flash-exp` model
- Enables Google Search with `tools: [{ googleSearch: {} }]`
- Extracts property details (title, price, location, type)
- Provides fallback values for missing data

### Components

#### SearchFilters (Client Component)
**File**: `app/search/components/SearchFilters.tsx`

- Interactive filter inputs
- Multi-select data sources (magicbricks, housing, etc.)
- Provider selection (Gemini, Tavily, OpenAI, Google SerpAPI)
- Updates URL parameters on change

#### SearchResults (Server Component)
**File**: `app/search/components/SearchResults.tsx`

- Async server component (no client-side JS)
- Fetches properties using `GeminiPropertySearchService`
- Displays loading state with Suspense
- Shows empty state or results

#### ResultCard (Server Component)
**File**: `app/search/components/ResultCard.tsx`

- Displays individual property card
- Shows image, title, location, price
- Displays bedrooms, bathrooms, area badges

## Usage

### Basic Search

1. Navigate to `/search`
2. Select one or more data sources (e.g., magicbricks, housing)
3. Choose a search provider (Gemini recommended)
4. Enter your query (e.g., "3BHK apartment in Indiranagar Bangalore")
5. Click "Search"

### Example Queries

- "3BHK independent house in Indiranagar under 50000"
- "2BHK apartment in Whitefield Bangalore"
- "Luxury villa in Koramangala"
- "Furnished flat in HSR Layout"

## API Reference

### GeminiPropertySearchService

```typescript
import { GeminiPropertySearchService } from '@/lib/services'

const service = new GeminiPropertySearchService()

const properties = await service.search({
  query: '3BHK apartment in Bangalore',
  sources: 'magicbricks,housing,99acres',
  provider: 'gemini'
})
```

### Property Interface

```typescript
interface Property {
  id: string
  title: string
  location: string
  price: number        // Monthly rent in INR
  bedrooms: number
  bathrooms: number
  area: number        // Square feet
  imageUrl: string
  description: string
}
```

## Debugging

### Enable Detailed Logging

The service includes comprehensive logging:

```typescript
// In gemini-property-search.service.ts
console.log(`[GeminiPropertySearch:${searchId}] 🔍 Searching with:`, request)
console.log(`[GeminiPropertySearch:${searchId}] ✅ Found ${properties.length} properties`)
```

### Check Browser Console

1. Open DevTools (F12)
2. Check Console tab for logs:
   - `🚀 fetchProperties called with:`
   - `📡 About to call GeminiPropertySearchService.search`
   - `✅ Gemini search completed`

### Common Issues

**Issue**: "GOOGLE_AI_API_KEY not configured"
- **Solution**: Add `NEXT_PUBLIC_GOOGLE_AI_API_KEY` to `.env.local`

**Issue**: "No properties found"
- **Solution**: Check if Gemini returned valid JSON, inspect console logs

**Issue**: Duplicate API calls
- **Solution**: This is normal in React Strict Mode (dev only)

## Performance

- **Average Response Time**: 3-5 seconds (depends on Gemini API)
- **Results Per Search**: 10-15 properties (configurable in prompt)
- **Caching**: Server Component caching via Next.js

## Comparison: Gemini vs Python Backend

| Feature | Gemini (JS SDK) | Python Backend |
|---------|----------------|----------------|
| Setup | Simple (API key only) | Complex (FastAPI server) |
| Dependencies | `@google/generative-ai` | Python, FastAPI, LangChain |
| Latency | 3-5s | 4-6s |
| Deployment | Single Next.js app | Two services |
| Scalability | Google's infrastructure | Self-hosted |
| Cost | Pay per API call | Server costs |

## Next Steps

- [ ] Add result caching with Redis or SWR
- [ ] Implement pagination for large result sets
- [ ] Add filters (price range, bedrooms, area)
- [ ] Save favorite properties
- [ ] Add map view with property locations

## Resources

- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API Docs](https://ai.google.dev/gemini-api/docs)
- [Google Search Grounding](https://ai.google.dev/gemini-api/docs/google-search)
- [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

## License

MIT
