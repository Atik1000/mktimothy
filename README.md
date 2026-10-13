# WhatsApp Business Directory

A comprehensive Next.js application for managing business directories with WhatsApp integration, user authentication, blog management, and advanced filtering capabilities.

## 🚀 Features

- **User Management**: Complete authentication system with roles (USER, ADMIN, MODERATOR)
- **Business Listings**: Comprehensive business directory with categories and filters
- **Blog System**: Full-featured blog with tags, categories, and rich content
- **WhatsApp Integration**: Direct WhatsApp communication with businesses
- **Advanced Filtering**: Dynamic filters for better search experience
- **Admin Dashboard**: Complete admin panel for managing content
- **Static Pages**: CMS for managing static content (About, Privacy Policy, etc.)
- **Analytics**: Built-in analytics and tracking
- **Notifications**: Real-time notification system
- **File Management**: Secure file upload and management

## 🛠 Tech Stack

- **Frontend**: Next.js 13, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with JWT
- **File Upload**: Built-in file management system
- **Email**: Nodemailer for transactional emails
- **Validation**: Zod for schema validation

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd whatsapp-business-directory
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Fill in your environment variables:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/whatsapp_directory"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"

   # Email Configuration
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"

   # File Upload
   UPLOAD_DIR="./public/uploads"
   MAX_FILE_SIZE=10485760

   # WhatsApp API (optional)
   WHATSAPP_API_URL="https://api.whatsapp.com"
   WHATSAPP_API_KEY="your-api-key"
   ```

4. **Set up the database**

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Run database migrations
   npm run db:migrate

   # Seed the database with initial data
   npm run db:seed
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Database Schema

The application uses a comprehensive database schema with the following main models:

### Core Models

- **User**: User accounts with authentication and profiles
- **Session**: User session management
- **OtpCode**: One-time password codes for verification
- **Category**: Business categories with hierarchical structure
- **Listing**: Business listings with detailed information
- **Blog**: Blog posts with rich content and SEO
- **Tag**: Tagging system for content organization

### Advanced Features

- **Filter**: Dynamic filtering system
- **Page**: Static page management
- **Chat**: Messaging system between users
- **Notification**: Real-time notifications
- **Analytics**: Usage tracking and statistics
- **Setting**: System configuration management

## 🎯 Usage

### Admin Access

- **Email**: admin@mktimothy.com
- **Password**: admin123

### Sample Users

- **john.doe@example.com** / password123
- **jane.smith@example.com** / password123
- **mike.johnson@example.com** / password123

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database Management
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes to database
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with initial data
npm run db:reset     # Reset database and reseed
```

## 🏗 Project Structure

```
├── app/                    # Next.js 13 app directory
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   ├── api/               # API routes
│   ├── blog/              # Blog pages
│   ├── categories/        # Category pages
│   └── listings/          # Listing pages
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   └── layout/           # Layout components
├── lib/                  # Utility libraries
│   ├── prisma.ts         # Prisma client configuration
│   ├── auth.ts           # Authentication utilities
│   └── utils.ts          # General utilities
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Database schema
│   ├── seed.ts           # Database seeding script
│   └── migrations/       # Database migrations
├── public/               # Static assets
└── types/                # TypeScript type definitions
```

## 🔐 Authentication

The application uses NextAuth.js for authentication with the following features:

- **Email/Password Authentication**: Traditional login system
- **Role-based Access Control**: USER, ADMIN, MODERATOR roles
- **Email Verification**: Required for account activation
- **Password Reset**: Secure password recovery
- **Session Management**: JWT-based sessions

## 📝 Content Management

### Business Listings

- Create and manage business listings
- Categorize businesses with hierarchical categories
- Add contact information, images, and descriptions
- WhatsApp integration for direct communication

### Blog System

- Rich text editor for content creation
- SEO optimization with meta tags
- Tag and category organization
- Featured images and media management

### Static Pages

- Manage About, Privacy Policy, Terms of Service
- Custom page creation with rich content
- SEO-friendly URLs and meta information

## 🔍 Search and Filtering

The application includes a powerful filtering system:

- **Category Filters**: Filter by business categories
- **Location Filters**: Geographic filtering
- **Price Range**: Configurable price filtering
- **Custom Filters**: Dynamic filter creation
- **Search**: Full-text search across listings and content

## 📱 WhatsApp Integration

- Direct WhatsApp links for business communication
- Click-to-chat functionality
- WhatsApp Business API integration (optional)
- Message templates and automation

## 🔧 Configuration

### Environment Variables

| Variable          | Description                  | Required |
| ----------------- | ---------------------------- | -------- |
| `DATABASE_URL`    | PostgreSQL connection string | Yes      |
| `NEXTAUTH_URL`    | Application URL              | Yes      |
| `NEXTAUTH_SECRET` | JWT secret key               | Yes      |
| `SMTP_HOST`       | Email server host            | Yes      |
| `SMTP_PORT`       | Email server port            | Yes      |
| `SMTP_USER`       | Email username               | Yes      |
| `SMTP_PASS`       | Email password               | Yes      |
| `UPLOAD_DIR`      | File upload directory        | No       |
| `MAX_FILE_SIZE`   | Maximum file size in bytes   | No       |

### System Settings

The application includes a settings management system for:

- Site configuration (name, description, contact info)
- File upload limits and allowed types
- User registration settings
- Email verification requirements
- Feature toggles

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set up environment variables in Vercel dashboard
4. Deploy automatically on push

### Docker

```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Database Migration in Production

```bash
# Run migrations
npx prisma migrate deploy

# Generate client
npx prisma generate

# Seed database (optional)
npm run db:seed
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue on GitHub
- Email: support@example.com
- Documentation: [Wiki](https://github.com/your-repo/wiki)

## 🔄 Changelog

### v1.0.0

- Initial release
- Complete authentication system
- Business directory functionality
- Blog management system
- Admin dashboard
- WhatsApp integration
- Advanced filtering system

---

**Built with ❤️ using Next.js and Prisma**
