// Supabase Edge Function: reset-teacher-password
// Path: supabase/functions/reset-teacher-password/index.ts
// Invoked by Admin to reset a teacher's password and set must_change_password = true

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // 1. Verify caller is Admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await callerClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized caller" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile, error: profError } = await callerClient
      .from("profiles")
      .select("role, active")
      .eq("id", user.id)
      .single();

    if (profError || !profile || profile.role !== "admin" || !profile.active) {
      return new Response(JSON.stringify({ error: "Caller must be an active administrator" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Parse request payload
    const body = await req.json();
    const { teacher_id, temporary_password } = body;

    if (!teacher_id) {
      return new Response(JSON.stringify({ error: "teacher_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Verify target user is a teacher
    const { data: targetProfile, error: targetError } = await adminClient
      .from("profiles")
      .select("cnic, role")
      .eq("id", teacher_id)
      .single();

    if (targetError || !targetProfile || targetProfile.role !== "teacher") {
      return new Response(JSON.stringify({ error: "Target teacher record not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const newTempPassword = temporary_password || `Reset#${(targetProfile.cnic || "9999").slice(-4)}`;

    // Update Auth user password
    const { error: authUpdateError } = await adminClient.auth.admin.updateUserById(teacher_id, {
      password: newTempPassword,
    });

    if (authUpdateError) {
      return new Response(JSON.stringify({ error: authUpdateError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update must_change_password flag
    const { error: profileUpdateError } = await adminClient
      .from("profiles")
      .update({ must_change_password: true })
      .eq("id", teacher_id);

    if (profileUpdateError) {
      return new Response(JSON.stringify({ error: profileUpdateError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Teacher password reset successfully",
        temporaryPassword: newTempPassword,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
