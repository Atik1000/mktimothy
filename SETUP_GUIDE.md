# WhatsApp Business Directory - Complete Setup Guide

## 🚀 Architecture Overview

This application uses a modern React architecture combining:

- **Redux Toolkit** for global state management
- **React Query** for server state and caching
- **TypeScript** for type safety
- **Custom Hooks** for business logic abstraction

## 📁 Project Structure

```
lib/
├── api/
│   └── client.ts              # Axios HTTP client with interceptors
├── hooks/
│   ├── useAuth.ts            # Authentication management
│   ├── useListings.ts        # Business listings CRUD
│   ├── useWhatsApp.ts        # WhatsApp Business API
│   └── useNotifications.ts   # System notifications
├── providers/
│   └── index.tsx             # Combined Redux + React Query providers
├── react-query/
│   └── queryClient.ts        # React Query configuration
└── redux/
    ├── store.ts              # Redux store configuration
    └── slices/
        ├── authSlice.ts      # Authentication state
        ├── listingSlice.ts   # Listings state
        ├── whatsappSlice.ts  # WhatsApp state
        ├── notificationSlice.ts # Notifications state
        └── uiSlice.ts        # UI state
```

## 🛠️ Installation & Setup

### 1. Install Dependencies

```bash
npm install @reduxjs/toolkit react-redux @tanstack/react-query @tanstack/react-query-devtools axios
```

### 2. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3. Wrap Your App

Update `app/layout.tsx`:

```tsx
import { Providers } from "@/lib/providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

## 🎯 Usage Examples

### Authentication

```tsx
"use client";

import { useAuth } from "@/lib/hooks/useAuth";

export default function LoginPage() {
  const {
    login,
    register,
    logout,
    user,
    isAuthenticated,
    isLoggingIn,
    loginError,
  } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login({ email, password, remember: true });
      // User is now logged in
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <h1>Welcome, {user?.firstName}!</h1>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            handleLogin(
              formData.get("email") as string,
              formData.get("password") as string
            );
          }}
        >
          <input name="email" type="email" placeholder="Email" required />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
          />
          <button type="submit" disabled={isLoggingIn}>
            {isLoggingIn ? "Logging in..." : "Login"}
          </button>
          {loginError && <p className="error">{loginError.message}</p>}
        </form>
      )}
    </div>
  );
}
```

### Business Listings

```tsx
"use client";

import { useListings } from "@/lib/hooks/useListings";

