import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sourcePath = path.resolve(__dirname, "../server-data/db.json");

const safeJsonParse = (value, fallback = {}) => {
  try {
    return JSON.parse(String(value || ""));
  } catch {
    return fallback;
  }
};

const readSource = async () => {
  try {
    const raw = await fs.readFile(sourcePath, "utf8");
    const parsed = safeJsonParse(raw, {});
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      websites: Array.isArray(parsed.websites) ? parsed.websites : [],
      workspaces: Array.isArray(parsed.workspaces) ? parsed.workspaces : [],
      workspace_members: Array.isArray(parsed.workspace_members) ? parsed.workspace_members : [],
      subscriptions: Array.isArray(parsed.subscriptions) ? parsed.subscriptions : [],
      generation_events: Array.isArray(parsed.generation_events) ? parsed.generation_events : [],
    };
  } catch {
    return { users: [], projects: [], websites: [], workspaces: [], workspace_members: [], subscriptions: [], generation_events: [] };
  }
};

const prisma = new PrismaClient();

const main = async () => {
  const source = await readSource();
  console.log(
    `Source users=${source.users.length}, projects=${source.projects.length}, websites=${source.websites.length}, workspaces=${source.workspaces.length}`
  );

  for (const user of source.users) {
    await prisma.user.upsert({
      where: { email: String(user.email || "").toLowerCase() },
      update: {
        name: String(user.name || ""),
        password_hash: String(user.password_hash || ""),
        email_verified: Boolean(user.email_verified),
        email_verify_token: user.email_verify_token || null,
        email_verify_expires_at: user.email_verify_expires_at ? new Date(user.email_verify_expires_at) : null,
        password_reset_token: user.password_reset_token || null,
        password_reset_expires_at: user.password_reset_expires_at ? new Date(user.password_reset_expires_at) : null,
        active_workspace_id: user.active_workspace_id || null,
      },
      create: {
        id: String(user.id || ""),
        name: String(user.name || ""),
        email: String(user.email || "").toLowerCase(),
        password_hash: String(user.password_hash || ""),
        email_verified: Boolean(user.email_verified),
        email_verify_token: user.email_verify_token || null,
        email_verify_expires_at: user.email_verify_expires_at ? new Date(user.email_verify_expires_at) : null,
        password_reset_token: user.password_reset_token || null,
        password_reset_expires_at: user.password_reset_expires_at ? new Date(user.password_reset_expires_at) : null,
        active_workspace_id: user.active_workspace_id || null,
        created_at: user.created_at ? new Date(user.created_at) : new Date(),
      },
    });
  }

  for (const project of source.projects) {
    const userId = String(project.user_id || "");
    if (!userId) continue;
    await prisma.project.upsert({
      where: { id: String(project.id || "") },
      update: {
        project_name: String(project.project_name || ""),
        ai_prompt: project.ai_prompt ? String(project.ai_prompt) : null,
      },
      create: {
        id: String(project.id || ""),
        user_id: userId,
        project_name: String(project.project_name || ""),
        ai_prompt: project.ai_prompt ? String(project.ai_prompt) : null,
        created_at: project.created_at ? new Date(project.created_at) : new Date(),
      },
    });
  }

  for (const website of source.websites) {
    const projectId = String(website.project_id || "");
    if (!projectId) continue;
    await prisma.website.upsert({
      where: { id: String(website.id || "") },
      update: {
        html: String(website.html || ""),
        css: String(website.css || ""),
        pages: website.pages && typeof website.pages === "object" ? website.pages : {},
        domain: website.domain ? String(website.domain) : null,
      },
      create: {
        id: String(website.id || ""),
        project_id: projectId,
        html: String(website.html || ""),
        css: String(website.css || ""),
        pages: website.pages && typeof website.pages === "object" ? website.pages : {},
        domain: website.domain ? String(website.domain) : null,
        created_at: website.created_at ? new Date(website.created_at) : new Date(),
      },
    });
  }

  for (const workspace of source.workspaces) {
    if (!workspace?.id || !workspace?.owner_user_id) continue;
    await prisma.workspace.upsert({
      where: { id: String(workspace.id) },
      update: {
        name: String(workspace.name || "Workspace"),
        owner_user_id: String(workspace.owner_user_id),
      },
      create: {
        id: String(workspace.id),
        name: String(workspace.name || "Workspace"),
        owner_user_id: String(workspace.owner_user_id),
        created_at: workspace.created_at ? new Date(workspace.created_at) : new Date(),
      },
    });
  }

  for (const member of source.workspace_members) {
    if (!member?.workspace_id || !member?.user_id) continue;
    await prisma.workspaceMember.upsert({
      where: {
        workspace_id_user_id: {
          workspace_id: String(member.workspace_id),
          user_id: String(member.user_id),
        },
      },
      update: {
        role: String(member.role || "editor"),
      },
      create: {
        id: String(member.id || randomUUID()),
        workspace_id: String(member.workspace_id),
        user_id: String(member.user_id),
        role: String(member.role || "editor"),
        created_at: member.created_at ? new Date(member.created_at) : new Date(),
      },
    });
  }

  for (const subscription of source.subscriptions) {
    if (!subscription?.user_id) continue;
    await prisma.subscription.upsert({
      where: { id: String(subscription.id || "") },
      update: {
        plan: String(subscription.plan || "free"),
        status: String(subscription.status || "active"),
        stripe_customer_id: subscription.stripe_customer_id ? String(subscription.stripe_customer_id) : null,
        stripe_subscription_id: subscription.stripe_subscription_id ? String(subscription.stripe_subscription_id) : null,
      },
      create: {
        id: String(subscription.id || randomUUID()),
        user_id: String(subscription.user_id),
        plan: String(subscription.plan || "free"),
        status: String(subscription.status || "active"),
        stripe_customer_id: subscription.stripe_customer_id ? String(subscription.stripe_customer_id) : null,
        stripe_subscription_id: subscription.stripe_subscription_id ? String(subscription.stripe_subscription_id) : null,
        created_at: subscription.created_at ? new Date(subscription.created_at) : new Date(),
      },
    });
  }

  for (const event of source.generation_events) {
    if (!event?.user_id) continue;
    await prisma.generationEvent.upsert({
      where: { id: String(event.id || "") },
      update: {
        project_name: event.project_name ? String(event.project_name) : null,
      },
      create: {
        id: String(event.id || randomUUID()),
        user_id: String(event.user_id),
        project_name: event.project_name ? String(event.project_name) : null,
        created_at: event.created_at ? new Date(event.created_at) : new Date(),
      },
    });
  }

  console.log("Migration complete.");
};

main()
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
