# shadcn/ui Setup Guide with MCP

## What is shadcn/ui?

shadcn/ui is a collection of **beautifully designed, accessible components** that you can copy into your project. It's not an npm package - components live in your codebase, giving you full control.

**Benefits:**
- ✅ Production-ready components
- ✅ Fully accessible (ARIA compliant)
- ✅ Customizable with Tailwind CSS
- ✅ TypeScript support
- ✅ No runtime dependencies

## What is MCP Integration?

MCP (Model Context Protocol) allows shadcn/ui to integrate directly with Claude, enabling:
- Component installation through Claude
- Better component suggestions
- Integrated documentation
- Streamlined workflow

## Setup Steps

### Step 1: Initialize shadcn/ui with MCP

```bash
cd projects/01-dynamic-ui-generator/frontend

# Initialize shadcn with MCP for Claude
npx shadcn@latest mcp init --client claude
```

This will:
- Set up the MCP server for shadcn
- Configure Claude integration
- Prepare the project for component installation

### Step 2: Install Required Components

After MCP initialization, install components:

```bash
# Install all required components at once
npx shadcn@latest add button textarea checkbox slider label

# Or install one at a time
npx shadcn@latest add button
npx shadcn@latest add textarea
npx shadcn@latest add checkbox
npx shadcn@latest add slider
npx shadcn@latest add label
```

**What this does:**
- Downloads component files to `components/ui/`
- Installs necessary dependencies
- Sets up utilities in `lib/utils.ts`

### Step 3: Verify Installation

After running the commands, you should see:

```
frontend/
├── components/
│   └── ui/
│       ├── button.tsx      ✅ Installed
│       ├── textarea.tsx    ✅ Installed
│       ├── checkbox.tsx    ✅ Installed
│       ├── slider.tsx      ✅ Installed
│       └── label.tsx       ✅ Installed
├── lib/
│   └── utils.ts            ✅ Auto-created
```

## Using the Components

### Button

```tsx
import { Button } from '@/components/ui/button'

<Button variant="default">Click Me</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
```

### Textarea

```tsx
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

<div>
  <Label htmlFor="message">Your Message</Label>
  <Textarea
    id="message"
    placeholder="Type here..."
    rows={4}
  />
</div>
```

### Checkbox

```tsx
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

<div className="flex items-center space-x-2">
  <Checkbox id="option1" />
  <Label htmlFor="option1">Option 1</Label>
</div>
```

### Slider

```tsx
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'

<div>
  <Label>Select Value: {value}</Label>
  <Slider
    min={0}
    max={100}
    step={1}
    value={[value]}
    onValueChange={(vals) => setValue(vals[0])}
  />
</div>
```

## Integration with Dynamic Renderer

Once installed, we'll create wrapper components that work with our LangGraph agent:

```
components/
├── ui/                      # shadcn components (installed via CLI)
│   ├── button.tsx
│   ├── textarea.tsx
│   ├── checkbox.tsx
│   └── slider.tsx
└── dynamic/                 # Our custom wrappers
    ├── DynamicButton.tsx    # Wraps shadcn Button
    ├── DynamicTextarea.tsx  # Wraps shadcn Textarea
    ├── DynamicCheckbox.tsx  # Wraps shadcn Checkbox
    ├── DynamicSlider.tsx    # Wraps shadcn Slider
    └── DynamicRenderer.tsx  # Maps component type → wrapper
```

## Why This Approach?

1. **shadcn components** = Low-level, flexible, accessible
2. **Our wrappers** = High-level, work with LangGraph output
3. **DynamicRenderer** = Maps agent JSON → React components

## Next Steps

1. Run the installation commands above
2. I'll create the wrapper components
3. I'll create the DynamicRenderer
4. We'll test the full flow!

---

**Ready?** Run the installation commands in your terminal, then let me know when done!
