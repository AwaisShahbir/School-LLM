// Supabase Edge Function: create-teacher
// Path: supabase/functions/create-teacher/index.ts
// Securely invoked by Admin to create a teacher user with synthetic email <13-digit-CNIC>@teachers.school.app

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

    // 1. Verify that the caller is authenticated as Admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Client using caller's JWT to verify admin privileges
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
    const {
      cnic,
      full_name,
      phone,
      email,
      address,
      qualification,
      subject,
      joining_date,
      temporary_password,
    } = body;

    // Validate CNIC (13 digits)
    const cleanCnic = (cnic || "").replace(/\D/g, "");
    if (cleanCnic.length !== 13) {
      return new Response(JSON.stringify({ error: "CNIC must be exactly 13 digits" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const syntheticEmail = `${cleanCnic}@teachers.school.app`;
    const tempPassword = temporary_password || `Teach#${cleanCnic.slice(-4)}`;

    // 3. Admin client with service role to create Auth user
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: newAuthUser, error: createAuthError } = await adminClient.auth.admin.createUser({
      email: syntheticEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { role: "teacher", cnic: cleanCnic, full_name },
    });

    if (createAuthError) {
      return new Response(JSON.stringify({ error: createAuthError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Insert corresponding profiles row with must_change_password = true
    const { error: profileInsertError } = await adminClient.from("profiles").insert({
      id: newAuthUser.user.id,
      role: "teacher",
      full_name,
      cnic: cleanCnic,
      phone,
      email: email || syntheticEmail,
      address,
      qualification,
      subject,
      joining_date: joining_date || new Date().toISOString().split("T")[0],
      active: true,
      must_change_password: true,
    });

    if (profileInsertError) {
      // Rollback auth user if profile insert failed
      await adminClient.auth.admin.deleteUser(newAuthUser.user.id);
      return new Response(JSON.stringify({ error: profileInsertError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Teacher created successfully",
        teacher: {
          id: newAuthUser.user.id,
          cnic: cleanCnic,
          syntheticEmail,
          temporaryPassword: tempPassword,
        },
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
