# Android Kotlin App Analysis Template - Implementation Focused

## Android-Specific Project Overview & Quick Start

**Android Target Version**: [Check minSdk and targetSdk in build.gradle]
**UI Framework**: [Detect Jetpack Compose vs View System usage]
**Architecture Pattern**: [MVVM, MVI, Clean Architecture, or Custom]
**Development Command**: [Build and run commands for emulator/device]

### Android Development Setup
```bash
# Android Development Commands
./gradlew assembleDebug
./gradlew installDebug
./gradlew test
./gradlew connectedAndroidTest
# OR with Android Studio
studio .
```

## Android App Implementation Analysis

### App Entry Point - [Application.kt filename]
- **Purpose**: Android app initialization and configuration
- **Key Implementation Details**:
  - **Application Setup**: [Dependency injection, global initialization]
  - **DI Framework**: [Hilt, Koin, Dagger, or Manual DI setup]
  - **App State Management**: [Global app state and repositories]
  - **Deep Linking**: [Intent filters and navigation handling]
- **How to Add Services**: [Step-by-step process for dependency injection]

### Jetpack Compose Architecture

#### Composable Categories & Organization
Based on detected composable files, analyze each category:

##### [Category 1] Composables - [folder/filename]
- **Composables Available**:
  - `[ComposableName1]`: [Purpose, state management, and navigation]
  - `[ComposableName2]`: [Parameters and recomposition triggers]
  - `[ComposableName3]`: [User interaction handling]
- **State Management Pattern**: [remember, rememberSaveable, ViewModel state]
- **Adding New Composables**: [How to extend this category with proper patterns]

[Repeat for each composable category detected]

## Jetpack Compose Architecture Implementation Details

### State Management Pattern Analysis
```kotlin
// Extract actual state management pattern from code
@Composable
fun ContentScreen(
    viewModel: ContentViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    when (uiState) {
        is UiState.Loading -> LoadingScreen()
        is UiState.Success -> SuccessContent(uiState.data)
        is UiState.Error -> ErrorScreen(uiState.message)
    }
}
```

### Dependency Injection Implementation
- **DI Framework**: [Hilt modules, Koin modules, or Dagger components]
- **ViewModel Injection**: [How ViewModels are provided and scoped]
- **Repository Pattern**: [How repositories and data sources are injected]

### Composable Composition Pattern
- **Component Hierarchy**: [How composables are composed and reused]
- **State Hoisting**: [State ownership and event handling patterns]
- **Navigation**: [Navigation Compose or custom navigation implementation]

## Android Service Layer Architecture

### ViewModel Implementation Pattern
```kotlin
// Example ViewModel implementation pattern
@HiltViewModel
class [ViewModelName] @Inject constructor(
    private val repository: [RepositoryName],
    savedStateHandle: SavedStateHandle
) : ViewModel() {

    private val _uiState = MutableStateFlow<UiState>(UiState.Loading)
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    fun [methodName]() {
        viewModelScope.launch {
            // [Actual implementation pattern]
        }
    }
}
```

### Networking Implementation
- **HTTP Client**: [Retrofit, OkHttp, Ktor, or custom implementation]
- **API Integration**: [REST, GraphQL, or custom protocol]
- **Response Handling**: [Kotlin serialization, Gson, Moshi patterns]

### Data Persistence
- **Local Storage**: [Room, DataStore, SharedPreferences]
- **Caching Strategy**: [In-memory, database-based, or hybrid caching]
- **Data Models**: [Entity classes, DTOs, and domain models]

## Android User Interface Implementation

### Jetpack Compose Component Library
- **[Component Category 1]**: [Reusable UI components and their usage]
- **[Component Category 2]**: [Custom modifiers and composition locals]
- **[Component Category 3]**: [Complex UI compositions and layouts]

