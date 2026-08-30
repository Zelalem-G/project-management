# Project Management SaaS

A full-stack **multi-tenant project management platform** built for organizations to manage projects, teams, and tasks in a collaborative workspace.

The application goes beyond basic task management by supporting **multiple organizations, team membership, project workflows, task assignment, analytics, comments, and automated background workflows**.

## ✨ Features

* **Authentication & Organizations** — Secure authentication with support for multiple organizations/workspaces and organization switching.
* **Team Management** — Invite and manage organization members and assign work to specific team members.
* **Project Management** — Create and manage projects with descriptions, statuses, timelines, and project-specific workflows.
* **Task Management** — Create, assign, prioritize, and track tasks with due dates, statuses, types, and detailed task views.
* **Calendar & List Views** — Manage tasks through both list and calendar interfaces.
* **Analytics Dashboard** — Monitor projects, completed work, assigned tasks, overdue tasks, and task distributions by status, type, and priority.
* **Task Collaboration** — Discuss tasks through comments and team collaboration.
* **Automated Workflows** — Background processing for task assignment emails, due-date reminders, and authentication-related webhooks.

## 🛠️ Tech Stack

**Frontend:** React, Tailwind CSS

**Backend:** Node.js, Express.js

**Database:** PostgreSQL, Prisma ORM, Neon

**Authentication & Organizations:** Clerk

**Background Jobs:** Inngest

## 🏗️ Architecture

The application follows a full-stack architecture with a React frontend communicating with a Node.js/Express backend through APIs. Prisma manages the relational PostgreSQL database, while Clerk handles authentication and organization management. Inngest handles asynchronous background jobs, webhooks, and automated email workflows.

## 📸 Screenshots
<img width="1804" height="901" alt="Image" src="https://github.com/user-attachments/assets/aa9cf9fc-4010-4a48-b000-86e409da7973" />
<img width="1348" height="959" alt="Image" src="https://github.com/user-attachments/assets/1c7b7147-e9ff-424c-9ec2-54e2abf23759" />
<img width="1838" height="674" alt="Image" src="https://github.com/user-attachments/assets/7af86568-f4e3-4c5c-8c71-734e56494d6e" />
<img width="1786" height="898" alt="Image" src="https://github.com/user-attachments/assets/566f1b25-514d-4412-b978-c05e34cd6985" />
<img width="1833" height="793" alt="Image" src="https://github.com/user-attachments/assets/73064082-0928-47ef-9e0b-e0a591861a32" />
<img width="1456" height="778" alt="Image" src="https://github.com/user-attachments/assets/4eb1407c-7601-4ab2-82f5-ca5a811f430c" />

## 🚀 Getting Started

### Prerequisites

* Node.js
* PostgreSQL database
* Clerk account
* Inngest account

### Installation

```bash
git clone <repository-url>
cd <project-directory>
npm install
```

Configure the required environment variables, initialize the Prisma database, and start the development server using the project's npm scripts.

> Never commit environment variables or secret credentials to the repository.

## 📌 Project Highlights

This project demonstrates practical experience with:

* Multi-tenant SaaS architecture
* REST API development
* Relational database design
* Authentication and organization management
* Team and task workflows
* Background job processing
* Webhook integration
* Automated email workflows
* Data-driven analytics
* Full-stack frontend/backend integration
