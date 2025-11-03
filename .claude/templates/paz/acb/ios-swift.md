# iOS Swift App Analysis Template - Implementation Focused

## iOS-Specific Project Overview & Quick Start

**iOS Target Version**: [Check deployment target in Xcode project]
**SwiftUI Framework**: [Detect SwiftUI vs UIKit usage]
**Architecture Pattern**: [MVVM, Environment-Driven, or Custom]
**Development Command**: [Build and run commands for simulator/device]

### iOS Development Setup
```bash
# iOS Development Commands
open [ProjectName].xcodeproj
# OR
open [ProjectName].xcworkspace
xcodebuild -scheme [SchemeName] -destination 'platform=iOS Simulator,name=iPhone 15' build
xcodebuild test -scheme [SchemeName] -destination 'platform=iOS Simulator,name=iPhone 15'
```

## iOS App Implementation Analysis

### App Entry Point - [App.swift filename]
- **Purpose**: iOS app initialization and configuration
- **Key Implementation Details**:
  - **Scene Configuration**: [WindowGroup, DocumentGroup, or Settings setup]
  - **Environment Setup**: [Services injected via environment]
  - **App State Management**: [Global app state initialization]
  - **Deep Linking**: [URL scheme and universal link handling]
- **How to Add Services**: [Step-by-step process for environment injection]

### SwiftUI View Architecture

#### View Categories & Organization
Based on detected view files, analyze each category:

##### [Category 1] Views - [folder/filename]
- **Views Available**:
  - `[ViewName1]`: [Purpose, state management, and navigation]
  - `[ViewName2]`: [Props/bindings and data flow]
  - `[ViewName3]`: [User interaction handling]
- **State Management Pattern**: [@State, @StateObject, @Observable, Environment]
- **Adding New Views**: [How to extend this category with proper patterns]

[Repeat for each view category detected]

## SwiftUI Architecture Implementation Details

### State Management Pattern Analysis
```swift
// Extract actual state management pattern from code
struct ContentView: View {
    @Environment([ServiceName].self) private var service
    @State private var viewState: ViewState = .loading

    enum ViewState {
        case loading
        case loaded([DataType])
        case error(String)
    }
}
```

### Service Injection Implementation
- **Environment Services**: [Services injected via .environment()]
- **Observable Pattern**: [@Observable services vs @StateObject]
- **Dependency Management**: [How services communicate and share state]

### View Composition Pattern
- **Component Hierarchy**: [How views are composed and reused]
- **Data Flow**: [Parent-to-child and child-to-parent communication]
- **Navigation**: [NavigationView, NavigationStack, or TabView usage]

## iOS Service Layer Architecture

### Service Implementation Pattern
```swift
// Example service implementation pattern
@Observable @MainActor
class [ServiceName] {
    private let baseURL = "[API_ENDPOINT]"
    private let session = URLSession.shared

    func [methodName]() async throws -> [ReturnType] {
        // [Actual implementation pattern]
    }
}
```

### Networking Implementation
- **HTTP Client**: [URLSession, Alamofire, or custom implementation]
- **API Integration**: [REST, GraphQL, or custom protocol]
- **Response Handling**: [JSON decoding, error handling patterns]

### Data Persistence
- **Local Storage**: [UserDefaults, Core Data, SwiftData, or FileManager]
- **Caching Strategy**: [In-memory, disk-based, or hybrid caching]
- **Data Models**: [Codable structs, Core Data entities, or SwiftData models]

## iOS User Interface Implementation

### SwiftUI Component Library
- **[Component Category 1]**: [Reusable UI components and their usage]
- **[Component Category 2]**: [Custom modifiers and view extensions]
- **[Component Category 3]**: [Complex UI compositions and layouts]

### Navigation Implementation
```swift
// Navigation pattern used in app
NavigationView {
    // OR NavigationStack {
    [ContentView]()
        .navigationTitle("[Title]")
        .navigationBarTitleDisplayMode(.inline)
}
```

### Animation & Transitions
- **View Transitions**: [Animation patterns and timing]
- **State Changes**: [How UI responds to state updates]
- **Interactive Elements**: [Button animations, gesture handling]

## iOS Platform Integration

### System Framework Usage
- **[Framework 1]**: [How framework is integrated and used]
- **[Framework 2]**: [Platform-specific features implemented]
- **[Framework 3]**: [Permissions and privacy handling]

### Device Capabilities
- **Camera/Photos**: [Image capture and gallery integration]
- **Location Services**: [GPS and location-based features]
- **Biometrics**: [Touch ID, Face ID authentication]
- **Push Notifications**: [Remote and local notification handling]

### Apple Intelligence Integration (if applicable)
```swift
// Apple Intelligence implementation pattern
import FoundationModels

@Observable @MainActor
class AIService {
    @available(iOS 26.0, *)
    private var model: SystemLanguageModel {
        SystemLanguageModel.default
    }

    func generateInsight() async -> String {
        // [AI integration implementation]
    }
}
```

## iOS Testing Implementation

### Test Structure & Organization
```bash
# iOS Testing Commands
xcodebuild test -scheme [SchemeName] -destination 'platform=iOS Simulator,name=iPhone 15'
xcodebuild test -scheme [SchemeName] -testPlan [TestPlan]
```