### Navigation Implementation
```kotlin
// Navigation pattern used in app
@Composable
fun AppNavigation(
    navController: NavHostController = rememberNavController()
) {
    NavHost(
        navController = navController,
        startDestination = Screen.Home.route
    ) {
        composable(Screen.Home.route) { HomeScreen(navController) }
        composable(Screen.Detail.route) { DetailScreen(navController) }
    }
}
```

### Animation & Transitions
- **Compose Animations**: [Animation APIs and transition patterns]
- **State Transitions**: [How UI responds to state updates]
- **Interactive Elements**: [Gesture handling, ripple effects]

## Android Platform Integration

### System Framework Usage
- **[Framework 1]**: [How framework is integrated and used]
- **[Framework 2]**: [Platform-specific features implemented]
- **[Framework 3]**: [Permissions and privacy handling]

### Device Capabilities
- **Camera/Photos**: [CameraX or Camera2 API integration]
- **Location Services**: [Fused Location Provider and GPS features]
- **Biometrics**: [BiometricPrompt authentication]
- **Push Notifications**: [FCM and notification channels]

### Material Design 3 Implementation
```kotlin
// Material 3 theme implementation
@Composable
fun AppTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
```

## Android Testing Implementation

### Test Structure & Organization
```bash
# Android Testing Commands
./gradlew test # Unit tests
./gradlew connectedAndroidTest # Instrumented tests
./gradlew testDebugUnitTest
./gradlew createDebugCoverageReport
```

### Testing Categories
- **Unit Tests**: [Business logic and ViewModel testing]
- **UI Tests**: [Compose testing and Espresso tests]
- **Integration Tests**: [API and repository testing]
- **Screenshot Tests**: [Paparazzi or Shot for visual regression]

### Test Organization Pattern
```kotlin
// Test implementation pattern
@RunWith(AndroidJUnit4::class)
class [ComposableName]Test {
    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun test[Functionality]() {
        composeTestRule.setContent {
            [ComposableName]()
        }

        // [Testing approach and assertions]
        composeTestRule.onNodeWithText("Text").assertIsDisplayed()
    }
}
```

## Android Build & Deployment

### Gradle Configuration
- **Build Variants**: [Debug, release, and custom build types]
- **Product Flavors**: [Different app variants and configurations]
- **Build Scripts**: [Key gradle configurations and their purposes]

### App Signing & Release
- **Signing Config**: [Keystore management and signing configuration]
- **ProGuard/R8**: [Code optimization and obfuscation rules]
- **App Bundle**: [AAB generation and Play Store deployment]

### Build Optimization
```gradle
// Build optimization in build.gradle
android {
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }

    buildFeatures {
        compose true
        buildConfig true
    }
}
```

## Android Development Workflow

### Adding New Features - Step by Step
1. **Data Model Definition**: [Where to define entities and DTOs]
2. **Repository Implementation**: [Data layer for business logic]
3. **ViewModel Creation**: [State management and business logic]
4. **Composable Implementation**: [UI layer with Jetpack Compose]
5. **Testing**: [Unit and UI test implementation]
6. **Navigation Integration**: [Connecting to existing navigation graph]

### Modifying Existing Features
- **[Feature Type 1]**: [Location and modification approach]
- **[Feature Type 2]**: [State changes and UI updates]
- **[Feature Type 3]**: [Repository modifications and testing]

### Jetpack Compose Development Patterns
```kotlin
// Common development patterns
@Composable
fun [ScreenName](
    viewModel: [ViewModelName] = hiltViewModel(),
    onNavigateBack: () -> Unit = {}
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    LaunchedEffect(Unit) {
        viewModel.loadData()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("[Title]") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        when (uiState) {
            is UiState.Loading -> CircularProgressIndicator()
            is UiState.Success -> ContentList(
                data = uiState.data,
                modifier = Modifier.padding(paddingValues)
            )
            is UiState.Error -> ErrorMessage(uiState.message)
        }
    }
}
```

## Android Architecture Best Practices

### Clean Architecture Principles
- **[Layer Separation]**: [How layers are organized in this codebase]
- **[Domain Layer]**: [Use cases and business logic organization]
- **[Data Flow]**: [Unidirectional data flow implementation]

