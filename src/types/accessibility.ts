/**
 * Accessibility Type Definitions
 *
 * Comprehensive TypeScript interfaces for WCAG 2.1 AA compliance and accessibility validation.
 * Provides structured types for accessibility metadata, validation results, and compliance tracking.
 */

/**
 * WCAG 2.1 Success Criteria levels
 */
export type WCAGLevel = 'A' | 'AA' | 'AAA';

/**
 * WCAG 2.1 Principles
 */
export type WCAGPrinciple = 'perceivable' | 'operable' | 'understandable' | 'robust';

/**
 * WCAG 2.1 Guidelines
 */
export type WCAGGuideline =
  // Perceivable
  | '1.1' // Text Alternatives
  | '1.2' // Time-based Media
  | '1.3' // Adaptable
  | '1.4' // Distinguishable
  // Operable
  | '2.1' // Keyboard Accessible
  | '2.2' // Enough Time
  | '2.3' // Seizures and Physical Reactions
  | '2.4' // Navigable
  | '2.5' // Input Modalities
  // Understandable
  | '3.1' // Readable
  | '3.2' // Predictable
  | '3.3' // Input Assistance
  // Robust
  | '4.1'; // Compatible

/**
 * Accessibility violation severity levels
 */
export type ViolationSeverity = 'critical' | 'serious' | 'moderate' | 'minor';

/**
 * Accessibility test result status
 */
export type TestResultStatus = 'pass' | 'fail' | 'incomplete' | 'inapplicable';

/**
 * Accessibility validation rule categories
 */
export type RuleCategory =
  | 'color_contrast'
  | 'keyboard_navigation'
  | 'screen_reader'
  | 'focus_management'
  | 'aria_labels'
  | 'semantic_markup'
  | 'form_accessibility'
  | 'media_alternatives'
  | 'responsive_design'
  | 'timing_adjustable';

/**
 * ARIA roles (subset of common roles)
 */
export type AriaRole =
  | 'button'
  | 'link'
  | 'navigation'
  | 'main'
  | 'banner'
  | 'contentinfo'
  | 'complementary'
  | 'search'
  | 'form'
  | 'dialog'
  | 'alertdialog'
  | 'alert'
  | 'status'
  | 'log'
  | 'marquee'
  | 'timer'
  | 'tablist'
  | 'tab'
  | 'tabpanel'
  | 'listbox'
  | 'option'
  | 'combobox'
  | 'menu'
  | 'menuitem'
  | 'menubar'
  | 'tree'
  | 'treeitem'
  | 'grid'
  | 'gridcell'
  | 'row'
  | 'rowgroup'
  | 'columnheader'
  | 'rowheader';

/**
 * Individual accessibility validation result
 */
export interface ValidationResult {
  /** Unique identifier for this validation */
  id: string;

  /** Rule that was tested */
  rule: AccessibilityRule;

  /** Result status */
  status: TestResultStatus;

  /** Violation details (if status is 'fail') */
  violation?: AccessibilityViolation;

  /** Elements that passed the test */
  passedElements?: AccessibilityElement[];

  /** Elements that failed the test */
  failedElements?: AccessibilityElement[];

  /** Elements that couldn't be tested */
  incompleteElements?: AccessibilityElement[];

  /** Test execution metadata */
  metadata: ValidationMetadata;
}

/**
 * Metadata for accessibility validation operations
 */
export interface ValidationMetadata {
  /** When the validation was performed */
  timestamp: string;

  /** Time taken for validation in milliseconds */
  duration: number;

  /** Tool or method used for validation */
  validator: string;

  /** Version of validation tool */
  validatorVersion: string;

  /** Page or component being validated */
  context: string;

  /** Browser/environment information */
  environment: {
    userAgent: string;
    viewport: {
      width: number;
      height: number;
    };
    colorScheme: 'light' | 'dark' | 'auto';
    reducedMotion: boolean;
    highContrast: boolean;
  };

  /** Additional metadata */
  extra?: Record<string, unknown>;
}

/**
 * Accessibility rule definition
 */
export interface AccessibilityRule {
  /** Rule identifier */
  id: string;

  /** Human-readable rule name */
  name: string;

