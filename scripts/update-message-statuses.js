#!/usr/bin/env node

/**
 * Script to periodically update message statuses from WA Sender API
 * Can be run manually or scheduled via cron
 */

const fetch = require("node-fetch");

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const UPDATE_LIMIT = process.env.STATUS_UPDATE_LIMIT || 50;

async function updateMessageStatuses() {
  try {
    console.log("🔄 Starting message status update...");

    // Check how many messages need updates
    const statusResponse = await fetch(
      `${API_BASE_URL}/api/messages/status/batch-update`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!statusResponse.ok) {
      throw new Error(
        `Failed to get status counts: ${statusResponse.statusText}`
      );
    }

    const statusData = await statusResponse.json();
    console.log("📊 Status counts:", statusData.data.statusCounts);
    console.log("📈 Total pending messages:", statusData.data.totalPending);

    if (statusData.data.totalPending === 0) {
      console.log("✅ No messages need status updates");
      return;
    }

    // Update message statuses
    const updateResponse = await fetch(
      `${API_BASE_URL}/api/messages/status/batch-update`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          limit: UPDATE_LIMIT,
          forceUpdate: false,
        }),
      }
    );

    if (!updateResponse.ok) {
      throw new Error(
        `Failed to update statuses: ${updateResponse.statusText}`
      );
    }

    const updateData = await updateResponse.json();
    console.log("✅ Update completed:");
    console.log("  - Processed:", updateData.data.processed);
    console.log("  - Updated:", updateData.data.updated);
    console.log("  - Errors:", updateData.data.errors);

    if (updateData.data.errors > 0) {
      console.log("❌ Errors:", updateData.data.errors);
    }

    return updateData.data;
  } catch (error) {
    console.error("❌ Error updating message statuses:", error.message);
    throw error;
  }
}

// Run the update
if (require.main === module) {
  updateMessageStatuses()
    .then((result) => {
      console.log("🎉 Message status update completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Message status update failed:", error);
      process.exit(1);
    });
}

module.exports = { updateMessageStatuses };