### Performance Optimization
- **Compose Performance**: [Optimization strategies for recomposition]
- **Memory Management**: [Efficient coroutine and flow usage]
- **Network Efficiency**: [Caching and background work with WorkManager]

### Code Organization Strategy
- **Package Structure**: [Feature-based or layer-based organization]
- **Module Separation**: [Multi-module architecture if applicable]
- **Reusability**: [Component and utility sharing patterns]

## Android Debugging & Troubleshooting

### Android Studio Debugging Tools
- **Logcat**: [Logging strategy and filtering techniques]
- **Layout Inspector**: [UI debugging for Compose and View system]
- **Profiler**: [CPU, memory, and network profiling]

### Common Android Issues
- **[Issue Category 1]**: [ANR detection and resolution]
- **[Issue Category 2]**: [Configuration changes and state preservation]
- **[Issue Category 3]**: [Memory leaks and performance issues]

### Compose Debugging
```kotlin
// Compose debugging techniques
@Composable
fun DebugBoundary(
    content: @Composable () -> Unit
) {
    Box(
        modifier = Modifier
            .border(2.dp, Color.Red) // Visual debugging
    ) {
        content()
    }

    // Recomposition tracking
    SideEffect {
        Log.d("Recomposition", "DebugBoundary recomposed")
    }
}
```

## Android Integration Points

### External Service Integration
- **[Service 1]**: [How this service is integrated in Android context]
- **[Service 2]**: [Authentication and API calling patterns]
- **[Service 3]**: [Data synchronization and offline handling]

### Google Services Integration
- **Firebase**: [Analytics, Crashlytics, Remote Config]
- **Play Services**: [Maps, Auth, Billing integration]
- **ML Kit**: [On-device ML features if applicable]

## Android Version Compatibility

### API Level Support
- **Min SDK Version**: [Minimum Android version and feature availability]
- **Target SDK Version**: [Target version and behavior changes]
- **Backward Compatibility**: [AndroidX and support library usage]

### Compose Version Compatibility
```kotlin
// Conditional API usage
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
    // Android 13+ features
    requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS))
} else {
    // Fallback for older versions
}
```

## Android Accessibility Implementation

### Accessibility Features
- **TalkBack Support**: [Content descriptions and accessibility actions]
- **Font Scaling**: [Text size adaptation with sp units]
- **Color Contrast**: [Material Design accessibility guidelines]

### Accessibility Testing
- **Accessibility Scanner**: [Tool usage and issue resolution]
- **TalkBack Testing**: [Manual testing procedures]
- **Automated Tests**: [Compose testing with semantics]

```kotlin
// Accessibility implementation in Compose
@Composable
fun AccessibleButton(
    text: String,
    onClick: () -> Unit
) {
    Button(
        onClick = onClick,
        modifier = Modifier.semantics {
            contentDescription = text
            role = Role.Button
        }
    ) {
        Text(text)
    }
}
```

## Android Modularization Strategy

### Module Structure
- **App Module**: [Main application module responsibilities]
- **Feature Modules**: [Feature-specific modules and boundaries]
- **Core Modules**: [Shared utilities and base classes]
- **Data Modules**: [Repository and data source implementations]

### Module Dependencies
```gradle
// Module dependency configuration
dependencies {
    implementation(project(":core:ui"))
    implementation(project(":core:data"))
    implementation(project(":feature:home"))
    implementation(project(":feature:detail"))
}
```

## Android CI/CD Integration

### Build Automation
- **GitHub Actions/Jenkins**: [CI pipeline configuration]
- **Gradle Tasks**: [Custom build and deployment tasks]
- **Testing Pipeline**: [Automated test execution and reporting]

### Release Management
- **Version Management**: [Version code and name strategies]
- **Play Console**: [App release tracks and staged rollouts]
- **App Distribution**: [Firebase App Distribution or internal testing]