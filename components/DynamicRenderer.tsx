/**
 * DynamicRenderer - The Core of Generative UI
 * ============================================
 *
 * This component is THE MAGIC that makes Generative UI work!
 *
 * What it does:
 * -------------
 * 1. Receives JSON from backend: { type: "Button", props: {...} }
 * 2. Looks up the component in a registry
 * 3. Renders the component with the props
 *
 * Flow:
 * -----
 * Backend says: "Render a Button with label='Click Me'"
 *      ↓
 * JSON: { type: "Button", props: { label: "Click Me" } }
 *      ↓
 * DynamicRenderer: "I'll render the Button component!"
 *      ↓
 * <Button label="Click Me" />
 *      ↓
 * User sees: [Click Me] button on screen
 *
 * This is the FOUNDATION of how Propalyst will work!
 */

'use client'

import DynamicButton from './dynamic/DynamicButton'
import DynamicTextarea from './dynamic/DynamicTextarea'
import DynamicCheckboxGroup from './dynamic/DynamicCheckboxGroup'
import DynamicSlider from './dynamic/DynamicSlider'
import DynamicTextInput from './dynamic/DynamicTextInput'
import DynamicButtonGroup from './dynamic/DynamicButtonGroup'

// ============================================================================
// TYPES
// ============================================================================

interface ComponentConfig {
  type: string
  props: Record<string, any>
}

interface DynamicRendererProps {
  config: ComponentConfig
  onSubmit?: (value: string) => void  // For TextInput
  onSelect?: (value: string) => void  // For ButtonGroup
}

// ============================================================================
// COMPONENT REGISTRY
// ============================================================================

/**
 * The Component Registry - Heart of Dynamic Rendering
 *
 * This maps string names → React components
 *
 * When backend says "Button", we look it up here:
 * COMPONENTS["Button"] → DynamicButton component
 *
 * Then we render: <DynamicButton {...props} />
 */
const COMPONENTS: Record<string, React.ComponentType<any>> = {
  // Project 1 components
  Button: DynamicButton,
  TextArea: DynamicTextarea,
  CheckboxGroup: DynamicCheckboxGroup,
  Slider: DynamicSlider,

  // Project 2 components (Propalyst)
  TextInput: DynamicTextInput,
  ButtonGroup: DynamicButtonGroup,
}

// ============================================================================
// DYNAMIC RENDERER COMPONENT
// ============================================================================

export default function DynamicRenderer({ config, onSubmit, onSelect }: DynamicRendererProps) {
  const { type, props } = config

  // Step 1: Look up the component in our registry
  const Component = COMPONENTS[type]

  // Step 2: Prepare props with callbacks
  const componentProps = {
    ...props,
    ...(onSubmit && { onSubmit }),
    ...(onSelect && { onSelect }),
  }

  // Handle unknown component types
  if (!Component) {
    return (
      <div className="text-sm text-red-600">
        Component type "{type}" not found
      </div>
    )
  }

  // Render the component
  return <Component {...componentProps} />
}

// ============================================================================
// HOW TO USE THIS COMPONENT
// ============================================================================

/*
Example usage in your page:

import DynamicRenderer from '@/components/DynamicRenderer'

function MyPage() {
  // This would come from your API
  const componentConfig = {
    type: "Button",
    props: {
      label: "Click Me",
      variant: "primary"
    }
  }

  return (
    <DynamicRenderer config={componentConfig} />
  )
}

// The DynamicRenderer will:
// 1. Look up "Button" in COMPONENTS
// 2. Find DynamicButton
// 3. Render: <DynamicButton label="Click Me" variant="primary" />
*/

// ============================================================================
// KEY LEARNING POINTS
// ============================================================================

/*
1. Component Registry Pattern:
   - Map strings to React components
   - Allows runtime component selection
   - Type-safe with TypeScript

2. Props Spreading:
   - <Component {...props} /> passes all props to the component
   - Flexible - works with any prop structure

3. Error Handling:
   - Gracefully handle unknown component types
   - Show helpful error messages
   - Don't crash the app

4. This pattern is used in:
   - Propalyst (our app!)
   - Form builders
   - CMS systems
   - Low-code platforms
   - Any system where UI is generated dynamically
*/