### Testing Categories
- **Unit Tests**: [Business logic and service testing]
- **UI Tests**: [SwiftUI view testing and automation]
- **Integration Tests**: [API and service integration testing]
- **Snapshot Tests**: [UI appearance and layout testing]

### Test Organization Pattern
```swift
// Test implementation pattern
@MainActor
class [ViewName]Tests: XCTestCase {
    func test[Functionality]() async {
        let view = [ViewName]()
            .environment([ServiceName]())

        // [Testing approach and assertions]
    }
}
```

## iOS Build & Deployment

### Xcode Project Configuration
- **Build Settings**: [Key configuration options and their purposes]
- **Schemes**: [Development, staging, and production schemes]
- **Capabilities**: [App capabilities and entitlements]

### Code Signing & Provisioning
- **Developer Account**: [Team configuration and certificate management]
- **Provisioning Profiles**: [Development and distribution profiles]
- **App Store Connect**: [App metadata and version management]

### Build Optimization
```bash
# Build optimization commands
xcodebuild archive -scheme [SchemeName] -archivePath [Path]
xcodebuild -exportArchive -archivePath [Path] -exportPath [ExportPath] -exportOptionsPlist [Plist]
```

## iOS Development Workflow

### Adding New Features - Step by Step
1. **Model Definition**: [Where to define data models and types]
2. **Service Implementation**: [Service layer for business logic]
3. **View Creation**: [SwiftUI view implementation]
4. **State Management**: [Connecting views to services]
5. **Testing**: [Unit and UI test implementation]
6. **Integration**: [Connecting to existing navigation flow]

### Modifying Existing Features
- **[Feature Type 1]**: [Location and modification approach]
- **[Feature Type 2]**: [State changes and view updates]
- **[Feature Type 3]**: [Service modifications and testing]

### SwiftUI Development Patterns
```swift
// Common development patterns
struct [ViewName]: View {
    @Environment([ServiceName].self) private var service
    @State private var viewState: ViewState = .loading

    var body: some View {
        switch viewState {
        case .loading:
            ProgressView()
        case .loaded(let data):
            [ContentView](data: data)
        case .error(let message):
            [ErrorView](message: message)
        }
        .task {
            await loadData()
        }
    }

    private func loadData() async {
        // [Data loading implementation]
    }
}
```

## iOS Architecture Best Practices

### SwiftUI Design Principles
- **[Principle 1]**: [How it's implemented in this codebase]
- **[Principle 2]**: [Examples from actual view implementations]
- **[Principle 3]**: [Patterns for maintainable SwiftUI code]

### Performance Optimization
- **View Performance**: [Optimization strategies for complex views]
- **Memory Management**: [Efficient data handling and state management]
- **Network Efficiency**: [Caching and background processing]

### Code Organization Strategy
- **File Structure**: [How Swift files are organized]
- **Module Separation**: [Feature-based or layer-based organization]
- **Reusability**: [Component and service reuse patterns]

## iOS Debugging & Troubleshooting

### Xcode Debugging Tools
- **Console Logging**: [How logging is implemented and accessed]
- **Breakpoint Debugging**: [Debug workflow and inspection techniques]
- **Instruments**: [Performance profiling and analysis]

### Common iOS Issues
- **[Issue Category 1]**: [Symptoms and resolution approaches]
- **[Issue Category 2]**: [Configuration and setup problems]
- **[Issue Category 3]**: [Runtime errors and crash debugging]

### SwiftUI Debugging
```swift
// SwiftUI debugging techniques
struct ContentView: View {
    var body: some View {
        [ViewContent]
            .onAppear {
                print("=
 ContentView appeared")
            }
            .background(Color.red) // Layout debugging
    }
}
```

## iOS Integration Points

### External Service Integration
- **[Service 1]**: [How this service is integrated in iOS context]
- **[Service 2]**: [Authentication and API calling patterns]
- **[Service 3]**: [Data synchronization and offline handling]

### Apple Ecosystem Integration
- **iCloud**: [Data synchronization and backup]
- **App Store**: [In-app purchases and subscription management]
- **Widgets**: [Home screen and lock screen widget implementation]
- **Shortcuts**: [Siri Shortcuts and automation integration]

## iOS Version Compatibility

### iOS Version Support
- **Minimum iOS Version**: [Deployment target and feature availability]
- **iOS Feature Adoption**: [How newer iOS features are conditionally used]
- **Backward Compatibility**: [Strategies for supporting older iOS versions]

### SwiftUI Version Compatibility
```swift
// Conditional SwiftUI feature usage
if #available(iOS 26.0, *) {
    // [New SwiftUI features]
} else {
    // [Fallback implementation]
}
```

## iOS Accessibility Implementation

### Accessibility Features
- **VoiceOver Support**: [How accessibility labels and hints are implemented]
- **Dynamic Type**: [Text size adaptation and layout flexibility]
- **Color Accessibility**: [High contrast and color blind support]

### Accessibility Testing
- **Accessibility Inspector**: [Tool usage and testing workflow]
- **VoiceOver Testing**: [Manual testing procedures]
- **Automated Accessibility Tests**: [XCTest accessibility validation]