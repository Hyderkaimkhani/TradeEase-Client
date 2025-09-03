# TradeEase

TradeEase is a multi-tenant supply chain management system with built-in accounting features. It helps companies manage customers, supplies, orders, accounts, and financial transactions in a structured and scalable way. The application supports multiple companies (tenants), each with its own accounts, users, and data separation.

# Features
## Core Supply Chain Modules

**Company Management** – Set up and manage multiple companies (multi-tenant support).

**Customer Management** – Add and manage customers with integrated accounting.

**Supply Management** – Create and track supplies linked to customers.

**Order Management** – Create orders against customers from existing supply (linked via TruckNumber or directly).

**Payments** – Send or receive payments against customers or through accounts.

## Accounting & Finance

**Accounts** – Each company has default virtual accounts (payable & receivable). Users can also create additional accounts.

**Double-Entry Transactions** – Automated debit/credit entries for every customer or account transaction.

**Expense Tracking** – Record and categorize expenses.

**Income Tracking** – Record and categorize income.

**Account Transfers** – Transfer amounts between accounts seamlessly.

**Statements** – Generate statements for customers or accounts for a clear financial view.

## Tech Stack

**Backend:** .NET Core (N-tier architecture → Controllers → Services → Repositories)

**Frontend:** Vue.js (TradeEase-Client)

**Database:** SQL (Database project)

**API Documentation:** Swagger

## Roadmap

### Planned improvements:

Enhanced reporting & analytics dashboards.

Notifications & alerts for key events (e.g., low balance, pending payments).

Role-based access control with fine-grained permissions.

Improved UX for order-to-supply linking workflows.

## Summary

TradeEase is not just a supply chain solution but also an integrated accounting system. From managing companies and customers to handling payments, expenses, and generating statements, it provides businesses with everything they need to manage operations and finances in one place.