export default function ListingsPage() {
  const {
    listings,
    isLoading,
    createListing,
    searchListings,
    applyFilters,
    viewListing,
    isCreating,
  } = useListings();

  const handleCreateListing = async () => {
    try {
      await createListing({
        title: "My Business",
        description: "Business description",
        businessName: "My Company",
        businessType: "Service",
        categoryId: "cat-1",
        contact: {
          phone: "+1234567890",
          email: "contact@business.com",
        },
        features: ["Feature 1", "Feature 2"],
        tags: ["tag1", "tag2"],
      });
    } catch (error) {
      console.error("Failed to create listing:", error);
    }
  };

  return (
    <div>
      <h1>Business Directory</h1>

      <button onClick={handleCreateListing} disabled={isCreating}>
        {isCreating ? "Creating..." : "Add Business"}
      </button>

      <input
        type="text"
        placeholder="Search businesses..."
        onChange={(e) => searchListings(e.target.value)}
      />

      {isLoading ? (
        <p>Loading listings...</p>
      ) : (
        <div className="listings-grid">
          {listings.map((listing) => (
            <div key={listing.id} className="listing-card">
              <h3>{listing.title}</h3>
              <p>{listing.description}</p>
              <button onClick={() => viewListing(listing.id)}>
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### WhatsApp Integration

```tsx
"use client";

import { useWhatsApp } from "@/lib/hooks/useWhatsApp";

export default function WhatsAppDashboard() {
  const {
    businesses,
    currentBusiness,
    conversations,
    messages,
    selectBusiness,
    selectConversation,
    sendMessage,
    isSendingMessage,
  } = useWhatsApp();

  const handleSendMessage = async (content: string) => {
    if (!currentConversation) return;

    try {
      await sendMessage({
        conversationId: currentConversation.id,
        type: "TEXT",
        content,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="whatsapp-dashboard">
      <div className="sidebar">
        <h2>Businesses</h2>
        {businesses.map((business) => (
          <div
            key={business.id}
            className={`business-item ${
              currentBusiness?.id === business.id ? "active" : ""
            }`}
            onClick={() => selectBusiness(business)}
          >
            {business.businessName}
          </div>
        ))}

        <h2>Conversations</h2>
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className="conversation-item"
            onClick={() => selectConversation(conversation)}
          >
            <strong>{conversation.contactName}</strong>
            <p>{conversation.lastMessage?.content}</p>
          </div>
        ))}
      </div>

      <div className="chat-area">
        <div className="messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.direction.toLowerCase()}`}
            >
              <p>{message.content}</p>
              <small>{new Date(message.timestamp).toLocaleTimeString()}</small>
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const content = formData.get("message") as string;
            if (content.trim()) {
              handleSendMessage(content);
              e.target.reset();
            }
          }}
        >
          <input
            name="message"
            type="text"
            placeholder="Type a message..."
            disabled={isSendingMessage}
          />
          <button type="submit" disabled={isSendingMessage}>
            {isSendingMessage ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
```

### Notifications

```tsx
"use client";

import { useNotifications } from "@/lib/hooks/useNotifications";

export default function NotificationsPanel() {
  const {
    notifications,
    unreadCount,
    markNotificationsAsRead,
    deleteSelectedNotifications,
    getUnreadNotifications,
  } = useNotifications();

  const unreadNotifications = getUnreadNotifications();

  return (
    <div className="notifications-panel">
      <h2>Notifications ({unreadCount})</h2>

      <div className="actions">
        <button
          onClick={() =>
            markNotificationsAsRead(unreadNotifications.map((n) => n.id))
          }
          disabled={unreadCount === 0}
        >
          Mark All as Read
        </button>
      </div>

      <div className="notifications-list">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`notification ${!notification.isRead ? "unread" : ""}`}
          >
            <div className="notification-header">
              <h4>{notification.title}</h4>
              <span
                className={`priority ${notification.priority.toLowerCase()}`}
              >
                {notification.priority}
              </span>
            </div>
            <p>{notification.message}</p>
            <small>{new Date(notification.createdAt).toLocaleString()}</small>

            <div className="notification-actions">
              {!notification.isRead && (
                <button
                  onClick={() => markNotificationsAsRead([notification.id])}
                >
                  Mark as Read
                </button>
              )}
              <button
                onClick={() => deleteSelectedNotifications([notification.id])}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 🔧 Advanced Features

### Custom Query Keys

```tsx
import { queryKeys } from "@/lib/react-query/queryClient";

// Use predefined query keys for consistency
const { data } = useQuery({
  queryKey: queryKeys.listings.detail("listing-id"),
  queryFn: () => fetchListing("listing-id"),
});
```

### Cache Management

```tsx
import { invalidateQueries } from "@/lib/react-query/queryClient";

// Invalidate specific cache sections
const handleUpdate = async () => {
  await updateListing(data);
  invalidateQueries.listings(); // Refresh all listing queries
};
```

### Error Handling

```tsx
const { error, isError } = useListings();

if (isError) {
  return <div className="error">Error: {error?.message}</div>;
}
```

## 🎨 State Management Patterns

### Redux for UI State

```tsx
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import { openModal, setTheme } from "@/lib/redux/slices/uiSlice";

const dispatch = useAppDispatch();
const { theme, modals } = useAppSelector((state) => state.ui);

// Update UI state
dispatch(openModal("loginModal"));
dispatch(setTheme("dark"));
```

### React Query for Server State

```tsx
// Automatic caching, background updates, and error handling
const {
  data: listings,
  isLoading,
  error,
} = useQuery({
  queryKey: ["listings"],
  queryFn: fetchListings,
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

## 🚀 Production Considerations

1. **Environment Variables**: Set up proper API URLs for production
2. **Error Boundaries**: Implement React error boundaries
3. **Loading States**: Use skeleton loaders for better UX
4. **Offline Support**: Configure React Query for offline scenarios
5. **Performance**: Use React.memo and useMemo for expensive operations

## 📚 API Endpoints Expected

Your backend should implement these endpoints:

```
# Authentication
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET  /api/auth/profile

# Listings
GET    /api/listings
POST   /api/listings
GET    /api/listings/:id
PATCH  /api/listings/:id
DELETE /api/listings/:id

# WhatsApp
GET  /api/whatsapp/businesses
GET  /api/whatsapp/businesses/:id/conversations
POST /api/whatsapp/conversations/:id/messages
GET  /api/whatsapp/businesses/:id/templates

# Notifications
GET   /api/notifications
PATCH /api/notifications/mark-read
GET   /api/notifications/settings
```

## 🎯 Next Steps

1. Implement your API endpoints
2. Add form validation with libraries like React Hook Form
3. Implement real-time features with WebSockets
4. Add comprehensive error boundaries
5. Set up monitoring and analytics

Your WhatsApp Business Directory is now ready with a complete, production-ready state management architecture! 🎉