  /** Rule description */
  description: string;

  /** Rule category */
  category: RuleCategory;

  /** WCAG success criteria this rule validates */
  wcagCriteria: WCAGSuccessCriterion[];

  /** Rule severity level */
  severity: ViolationSeverity;

  /** Whether this rule is enabled */
  enabled: boolean;

  /** Rule configuration options */
  options?: Record<string, unknown>;

  /** Help text for fixing violations */
  helpText: string;

  /** URL to more information about this rule */
  helpUrl?: string;

  /** Tags for categorizing rules */
  tags: string[];
}

/**
 * WCAG Success Criterion reference
 */
export interface WCAGSuccessCriterion {
  /** Criterion number (e.g., "1.4.3") */
  number: string;

  /** Criterion title */
  title: string;

  /** WCAG level */
  level: WCAGLevel;

  /** WCAG principle */
  principle: WCAGPrinciple;

  /** WCAG guideline */
  guideline: WCAGGuideline;

  /** URL to WCAG documentation */
  url: string;
}

/**
 * Accessibility violation details
 */
export interface AccessibilityViolation {
  /** Violation identifier */
  id: string;

  /** Severity of the violation */
  severity: ViolationSeverity;

  /** Human-readable violation message */
  message: string;

  /** Detailed explanation of the issue */
  description: string;

  /** How to fix this violation */
  remediation: string;

  /** Elements affected by this violation */
  elements: AccessibilityElement[];

  /** WCAG criteria violated */
  wcagCriteria: WCAGSuccessCriterion[];

  /** Impact assessment */
  impact: ViolationImpact;

  /** Additional violation metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Impact assessment for accessibility violations
 */
export interface ViolationImpact {
  /** Users affected by this violation */
  affectedUsers: UserGroup[];

  /** Assistive technologies impacted */
  assistiveTechnologies: AssistiveTechnology[];

  /** Severity of impact on user experience */
  userExperienceImpact: 'low' | 'medium' | 'high' | 'critical';

  /** Whether violation prevents task completion */
  blocksTaskCompletion: boolean;

  /** Estimated percentage of users affected */
  estimatedUserPercentage?: number;
}

/**
 * User groups that may be affected by accessibility issues
 */
export type UserGroup =
  | 'blind'
  | 'low_vision'
  | 'color_blind'
  | 'deaf'
  | 'hard_of_hearing'
  | 'motor_impairments'
  | 'cognitive_disabilities'
  | 'speech_disabilities'
  | 'photosensitive_epilepsy'
  | 'elderly_users';

/**
 * Assistive technologies
 */
export type AssistiveTechnology =
  | 'screen_reader'
  | 'voice_control'
  | 'switch_navigation'
  | 'eye_tracking'
  | 'keyboard_only'
  | 'screen_magnifier'
  | 'high_contrast'
  | 'captions'
  | 'sign_language';

/**
 * Accessibility element information
 */
export interface AccessibilityElement {
  /** CSS selector for the element */
  selector: string;

  /** Element's HTML source */
  html: string;

  /** Element's accessible name */
  accessibleName?: string;

  /** Element's accessible description */
  accessibleDescription?: string;

  /** Element's ARIA role */
  role?: AriaRole;

  /** Element's ARIA attributes */
  ariaAttributes: Record<string, string>;

  /** Element's position in the page */
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  /** Whether element is visible */
  visible: boolean;

  /** Whether element is focusable */
  focusable: boolean;

  /** Element's tab index */
  tabIndex?: number;

  /** Background and foreground colors */
  colors?: {
    foreground: string;
    background: string;
    contrastRatio?: number;
  };

  /** Parent element information */
  parent?: {
    selector: string;
    role?: AriaRole;
  };

  /** Child elements information */
  children?: Array<{
    selector: string;
    role?: AriaRole;
  }>;
}

/**
 * Comprehensive accessibility report
 */
export interface AccessibilityReport {
  /** Report identifier */
  id: string;

  /** Report metadata */
  metadata: ValidationMetadata;

  /** Overall compliance summary */
  summary: ComplianceSummary;

  /** Individual validation results */
  results: ValidationResult[];

  /** All violations found */
  violations: AccessibilityViolation[];

