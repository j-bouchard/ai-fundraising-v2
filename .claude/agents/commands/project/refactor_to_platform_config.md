---
name: Refactor View to Platform Config Pattern
allowed-tools: Read, Edit, Write
description: Refactor a SwiftUI view to use the configuration-driven platform adaptation pattern
---

# Refactor to Platform Config

Follow the `Workflow` for the `VIEW_FILE_PATH` then `Report` the completed work.

## Variables

VIEW_FILE_PATH: $ARGUMENTS

## Workflow

If no `VIEW_FILE_PATH` is provided, STOP immediately and ask the user to provide it.

### Step 1: Analyze Current View

Read the target view file and identify:

1. **Platform Conditionals**
   - All `#if os(iOS)`, `#if os(macOS)` blocks in the view body
   - `@Environment(\.horizontalSizeClass)` usage
   - `UIDevice.current.userInterfaceIdiom` checks
   - Platform-specific APIs (UIColor, navigationBarTitleDisplayMode, etc.)

2. **Layout Values to Extract**
   - Hard-coded spacing, padding, font sizes
   - Grid column counts, min/max widths
   - Card dimensions, button sizes
   - Any values that vary by platform

3. **View-Specific Needs**
   - Custom layout properties beyond BasePlatformConfig
   - Special platform behaviors (single vs. multi-column layouts)
   - Modal/sheet sizing requirements

### Step 2: Create Configuration Struct

In `/Users/mpaz/workspace/pab-native/pab/pab/Core/Configuration/PlatformConfig.swift`, add a new configuration struct:

```swift
// MARK: - [ViewName] Configuration
/**
 [ViewName]-specific layout configuration with flattened base properties.

 ## Platform Adaptations

 - **iPhone**: [describe iPhone behavior]
 - **iPad**: [describe iPad behavior]
 - **macOS**: [describe macOS behavior]

 ## Flattened Properties

 [List key properties and their purpose]
 */
struct [ViewName]LayoutConfig {
    // MARK: Inherited Base Properties (Flattened)
    let cardPadding: CGFloat
    let cardSpacing: CGFloat
    let cardFontSize: CGFloat
    let headerFontSize: CGFloat
    let buttonControlSize: ControlSize

    // MARK: View-Specific Properties
    // [Add view-specific layout properties here]

    #if os(iOS)
    static func current(_ sizeClass: UserInterfaceSizeClass?) -> Self {
        let base = BasePlatformConfig.current(sizeClass)
        return sizeClass == .regular
            ? Self(  // iPad
                cardPadding: base.cardPadding,
                cardSpacing: base.cardSpacing,
                cardFontSize: base.cardFontSize,
                headerFontSize: base.headerFontSize,
                buttonControlSize: base.buttonControlSize
                // [Add iPad-specific values]
            )
            : Self(  // iPhone
                cardPadding: base.cardPadding,
                cardSpacing: base.cardSpacing,
                cardFontSize: base.cardFontSize,
                headerFontSize: base.headerFontSize,
                buttonControlSize: base.buttonControlSize
                // [Add iPhone-specific values]
            )
    }
    #else
    static var current: Self {
        let base = BasePlatformConfig.current
        return Self(
            cardPadding: base.cardPadding,
            cardSpacing: base.cardSpacing,
            cardFontSize: base.cardFontSize,
            headerFontSize: base.headerFontSize,
            buttonControlSize: base.buttonControlSize
            // [Add macOS-specific values]
        )
    }
    #endif
}
```

### Step 3: Refactor View

Transform the view to use configuration-driven layout:

1. **Add Config Property**
   ```swift
   // MARK: - Platform-Adaptive Configuration

   #if os(iOS)
   @Environment(\.horizontalSizeClass) private var sizeClass

   private var config: [ViewName]LayoutConfig {
       [ViewName]LayoutConfig.current(sizeClass)
   }
   #else
   private var config: [ViewName]LayoutConfig {
       [ViewName]LayoutConfig.current
   }
   #endif
   ```

2. **Replace Platform Conditionals**

   Transform from:
   ```swift
   #if os(iOS)
   if UIDevice.current.userInterfaceIdiom == .pad {
       LazyVGrid(columns: [...]) { ... }
   } else {
       LazyVStack { ... }
   }
   #else
   LazyVGrid(columns: [...]) { ... }
   #endif
   ```

   To:
   ```swift
   if config.useSingleColumnLayout {
       LazyVStack(spacing: config.gridSpacing) { ... }
   } else {
       LazyVGrid(columns: [
           GridItem(.adaptive(
               minimum: config.gridMinWidth,
               maximum: config.gridMaxWidth
           ))
       ], spacing: config.gridSpacing) { ... }
   }
   ```

3. **Replace Hard-Coded Values**
   - `.padding(16)` → `.padding(config.cardPadding)`
   - `.font(.system(size: 14))` → `.font(.system(size: config.cardFontSize))`
   - `.controlSize(.small)` → `.controlSize(config.buttonControlSize)`

4. **Fix Platform-Specific APIs**

   Keep minimal platform conditionals for APIs that don't have cross-platform equivalents:
   ```swift
   #if os(iOS)
   .navigationBarTitleDisplayMode(.large)
   #endif

   #if os(iOS)
   .background(Color(uiColor: .systemGroupedBackground))
   #else
   .background(Color(nsColor: .windowBackgroundColor))
   #endif
   ```

### Step 4: Add Documentation

Add comprehensive doc comments to the view explaining:

1. **Architecture Overview**
   - Reference to configuration-driven pattern
   - Key benefits (testability, maintainability, scalability)

2. **Platform Behaviors**
   - How the view adapts on iPhone, iPad, macOS

3. **Usage Example**
   - Code snippet showing how config drives layout

Follow the documentation style in `ExamLibraryView.swift`.

## Report

After completing the refactor, provide a summary:

```markdown
# View Refactored to Platform Config Pattern

## Changes Made

### Configuration Created
- Added `[ViewName]LayoutConfig` to `PlatformConfig.swift`
- Flattened base properties: [list properties]
- View-specific properties: [list properties]

### View Refactored
- Removed [N] platform conditional blocks from view body
- Replaced [N] hard-coded layout values with config properties
- Added config initialization with platform detection
- Documented architecture and platform behaviors

### Platform Behaviors
- **iPhone**: [describe]
- **iPad**: [describe]
- **macOS**: [describe]

### Files Modified
- `/Users/mpaz/workspace/pab-native/pab/pab/Core/Configuration/PlatformConfig.swift`
- `[VIEW_FILE_PATH]`

## Testing Recommendations

1. Test on iPhone simulator (compact size class)
2. Test on iPad simulator (regular size class)
3. Test on macOS (native build)
4. Verify all layouts adapt correctly
5. Check that no platform conditionals remain in view body (except for platform-specific APIs)

## Next Steps

Consider refactoring related views that share similar layout patterns.
```
