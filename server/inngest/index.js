import sendEmail from "../configs/nodemailer.js";
import prisma from "../configs/prisma.js";
import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "project management" });

// 1. User Creation
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { data } = event;
    await prisma.user.create({
      data: {
        id: data.id,
        email: data?.email_addresses[0]?.email_address,
        name: data?.first_name + " " + data?.last_name,
        image: data?.image_url,
      },
    });
  },
);

// 2. User Deletion
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { data } = event;
    await prisma.user.delete({
      where: {
        id: data.id,
      },
    });
  },
);

// 3. User Update
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { data } = event;
    await prisma.user.update({
      where: {
        id: data.id,
      },
      data: {
        email: data?.email_addresses[0]?.email_address,
        name: data?.first_name + " " + data?.last_name,
        image: data?.image_url,
      },
    });
  },
);

// 4. Workspace Creation
const syncWorkspaceCreation = inngest.createFunction(
  { id: "sync-workspace-from-clerk" },
  { event: "clerk/organization.created" },
  async ({ event }) => {
    const { data } = event;
    await prisma.workspace.create({
      data: {
        id: data.id,
        name: data.name,
        slug: data.slug,
        ownerId: data.created_by,
        image_url: data.image_url,
      },
    });

    // Add creator as ADMIN member
    await prisma.workspaceMember.create({
      data: {
        userId: data.created_by,
        workspaceId: data.id,
        role: "ADMIN",
      },
    });
  },
);

// 5. Workspace Update
const syncWorkspaceUpdation = inngest.createFunction(
  { id: "update-workspace-from-clerk" },
  { event: "clerk/organization.updated" },
  async ({ event }) => {
    const { data } = event;
    await prisma.workspace.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        slug: data.slug,
        image_url: data.image_url,
      },
    });
  },
);

// 6. Workspace Deletion
const syncWorkspaceDeletion = inngest.createFunction(
  { id: "delete-workspace-with-clerk" },
  { event: "clerk/organization.deleted" },
  async ({ event }) => {
    const { data } = event;
    await prisma.workspace.delete({
      where: {
        id: data.id,
      },
    });
  },
);

// 7. Workspace Member Creation
const syncWorkspaceMemberCreation = inngest.createFunction(
  { id: "sync-workspace-member-from-clerk" },
  { event: "clerk/organizationInvitation.accepted" },
  async ({ event }) => {
    const { data } = event;
    await prisma.workspaceMember.create({
      data: {
        userId: data.user_id,
        workspaceId: data.organization_id,
        role: String(data.role_name).toUpperCase(),
      },
    });
  },
);

// Inngest Function to Send Email on Task Creation
const sendTaskAssignmentEmail = inngest.createFunction(
  { id: "send-task-assignment-mail" },
  { event: "app/task.assigned" },
  async ({ event, step }) => {
    const { taskId, origin } = event.data;

    // Fetch Task & Send Initial Email inside a Step
    const task = await step.run(
      "fetch-task-and-send-initial-email",
      async () => {
        const fetchedTask = await prisma.task.findUnique({
          where: { id: taskId },
          include: { assignee: true, project: true },
        });

        if (!fetchedTask || !fetchedTask.assignee?.email) return null;

        await sendEmail({
          to: fetchedTask.assignee.email,
          subject: `New Task Assignment in ${fetchedTask.project.name}`,
          body: `<div style="max-width: 600px;">
          <h2>Hi ${fetchedTask.assignee.name}, 👋</h2>

          <p style="font-size: 16px;">You've been assigned a new task:</p>
          <p style="font-size: 18px; font-weight: bold; color: #007bff; margin: 8px 0;">${fetchedTask.title}</p>

          <div style="border: 1px solid #ddd; padding: 12px 16px; border-radius: 6px; margin-bottom: 30px;">
            <p style="margin: 6px 0;"><strong>Description:</strong> ${fetchedTask.description}</p>
            <p style="margin: 6px 0;"><strong>Due Date:</strong> ${new Date(fetchedTask.due_date).toLocaleDateString()}</p>
          </div>

          <a href="${origin}" style="background-color: #007bff; padding: 12px 24px; border-radius: 5px; color: #fff; font-weight: 600; font-size: 16px; text-decoration: none;">
            View Task
          </a>

          <p style="margin-top: 20px; font-size: 14px; color: #6c757d;">
            Please make sure to review and complete it before the due date.
          </p>
        </div>`,
        });

        return fetchedTask;
      },
    );

    if (!task || !task.due_date) return;

    // Check if due date is in the future
    const dueDate = new Date(task.due_date);
    if (dueDate > new Date()) {
      // 1. Wait until due date
      await step.sleepUntil("wait-for-the-due-date", dueDate);

      // 2. Check status and send reminder if not DONE (Un-nested step)
      await step.run("check-and-send-reminder-email", async () => {
        const currentTask = await prisma.task.findUnique({
          where: { id: taskId },
          include: { assignee: true, project: true },
        });

        if (
          currentTask &&
          currentTask.status !== "DONE" &&
          currentTask.assignee?.email
        ) {
          await sendEmail({
            to: currentTask.assignee.email,
            subject: `Reminder for ${currentTask.project.name}`,
            body: `<div style="max-width: 600px;">
              <h2>Hi ${currentTask.assignee.name}, 👋</h2>

              <p style="font-size: 16px;">You have a task due in ${currentTask.project.name}:</p>
              <p style="font-size: 18px; font-weight: bold; color: #007bff; margin: 8px 0;">${currentTask.title}</p>

              <div style="border: 1px solid #ddd; padding: 12px 16px; border-radius: 6px; margin-bottom: 30px;">
                <p style="margin: 6px 0;"><strong>Description:</strong> ${currentTask.description}</p>
                <p style="margin: 6px 0;"><strong>Due Date:</strong> ${new Date(currentTask.due_date).toLocaleDateString()}</p>
              </div>

              <a href="${origin}" style="background-color: #007bff; padding: 12px 24px; border-radius: 5px; color: #fff; font-weight: 600; font-size: 16px; text-decoration: none;">
                View Task
              </a>

              <p style="margin-top: 20px; font-size: 14px; color: #6c757d;">
                Please make sure to review and complete it before the due date.
              </p>
            </div>`,
          });
        }
      });
    }
  },
);

// Export all functions
export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  syncWorkspaceCreation,
  syncWorkspaceUpdation,
  syncWorkspaceDeletion,
  syncWorkspaceMemberCreation,
  sendTaskAssignmentEmail,
];
