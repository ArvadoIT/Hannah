/**
 * DOM Utilities
 * Safe DOM manipulation functions to prevent runtime errors
 */

/**
 * Safely removes a child element from its parent
 * @param parent - The parent element
 * @param child - The child element to remove
 * @returns boolean - true if successful, false if failed
 */
export function safeRemoveChild(parent: Node | null, child: Node | null): boolean {
  try {
    // Check if both elements exist
    if (!parent || !child) {
      return false;
    }

    // Check if the child is actually a child of the parent
    if (!parent.contains(child)) {
      return false;
    }

    // Safely remove the child
    parent.removeChild(child);
    return true;
  } catch (error) {
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('DOM Utils: Error removing child element:', error);
    }
    return false;
  }
}

/**
 * Safely appends a child element to a parent
 * @param parent - The parent element
 * @param child - The child element to append
 * @returns boolean - true if successful, false if failed
 */
export function safeAppendChild(parent: Node | null, child: Node | null): boolean {
  try {
    if (!parent || !child) {
      return false;
    }

    parent.appendChild(child);
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('DOM Utils: Error appending child element:', error);
    }
    return false;
  }
}

/**
 * Safely inserts a child element before a reference element
 * @param parent - The parent element
 * @param child - The child element to insert
 * @param reference - The reference element
 * @returns boolean - true if successful, false if failed
 */
export function safeInsertBefore(
  parent: Node | null, 
  child: Node | null, 
  reference: Node | null
): boolean {
  try {
    if (!parent || !child || !reference) {
      return false;
    }

    parent.insertBefore(child, reference);
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('DOM Utils: Error inserting child element:', error);
    }
    return false;
  }
}

/**
 * Safely replaces a child element with a new element
 * @param parent - The parent element
 * @param newChild - The new child element
 * @param oldChild - The old child element to replace
 * @returns boolean - true if successful, false if failed
 */
export function safeReplaceChild(
  parent: Node | null, 
  newChild: Node | null, 
  oldChild: Node | null
): boolean {
  try {
    if (!parent || !newChild || !oldChild) {
      return false;
    }

    parent.replaceChild(newChild, oldChild);
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('DOM Utils: Error replacing child element:', error);
    }
    return false;
  }
}

/**
 * Safely queries for an element by selector
 * @param selector - CSS selector string
 * @param context - Optional context element (defaults to document)
 * @returns Element | null
 */
export function safeQuerySelector(
  selector: string, 
  context: Document | Element = document
): Element | null {
  try {
    return context.querySelector(selector);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('DOM Utils: Error querying selector:', selector, error);
    }
    return null;
  }
}

/**
 * Safely adds an event listener with error handling
 * @param element - The element to add the listener to
 * @param event - The event type
 * @param handler - The event handler function
 * @param options - Optional event listener options
 * @returns boolean - true if successful, false if failed
 */
export function safeAddEventListener(
  element: EventTarget | null,
  event: string,
  handler: EventListener,
  options?: boolean | AddEventListenerOptions
): boolean {
  try {
    if (!element) {
      return false;
    }

    element.addEventListener(event, handler, options);
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('DOM Utils: Error adding event listener:', error);
    }
    return false;
  }
}

/**
 * Safely removes an event listener with error handling
 * @param element - The element to remove the listener from
 * @param event - The event type
 * @param handler - The event handler function
 * @param options - Optional event listener options
 * @returns boolean - true if successful, false if failed
 */
export function safeRemoveEventListener(
  element: EventTarget | null,
  event: string,
  handler: EventListener,
  options?: boolean | EventListenerOptions
): boolean {
  try {
    if (!element) {
      return false;
    }

    element.removeEventListener(event, handler, options);
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('DOM Utils: Error removing event listener:', error);
    }
    return false;
  }
}

/**
 * Checks if we're in a browser environment
 * @returns boolean
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Safely executes a function only in browser environment
 * @param fn - Function to execute
 * @param fallback - Optional fallback value if not in browser
 * @returns The result of the function or fallback value
 */
export function safeBrowserExecute<T>(
  fn: () => T, 
  fallback?: T
): T | undefined {
  if (!isBrowser()) {
    return fallback;
  }

  try {
    return fn();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('DOM Utils: Error executing browser function:', error);
    }
    return fallback;
  }
}
