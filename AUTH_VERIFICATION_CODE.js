// ============================================================
// AUTH VERIFICATION HELPER — Paste this into the GYMOS builder
// ============================================================
// Add this as a backend function called "verifyAuth" in the GYMOS app.
// Then add the auth check at the top of every data-returning function.
// ============================================================

export default async function (req: any) {
  // Extract Bearer token from Authorization header
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      success: false,
      error: "Unauthorized",
      message: "Missing authentication token"
    };
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    // Decode the base64 token
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split(':');
    if (parts.length < 3) {
      return {
        success: false,
        error: "Unauthorized",
        message: "Invalid token format"
      };
    }

    const userId = parts[0];
    const expiryTimestamp = parseInt(parts[1], 10);
    const email = parts[2];

    // Check if token has expired
    if (isNaN(expiryTimestamp) || Date.now() > expiryTimestamp) {
      return {
        success: false,
        error: "Unauthorized",
        message: "Token has expired"
      };
    }

    return {
      success: true,
      user: {
        id: userId,
        email: email
      }
    };
  } catch (err) {
    return {
      success: false,
      error: "Unauthorized",
      message: "Invalid token"
    };
  }
}

// ============================================================
// HOW TO USE IN OTHER FUNCTIONS:
// ============================================================
// At the top of every data-returning function (getDashboardData, 
// getLeads, getMembers, etc.), add this code:
//
//   // --- Auth Check ---
//   const authHeader = req.headers?.authorization || req.headers?.Authorization;
//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     return { success: false, error: "Unauthorized", message: "Missing authentication token" };
//   }
//   const token = authHeader.replace('Bearer ', '');
//   try {
//     const decoded = Buffer.from(token, 'base64').toString('utf-8');
//     const [userId, expiryStr] = decoded.split(':');
//     const expiry = parseInt(expiryStr, 10);
//     if (isNaN(expiry) || Date.now() > expiry) {
//       return { success: false, error: "Unauthorized", message: "Token has expired" };
//     }
//   } catch {
//     return { success: false, error: "Unauthorized", message: "Invalid token" };
//   }
//   // --- End Auth Check ---
//
// The loginUser and registerUser functions should NOT have this check.
// ============================================================