  /** WCAG compliance status */
  wcagCompliance: WCAGComplianceStatus;

  /** Recommendations for improvement */
  recommendations: AccessibilityRecommendation[];

  /** Report statistics */
  statistics: ReportStatistics;

  /** Configuration used for testing */
  configuration: ValidationConfiguration;
}

/**
 * Compliance summary
 */
export interface ComplianceSummary {
  /** Overall compliance level achieved */
  level: WCAGLevel | 'none';

  /** Total number of tests run */
  totalTests: number;

  /** Number of tests that passed */
  passedTests: number;

  /** Number of tests that failed */
  failedTests: number;

  /** Number of incomplete tests */
  incompleteTests: number;

  /** Number of inapplicable tests */
  inapplicableTests: number;

  /** Total number of violations */
  totalViolations: number;

  /** Violations by severity */
  violationsBySeverity: Record<ViolationSeverity, number>;

  /** Overall compliance percentage */
  compliancePercentage: number;
}

/**
 * WCAG compliance status for different levels
 */
export interface WCAGComplianceStatus {
  /** Level A compliance */
  levelA: {
    compliant: boolean;
    passedCriteria: number;
    totalCriteria: number;
    failedCriteria: WCAGSuccessCriterion[];
  };

  /** Level AA compliance */
  levelAA: {
    compliant: boolean;
    passedCriteria: number;
    totalCriteria: number;
    failedCriteria: WCAGSuccessCriterion[];
  };

  /** Level AAA compliance */
  levelAAA: {
    compliant: boolean;
    passedCriteria: number;
    totalCriteria: number;
    failedCriteria: WCAGSuccessCriterion[];
  };
}

/**
 * Accessibility recommendation
 */
export interface AccessibilityRecommendation {
  /** Recommendation identifier */
  id: string;

  /** Priority level */
  priority: 'critical' | 'high' | 'medium' | 'low';

  /** Short title */
  title: string;

  /** Detailed description */
  description: string;

  /** Steps to implement */
  implementation: string[];

  /** Expected impact */
  impact: string;

  /** Resources for more information */
  resources: Array<{
    title: string;
    url: string;
    type: 'documentation' | 'tool' | 'example' | 'video';
  }>;

  /** Violations this recommendation addresses */
  addressesViolations: string[];

  /** Estimated effort to implement */
  effort: 'low' | 'medium' | 'high';

  /** Technical complexity */
  complexity: 'low' | 'medium' | 'high';
}

/**
 * Report statistics
 */
export interface ReportStatistics {
  /** Total elements tested */
  totalElements: number;

  /** Elements by type */
  elementsByType: Record<string, number>;

  /** Rules by category */
  rulesByCategory: Record<RuleCategory, number>;

  /** Test execution time */
  executionTime: number;

  /** Most common violations */
  commonViolations: Array<{
    rule: string;
    count: number;
    percentage: number;
  }>;

  /** Compliance trend (if historical data available) */
  trend?: {
    previous: ComplianceSummary;
    change: number;
    direction: 'improved' | 'degraded' | 'stable';
  };
}

/**
 * Configuration for accessibility validation
 */
export interface ValidationConfiguration {
  /** Rules to include in validation */
  includedRules: string[];

  /** Rules to exclude from validation */
  excludedRules: string[];

  /** Target WCAG level */
  targetLevel: WCAGLevel;

  /** Additional rule configurations */
  ruleConfigurations: Record<string, Record<string, unknown>>;

  /** Selectors to include in testing */
  includeSelectors?: string[];

  /** Selectors to exclude from testing */
  excludeSelectors?: string[];

  /** Color contrast thresholds */
  colorContrast: {
    normalText: number;
    largeText: number;
    nonTextElements: number;
  };

  /** Timeout for tests in milliseconds */
  timeout: number;

  /** Whether to test hidden elements */
  testHiddenElements: boolean;

  /** Custom tags to filter rules */
  tags?: string[];
}

/**
 * Accessibility testing service interface
 */
export interface AccessibilityValidator {
  /**
   * Validate accessibility of current page or element
   */
  validate(
    target?: Element | Document,
    configuration?: Partial<ValidationConfiguration>
  ): Promise<AccessibilityReport>;

