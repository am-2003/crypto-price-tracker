---
sidebar_position: 4
---

# State Management

## Technology Choices

Our application uses a React Query for state management:

1. **React Query**: For server state

### Why React Query?

We chose React Query for server state management because it:

1. Provides automatic background updates
2. Handles caching and invalidation
3. Manages loading and error states
4. Reduces boilerplate code

Example implementation:

```typescript
// Hook for managing cryptocurrency data
export const useCryptoData = () => {
  return useQuery({
    queryKey: ['crypto'],
    queryFn: fetchCryptoData,
    staleTime: 30000,
  });
};
```
