import React from "react";

export default function WorkspaceOnboardingPanels({
  styles,
  authEnabled = true,
  authUser,
  showAdvancedTools,
  billingLoading,
  setBillingLoading,
  refreshBillingPlans,
  refreshBillingStatus,
  billingStatusData,
  billingPlans,
  billingUpgradeLoading,
  handleUpgradePlan,
  workspaceLoading,
  setWorkspaceLoading,
  refreshWorkspaces,
  refreshWorkspaceMembers,
  workspaceList,
  newWorkspaceName,
  setNewWorkspaceName,
  handleCreateWorkspace,
  workspaceInviteEmail,
  setWorkspaceInviteEmail,
  workspaceInviteRole,
  setWorkspaceInviteRole,
  handleInviteWorkspaceMember,
  workspaceMembers,
  hasGeneratedContent,
  handleScoreVariants,
  variantScoringLoading,
  scoredVariants,
  applyVariantById,
  handleOneClickImprove,
  showGuestAuthPrompt,
  navigateToAuth,
  recommendedNextStep,
  quickStartSteps,
  handleQuickPromptChip,
  handleSmartFillPrompt,
  handlePrimaryGenerateWebsite,
  loading,
  uiDesignLoading,
  businessOsLaunching,
  previewEditableRef,
}) {
  return (
    <>
      {authUser && showAdvancedTools && (
        <section style={styles.authCard}>
          <div style={styles.authHeader}>
            <strong style={styles.authTitle}>Stripe Billing + Plan Gating</strong>
            <button
              type="button"
              style={styles.authGhostButton}
              onClick={async () => {
                setBillingLoading(true);
                try {
                  await Promise.all([refreshBillingPlans(), refreshBillingStatus()]);
                } finally {
                  setBillingLoading(false);
                }
              }}
              disabled={billingLoading}
            >
              {billingLoading ? "Refreshing..." : "Refresh Billing"}
            </button>
          </div>
          {billingStatusData && (
            <small style={styles.authMeta}>
              Current plan: {billingStatusData?.plan?.label || billingStatusData?.subscription?.plan || "Free"} · Daily generations
              left: {billingStatusData?.usage?.generationsRemaining ?? "-"} · Projects: {billingStatusData?.usage?.projectCount ?? "-"}
            </small>
          )}
          <div style={styles.authProjectList}>
            {(billingPlans || []).map((plan) => {
              const isCurrent = String(billingStatusData?.plan?.key || "").toLowerCase() === String(plan?.key || "").toLowerCase();
              return (
                <div key={plan.key} style={styles.billingPlanItem}>
                  <small style={styles.authMeta}>
                    <strong>{plan.label}</strong> · {plan.priceLabel}
                  </small>
                  <small style={styles.authMeta}>
                    {plan.generationLimit}/day · {plan.maxProjects} projects · {plan.maxMembers} members
                  </small>
                  <button
                    type="button"
                    style={isCurrent ? styles.authModeButtonActive : styles.authPrimaryButton}
                    onClick={() => handleUpgradePlan(plan.key)}
                    disabled={billingUpgradeLoading === plan.key || isCurrent}
                  >
                    {isCurrent ? "Current Plan" : billingUpgradeLoading === plan.key ? "Updating..." : "Upgrade"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}
      {authUser && showAdvancedTools && (
        <section style={styles.authCard}>
          <div style={styles.authHeader}>
            <strong style={styles.authTitle}>Team Workspaces & Roles</strong>
            <button
              type="button"
              style={styles.authGhostButton}
              onClick={async () => {
                setWorkspaceLoading(true);
                try {
                  await refreshWorkspaces();
                  await refreshWorkspaceMembers(authUser?.active_workspace_id);
                } finally {
                  setWorkspaceLoading(false);
                }
              }}
              disabled={workspaceLoading}
            >
              {workspaceLoading ? "Refreshing..." : "Refresh Team"}
            </button>
          </div>
          <div style={styles.workspaceRow}>
            <input
              style={styles.solutionInput}
              placeholder="New workspace name"
              value={newWorkspaceName}
              onChange={(event) => setNewWorkspaceName(event.target.value)}
            />
            <button type="button" style={styles.authPrimaryButton} onClick={handleCreateWorkspace} disabled={workspaceLoading}>
              Create Workspace
            </button>
          </div>
          <small style={styles.authMeta}>
            Active workspace: {workspaceList.find((item) => item.id === authUser?.active_workspace_id)?.name || "Default"} · Role:{" "}
            {workspaceList.find((item) => item.id === authUser?.active_workspace_id)?.role || "owner"}
          </small>
          {workspaceList.length > 0 && (
            <div style={styles.workspaceChips}>
              {workspaceList.map((workspace) => (
                <span key={workspace.id} style={styles.purchasedChip}>
                  {workspace.name} ({workspace.role})
                </span>
              ))}
            </div>
          )}
          <div style={styles.workspaceRow}>
            <input
              style={styles.solutionInput}
              type="email"
              placeholder="Invite by email"
              value={workspaceInviteEmail}
              onChange={(event) => setWorkspaceInviteEmail(event.target.value)}
            />
            <select style={styles.solutionSelect} value={workspaceInviteRole} onChange={(event) => setWorkspaceInviteRole(event.target.value)}>
              <option value="admin">admin</option>
              <option value="editor">editor</option>
              <option value="viewer">viewer</option>
            </select>
            <button type="button" style={styles.authPrimaryButton} onClick={handleInviteWorkspaceMember} disabled={workspaceLoading}>
              Invite
            </button>
          </div>
          {workspaceMembers.length > 0 && (
            <div style={styles.authProjectList}>
              {workspaceMembers.slice(0, 8).map((member) => (
                <small key={`${member.user_id}-${member.email}`} style={styles.authProjectItem}>
                  {member.name || member.email} · {member.role}
                </small>
              ))}
            </div>
          )}
        </section>
      )}
      {hasGeneratedContent && showAdvancedTools && (
        <section style={styles.authCard}>
          <div style={styles.authHeader}>
            <strong style={styles.authTitle}>AI Variant Scoring + One-Click Improve</strong>
            <button type="button" style={styles.authPrimaryButton} onClick={handleScoreVariants} disabled={variantScoringLoading}>
              {variantScoringLoading ? "Scoring..." : "Score Variants"}
            </button>
          </div>
          {scoredVariants.length > 0 ? (
            <div style={styles.authProjectList}>
              {scoredVariants.map((variant) => (
                <div key={variant.id} style={styles.variantItem}>
                  <small style={styles.authMeta}>
                    <strong>{variant.name}</strong> · Total {variant?.scores?.total ?? 0}
                  </small>
                  <small style={styles.authMeta}>
                    SEO {variant?.scores?.seo ?? 0} · Conversion {variant?.scores?.conversion ?? 0} · Accessibility {variant?.scores?.accessibility ?? 0}
                  </small>
                  <button type="button" style={styles.authGhostButton} onClick={() => applyVariantById(variant.id)}>
                    Apply Variant
                  </button>
                </div>
              ))}
              <button type="button" style={styles.authPrimaryButton} onClick={handleOneClickImprove}>
                One-Click Improve (Best Variant)
              </button>
            </div>
          ) : (
            <small style={styles.authMeta}>Run scoring to rank generated page variants and apply the best version instantly.</small>
          )}
        </section>
      )}
      {showGuestAuthPrompt && !authUser && authEnabled && (
        <section style={styles.guestPromptCard}>
          <strong style={styles.guestPromptTitle}>Website generated successfully</strong>
          <small style={styles.guestPromptMeta}>
            Create an account to save this project, publish it, and access it from your dashboard anytime.
          </small>
          <div style={styles.guestPromptActions}>
            <button type="button" style={styles.authPrimaryButton} onClick={() => navigateToAuth("/signup")}>
              Create Account
            </button>
            <button type="button" style={styles.authGhostButton} onClick={() => navigateToAuth("/login")}>
              Login
            </button>
          </div>
        </section>
      )}
      <section style={styles.quickStartCard}>
        <div style={styles.quickStartHeader}>
          <div>
            <strong style={styles.quickStartTitle}>Quick Start Guide</strong>
            <small style={styles.quickStartMeta}>Recommended next step: {recommendedNextStep}</small>
          </div>
          <span style={styles.quickStartBadge}>
            {quickStartSteps.filter((item) => item.done).length}/{quickStartSteps.length} complete
          </span>
        </div>
        <div style={styles.quickStartSteps}>
          {quickStartSteps.map((step, index) => (
            <article key={step.key} style={step.done ? styles.quickStartStepDone : styles.quickStartStepPending}>
              <span style={styles.quickStartStepIndex}>{index + 1}</span>
              <div style={styles.quickStartStepContent}>
                <strong style={styles.quickStartStepTitle}>{step.label}</strong>
                <small style={styles.quickStartStepMeta}>{step.done ? "Done" : "Up next"}</small>
              </div>
            </article>
          ))}
        </div>
        <div style={styles.quickStartActions}>
          <button type="button" style={styles.quickStartAction} onClick={() => handleQuickPromptChip("SaaS landing page")}>
            Use Example Prompt
          </button>
          <button type="button" style={styles.quickStartAction} onClick={handleSmartFillPrompt}>
            Fill Missing Details
          </button>
          <button
            type="button"
            style={styles.quickStartActionPrimary}
            onClick={handlePrimaryGenerateWebsite}
            disabled={loading || uiDesignLoading || businessOsLaunching}
          >
            Generate Website
          </button>
          {hasGeneratedContent ? (
            <button
              type="button"
              style={styles.quickStartAction}
              onClick={() => previewEditableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            >
              Jump to Preview
            </button>
          ) : null}
        </div>
      </section>
    </>
  );
}
