import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import slugify from "slugify";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Create categories
  const categories = [
    {
      name: "Businesses for Sale",
      description: "Established businesses available for acquisition",
      image: "/images/categories/businesses_for_sale.png",
      color: "#3B82F6",
    },
    {
      name: "Investment Projects Seeking Capital",
      description: "Startups and projects looking for funding",
      image: "/images/categories/investment_projects.png",
      color: "#10B981",
    },
    {
      name: "Commercial Real Estate",
      description: "Commercial properties, office spaces, and land",
      image: "/images/categories/commercial_real_estate.png",
      color: "#8B5CF6",
    },
    {
      name: "Tourism & Hospitality Assets",
      description: "Hotels, resorts, and tourism businesses",
      image: "/images/categories/tourism_assets.png",
      color: "#F59E0B",
    },
    {
      name: "Agricultural Opportunities",
      description: "Farms, agricultural land, and agribusinesses",
      image: "/images/categories/agricultural_opportunities.png",
      color: "#84CC16",
    },
    {
      name: "Joint Venture Opportunities",
      description: "Partnership and joint venture projects",
      image: "/images/categories/joint_venture.png",
      color: "#06B6D4",
    },
  ];

  console.log("📂 Creating categories...");
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: slugify(category.name, { lower: true }) },
      update: {},
      create: {
        name: category.name,
        slug: slugify(category.name, { lower: true }),
        description: category.description,
        image: category.image,
        color: category.color,
        isActive: true,
        sortOrder: categories.indexOf(category),
      },
    });
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);

  console.log("👤 Creating admin user...");
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@mktimothy.com" },
    update: {
      // Always ensure admin has correct flags, even if the record already existed
      password: hashedPassword,
      role: "ADMIN",
      emailVerified: true,
      isActive: true,
    },
    create: {
      email: "admin@mktimothy.com",
      firstName: "Admin",
      lastName: "User",
      password: hashedPassword,
      role: "ADMIN",
      emailVerified: true,
      isActive: true,
      bio: "System administrator",
      location: "New York, USA",
    },
  });

  // Create sample users
  console.log("👥 Creating sample users...");
  const sampleUsers = [
    {
      email: "john.doe@example.com",
      firstName: "John",
      lastName: "Doe",
      bio: "Business owner and entrepreneur",
      location: "California, USA",
    },
    {
      email: "jane.smith@example.com",
      firstName: "Jane",
      lastName: "Smith",
      bio: "Marketing consultant and blogger",
      location: "Florida, USA",
    },
    {
      email: "mike.johnson@example.com",
      firstName: "Mike",
      lastName: "Johnson",
      bio: "Tech enthusiast and developer",
      location: "Texas, USA",
    },
  ];

  const createdUsers = [];
  for (const userData of sampleUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        password: await bcrypt.hash("password123", 12),
        role: "USER",
        emailVerified: true,
        isActive: true,
      },
    });
    createdUsers.push(user);
  }

  const regularUser = createdUsers[0]; // Use first sample user as regular user

  // Create sample tags
  console.log("🏷️ Creating tags...");
  const tags = [
    "Business",
    "Technology",
    "Innovation",
    "Startup",
    "Marketing",
    "Finance",
    "Healthcare",
    "Education",
    "Travel",
    "Food",
    "Entertainment",
    "Sports",
    "Fashion",
    "Lifestyle",
    "News",
  ];

  for (const tagName of tags) {
    await prisma.tag.upsert({
      where: { slug: slugify(tagName, { lower: true }) },
      update: {},
      create: {
        name: tagName,
        slug: slugify(tagName, { lower: true }),
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      },
    });
  }

  // Create sample filters
  console.log("🔍 Creating filters...");
  const filters = [
    {
      name: "Price Range",
      type: "RANGE",
      options: {
        min: 0,
        max: 10000,
        step: 100,
        currency: "USD",
      },
    },
    {
      name: "Business Type",
      type: "SELECT",
      options: {
        choices: [
          "Small Business",
          "Medium Business",
          "Large Enterprise",
          "Startup",
          "Non-Profit",
        ],
      },
    },
    {
      name: "Location",
      type: "LOCATION",
      options: {
        countries: ["USA", "Canada", "UK", "Australia"],
        states: ["California", "Florida", "Texas", "New York"],
      },
    },
    {
      name: "Services",
      type: "MULTI_SELECT",
      options: {
        choices: [
          "Consultation",
          "Installation",
          "Maintenance",
          "Support",
          "Training",
        ],
      },
    },
  ];

  for (const filter of filters) {
    const filterSlug = slugify(filter.name, { lower: true });
    await prisma.filter.upsert({
      where: { slug: filterSlug },
      update: {},
      create: {
        name: filter.name,
        slug: filterSlug,
        type: filter.type as any,
        options: filter.options,
        isActive: true,
        sortOrder: filters.indexOf(filter),
      },
    });
  }

  // Create sample static pages
  console.log("📄 Creating static pages...");
  const pages = [
    {
      title: "About Us",
      slug: "about",
      content:
        "<h1>About Our Platform</h1><p>We connect businesses with customers through our comprehensive directory platform.</p>",
      type: "ABOUT",
      metaTitle: "About Us - Mk Timothy & Company",
      metaDescription:
        "Learn more about our business directory platform and how we help connect businesses with customers.",
    },
    {
      title: "Privacy Policy",
      slug: "privacy-policy",
      content:
        "<h1>Privacy Policy</h1><p>Your privacy is important to us. This policy explains how we collect and use your data.</p>",
      type: "LEGAL",
      metaTitle: "Privacy Policy - Mk Timothy & Company",
      metaDescription:
        "Read our privacy policy to understand how we protect and use your personal information.",
    },
    {
      title: "Terms of Service",
      slug: "terms-of-service",
      content:
        "<h1>Terms of Service</h1><p>By using our platform, you agree to these terms and conditions.</p>",
      type: "LEGAL",
      metaTitle: "Terms of Service - Mk Timothy & Company",
      metaDescription:
        "Read our terms of service to understand the rules and guidelines for using our platform.",
    },
    {
      title: "Contact Us",
      slug: "contact",
      content:
        "<h1>Contact Us</h1><p>Get in touch with our team for support or inquiries.</p>",
      type: "STATIC",
      metaTitle: "Contact Us - Mk Timothy & Company",
      metaDescription:
        "Contact our support team for help with your account or general inquiries.",
    },
  ];

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: {
        ...page,
        type: page.type as any,
        isActive: true,
      },
    });
  }

  // Create system settings
  console.log("⚙️ Creating system settings...");
  const settings = [
    {
      key: "site_name",
      value: "Mk Timothy & Company",
      type: "string",
    },
    {
      key: "site_description",
      value:
        "Connect with businesses through our comprehensive directory platform",
      type: "string",
    },
    {
      key: "contact_email",
      value: "contact@example.com",
      type: "string",
    },
    {
      key: "max_file_size",
      value: "10485760", // 10MB
      type: "number",
    },
    {
      key: "allowed_file_types",
      value: JSON.stringify([
        "jpg",
        "jpeg",
        "png",
        "gif",
        "pdf",
        "doc",
        "docx",
      ]),
      type: "array",
    },
    {
      key: "enable_user_registration",
      value: "true",
      type: "boolean",
    },
    {
      key: "require_email_verification",
      value: "true",
      type: "boolean",
    },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: {
        key: setting.key,
        value: setting.value,
        type: setting.type,
      },
    });
  }

  console.log("✅ Database seeding completed successfully!");

  // Create sample files
  console.log("📁 Creating sample files...");
  const sampleFiles = [
    {
      filename: "business-logo-1.png",
      originalName: "TechCorp Logo.png",
      mimeType: "image/png",
      size: 245760, // 240KB
      path: "/uploads/logos/business-logo-1.png",
      url: "/uploads/logos/business-logo-1.png",
      alt: "TechCorp company logo",
      uploadedBy: adminUser.id,
    },
    {
      filename: "business-banner-1.jpg",
      originalName: "Healthcare Banner.jpg",
      mimeType: "image/jpeg",
      size: 512000, // 500KB
      path: "/uploads/banners/business-banner-1.jpg",
      url: "/uploads/banners/business-banner-1.jpg",
      alt: "Healthcare services banner",
      uploadedBy: adminUser.id,
    },
    {
      filename: "business-document-1.pdf",
      originalName: "Service Brochure.pdf",
      mimeType: "application/pdf",
      size: 1048576, // 1MB
      path: "/uploads/documents/business-document-1.pdf",
      url: "/uploads/documents/business-document-1.pdf",
      caption: "Company service brochure",
      uploadedBy: adminUser.id,
    },
  ];

  for (const fileData of sampleFiles) {
    await prisma.file.create({
      data: fileData,
    });
  }

  // Create sample search queries
  console.log("🔍 Creating sample search queries...");
  const searchQueries = [
    { query: "healthcare services", results: 15, clicked: true },
    { query: "technology consulting", results: 8, clicked: false },
    { query: "restaurants near me", results: 23, clicked: true },
    { query: "education online", results: 12, clicked: true },
    { query: "banking services", results: 6, clicked: false },
  ];

  for (const queryData of searchQueries) {
    await prisma.searchQuery.create({
      data: {
        ...queryData,
        userId: Math.random() > 0.5 ? adminUser.id : null,
      },
    });
  }

  // Create sample activity logs
  console.log("📊 Creating sample activity logs...");
  const activities = [
    {
      action: "created",
      resource: "listing",
      resourceId: "listing-1",
      metadata: { title: "New Tech Company Listing" },
    },
    {
      action: "updated",
      resource: "blog",
      resourceId: "blog-1",
      metadata: { title: "Updated Blog Post" },
    },
    {
      action: "viewed",
      resource: "listing",
      resourceId: "listing-2",
      metadata: { duration: 45 },
    },
    {
      action: "deleted",
      resource: "comment",
      resourceId: "comment-1",
      metadata: { reason: "spam" },
    },
  ];

  for (const activity of activities) {
    await prisma.activityLog.create({
      data: {
        ...activity,
        userId: adminUser.id,
        ipAddress: "192.168.1.1",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        data: activity.metadata,
      },
    });
  }

  // Create notification preferences for admin user
  console.log("🔔 Creating notification preferences...");
  await prisma.notificationPreference.upsert({
    where: {
      userId: adminUser.id,
    },
    update: {},
    create: {
      userId: adminUser.id,
      emailNewsletter: true,
      emailMarketing: false,
      emailSecurity: true,
      pushMarketing: false,
      pushSecurity: true,
      pushReminders: true,
    },
  });

  // Create enhanced analytics data
  console.log("📈 Creating enhanced analytics data...");
  const analyticsData = [
    {
      event: "page_view",
      category: "page_view",
      source: "organic",
      pageViews: 1,
      uniqueVisitors: 1,
      sessionDuration: 120,
      data: { page: "/listings", referrer: "google.com" },
    },
    {
      event: "listing_view",
      category: "user_action",
      source: "direct",
      pageViews: 1,
      uniqueVisitors: 1,
      sessionDuration: 180,
      data: { listingId: "listing-1", category: "technology" },
    },
    {
      event: "contact_click",
      category: "conversion",
      source: "referral",
      conversionRate: 0.15,
      data: { listingId: "listing-2", contactMethod: "whatsapp" },
    },
    {
      event: "blog_read",
      category: "user_action",
      source: "organic",
      pageViews: 1,
      uniqueVisitors: 1,
      sessionDuration: 300,
      data: { blogId: "blog-1", readPercentage: 85 },
    },
  ];

  for (const analytics of analyticsData) {
    await prisma.analytics.create({
      data: {
        ...analytics,
        userId: Math.random() > 0.3 ? adminUser.id : null,
        sessionId: `session-${Math.random().toString(36).substr(2, 9)}`,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
  }

  console.log("✅ Database seeding completed successfully!");

  // SUBSCRIPTION & BILLING
  // ================================

  console.log("🔄 Creating subscriptions...");

  const subscription = await prisma.subscription.create({
    data: {
      userId: adminUser.id,
      plan: "PREMIUM",
      status: "ACTIVE",
      amount: 29.99,
      currency: "USD",
      billingInterval: "MONTHLY",
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month from now
      stripeCustomerId: "cus_premium_customer_123",
      stripeSubscriptionId: "sub_premium_subscription_123",
    },
  });

  // Create Invoices
  console.log("🔄 Creating invoices...");

  await Promise.all([
    prisma.invoice.create({
      data: {
        subscriptionId: subscription.id,
        invoiceNumber: "INV-2024-001",
        amount: 29.99,
        currency: "USD",
        status: "PAID",
        stripeInvoiceId: "in_paid_invoice_123",
        paymentMethod: "card_visa_4242",
        periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        periodEnd: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000),
        paidAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        items: { subscription: "Premium Plan" },
      },
    }),
    prisma.invoice.create({
      data: {
        subscriptionId: subscription.id,
        invoiceNumber: "INV-2024-002",
        amount: 29.99,
        currency: "USD",
        status: "PENDING",
        stripeInvoiceId: "in_pending_invoice_456",
        paymentMethod: "card_visa_4242",
        periodStart: new Date(),
        periodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        items: { subscription: "Premium Plan" },
      },
    }),
  ]);

  // ================================
  // SUPPORT TICKETS
  // ================================

  console.log("🔄 Creating support tickets...");

  const supportTicket1 = await prisma.supportTicket.create({
    data: {
      userId: regularUser.id,
      ticketNumber: "TICKET-001",
      subject: "WhatsApp Integration Not Working",
      description:
        "I am having trouble connecting my WhatsApp Business account. The API keeps returning authentication errors.",
      category: "TECHNICAL_SUPPORT",
      priority: "HIGH",
      status: "IN_PROGRESS",
      assignedTo: adminUser.id,
    },
  });

  const supportTicket2 = await prisma.supportTicket.create({
    data: {
      userId: regularUser.id,
      ticketNumber: "TICKET-002",
      subject: "Billing Question About Premium Plan",
      description:
        "I want to understand what features are included in the Premium plan and how the billing cycle works.",
      category: "BILLING",
      priority: "MEDIUM",
      status: "RESOLVED",
      assignedTo: adminUser.id,
      resolution:
        "Provided detailed explanation of Premium plan features and billing cycle. Customer satisfied with the response.",
      resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
  });

  // Create Ticket Messages
  console.log("🔄 Creating ticket messages...");

  await Promise.all([
    // Messages for first ticket
    prisma.ticketMessage.create({
      data: {
        ticketId: supportTicket1.id,
        userId: regularUser.id,
        content:
          'I followed the setup guide but keep getting "Invalid API credentials" error when trying to connect.',
        attachments: ["/uploads/error-screenshot.png"],
      },
    }),
    prisma.ticketMessage.create({
      data: {
        ticketId: supportTicket1.id,
        userId: adminUser.id,
        content:
          "Thank you for reporting this issue. Can you please verify that you are using the correct Business Account ID and Access Token?",
        isInternal: false,
      },
    }),
    prisma.ticketMessage.create({
      data: {
        ticketId: supportTicket1.id,
        userId: adminUser.id,
        content:
          "Internal note: Check if the user has the correct permissions on their WhatsApp Business account.",
        isInternal: true,
      },
    }),

    // Messages for second ticket
    prisma.ticketMessage.create({
      data: {
        ticketId: supportTicket2.id,
        userId: regularUser.id,
        content:
          "I am considering upgrading to Premium but want to make sure it includes WhatsApp integration and advanced analytics.",
      },
    }),
    prisma.ticketMessage.create({
      data: {
        ticketId: supportTicket2.id,
        userId: adminUser.id,
        content:
          "Yes, the Premium plan includes full WhatsApp Business integration, advanced analytics, priority support, and up to 50 business listings. The billing is monthly at $29.99/month.",
        isInternal: false,
      },
    }),
  ]);

  console.log("✅ All seed data created successfully!");
  console.log("📊 Summary:");
  console.log("- Business verifications: 1");
  console.log("- Subscriptions: 1");
  console.log("- Invoices: 2");
  console.log("- Support tickets: 2");
  console.log("- Ticket messages: 5");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error during seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