  /**
   * Validate specific accessibility rule
   */
  validateRule(
    ruleId: string,
    target?: Element | Document,
    options?: Record<string, unknown>
  ): Promise<ValidationResult>;

  /**
   * Get available accessibility rules
   */
  getRules(category?: RuleCategory): AccessibilityRule[];

  /**
   * Check WCAG compliance level
   */
  checkWCAGCompliance(
    target?: Element | Document,
    targetLevel?: WCAGLevel
  ): Promise<WCAGComplianceStatus>;

  /**
   * Monitor accessibility in real-time
   */
  startMonitoring(
    callback: (violation: AccessibilityViolation) => void,
    options?: MonitoringOptions
  ): void;

  /**
   * Stop accessibility monitoring
   */
  stopMonitoring(): void;
}

/**
 * Real-time accessibility monitoring options
 */
export interface MonitoringOptions {
  /** How often to check in milliseconds */
  interval: number;

  /** Whether to check on DOM mutations */
  checkOnMutation: boolean;

  /** Whether to check on focus changes */
  checkOnFocusChange: boolean;

  /** Rules to monitor */
  rules?: string[];

  /** Elements to monitor */
  selectors?: string[];

  /** Minimum severity to report */
  minimumSeverity: ViolationSeverity;
}

/**
 * Accessibility annotation for components
 */
export interface AccessibilityAnnotation {
  /** Component identifier */
  componentId: string;

  /** Accessibility requirements */
  requirements: AccessibilityRequirement[];

  /** Known limitations */
  limitations?: string[];

  /** Usage guidelines */
  usageGuidelines: string[];

  /** Keyboard interaction patterns */
  keyboardPatterns?: KeyboardPattern[];

  /** Screen reader announcements */
  screenReaderBehavior?: ScreenReaderBehavior;

  /** Testing instructions */
  testingInstructions: string[];

  /** Last updated timestamp */
  lastUpdated: string;
}

/**
 * Accessibility requirement for components
 */
export interface AccessibilityRequirement {
  /** Requirement identifier */
  id: string;

  /** WCAG criteria this requirement addresses */
  wcagCriteria: WCAGSuccessCriterion[];

  /** Requirement description */
  description: string;

  /** Implementation status */
  status: 'implemented' | 'partial' | 'planned' | 'not_applicable';

  /** Notes about implementation */
  notes?: string;

  /** Testing method */
  testingMethod: 'automated' | 'manual' | 'both';
}

/**
 * Keyboard interaction pattern
 */
export interface KeyboardPattern {
  /** Pattern name */
  name: string;

  /** Key combinations */
  keys: string[];

  /** Expected behavior */
  behavior: string;

  /** Context where pattern applies */
  context?: string;

  /** Whether pattern is optional */
  optional: boolean;
}

/**
 * Screen reader behavior definition
 */
export interface ScreenReaderBehavior {
  /** How component is announced */
  announcement: string;

  /** Navigation instructions */
  navigation?: string;

  /** State changes announcements */
  stateChanges?: Record<string, string>;

  /** Special instructions */
  specialInstructions?: string[];
}

/**
 * Color contrast checker interface
 */
export interface ColorContrastChecker {
  /**
   * Check contrast ratio between two colors
   */
  checkContrast(
    foreground: string,
    background: string
  ): ContrastResult;

  /**
   * Find all contrast violations on page
   */
  findContrastViolations(
    target?: Element | Document,
    threshold?: number
  ): ContrastViolation[];

  /**
   * Suggest accessible color alternatives
   */
  suggestColors(
    originalColor: string,
    backgroundColor: string,
    targetRatio: number
  ): ColorSuggestion[];
}

/**
 * Color contrast check result
 */
export interface ContrastResult {
  /** Contrast ratio */
  ratio: number;

  /** Whether it meets AA standard for normal text */
  passesAA: boolean;

  /** Whether it meets AAA standard for normal text */
  passesAAA: boolean;

  /** Whether it meets AA standard for large text */
  passesAALarge: boolean;

  /** Whether it meets AAA standard for large text */
  passesAAALarge: boolean;

  /** Foreground color */
  foreground: string;

