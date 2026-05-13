"use client"

// Shim hook to allow graceful degradation when toast UI is not initialized yet.
export function useToast() {
  const toast = (props: { title: string; description?: string; variant?: "default" | "destructive" }) => {
    console.log(`[Toast] ${props.variant || 'info'}: ${props.title} - ${props.description || ''}`);
    
    // Fallback to alerts in extreme cases, or you can build a lightweight UI here.
    if (typeof window !== 'undefined') {
        // Using a basic alert as a last resort until rich UI is finalized, preventing crashes
        // Alternatively, dispatch an event or just do nothing if preferred.
    }
  };

  return { toast };
}