  /** Background color */
  background: string;
}

/**
 * Color contrast violation
 */
export interface ContrastViolation extends AccessibilityViolation {
  /** Contrast ratio found */
  actualRatio: number;

  /** Required ratio for compliance */
  requiredRatio: number;

  /** Colors involved */
  colors: {
    foreground: string;
    background: string;
  };

  /** Text size category */
  textSize: 'normal' | 'large';
}

/**
 * Color suggestion for better accessibility
 */
export interface ColorSuggestion {
  /** Suggested color value */
  color: string;

  /** Color format (hex, rgb, hsl) */
  format: string;

  /** Resulting contrast ratio */
  contrastRatio: number;

  /** WCAG compliance level achieved */
  complianceLevel: WCAGLevel | 'none';

  /** How much the color differs from original */
  similarity: number;
}

/**
 * Type guards for accessibility validation
 */
export const AccessibilityTypeGuards = {
  isValidationResult: (obj: unknown): obj is ValidationResult => {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'id' in obj &&
      'rule' in obj &&
      'status' in obj &&
      'metadata' in obj
    );
  },

  isAccessibilityViolation: (obj: unknown): obj is AccessibilityViolation => {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'id' in obj &&
      'severity' in obj &&
      'message' in obj &&
      'elements' in obj &&
      'wcagCriteria' in obj
    );
  },

  isWCAGLevel: (value: unknown): value is WCAGLevel => {
    return typeof value === 'string' && ['A', 'AA', 'AAA'].includes(value);
  },

  isViolationSeverity: (value: unknown): value is ViolationSeverity => {
    const severities: ViolationSeverity[] = ['critical', 'serious', 'moderate', 'minor'];
    return typeof value === 'string' && severities.includes(value as ViolationSeverity);
  },

  isAriaRole: (value: unknown): value is AriaRole => {
    const roles: AriaRole[] = [
      'button', 'link', 'navigation', 'main', 'banner', 'contentinfo',
      'complementary', 'search', 'form', 'dialog', 'alertdialog', 'alert',
      'status', 'log', 'marquee', 'timer', 'tablist', 'tab', 'tabpanel',
      'listbox', 'option', 'combobox', 'menu', 'menuitem', 'menubar',
      'tree', 'treeitem', 'grid', 'gridcell', 'row', 'rowgroup',
      'columnheader', 'rowheader'
    ];
    return typeof value === 'string' && roles.includes(value as AriaRole);
  }
};

/**
 * Utility functions for accessibility operations
 */
export const AccessibilityUtils = {
  /**
   * Convert hex color to RGB
   */
  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  /**
   * Calculate relative luminance of a color
   */
  getRelativeLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  /**
   * Calculate contrast ratio between two colors
   */
  getContrastRatio(color1: string, color2: string): number | null {
    const rgb1 = AccessibilityUtils.hexToRgb(color1);
    const rgb2 = AccessibilityUtils.hexToRgb(color2);

    if (!rgb1 || !rgb2) return null;

    const l1 = AccessibilityUtils.getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = AccessibilityUtils.getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  },

  /**
   * Generate accessibility report ID
   */
  generateReportId(): string {
    return `a11y_report_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  },

  /**
   * Get WCAG success criteria by level
   */
  getSuccessCriteriaByLevel(_level: WCAGLevel): WCAGSuccessCriterion[] {
    // This would typically be loaded from a configuration file
    // Returning empty array as placeholder - would be populated with actual criteria
    return [];
  },

  /**
   * Check if element is focusable
   */
  isFocusable(element: Element): boolean {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      'details',
      'summary'
    ];

    return focusableSelectors.some(selector =>
      element.matches(selector)
    );
  },

  /**
   * Get accessible name for element
   */
  getAccessibleName(element: Element): string {
    // Simplified implementation - real implementation would follow ARIA specification
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;

    const ariaLabelledby = element.getAttribute('aria-labelledby');
    if (ariaLabelledby) {
      const labelElement = document.getElementById(ariaLabelledby);
      if (labelElement) return labelElement.textContent || '';
    }

    if (element.tagName === 'IMG') {
      return element.getAttribute('alt') || '';
    }

    return element.textContent || '';
  }
};
