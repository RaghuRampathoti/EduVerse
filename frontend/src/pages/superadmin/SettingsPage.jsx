import React, { useEffect, useState } from "react";
import { institutionApi } from "@/api/institution";
import { extractErrorMessage } from "@/api/client";
import { useToast } from "@/context/ToastContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { Spinner } from "@/components/shared/Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => {
    institutionApi
      .getMine()
      .then(({ data }) => setForm(data.data))
      .finally(() => setLoading(false));
  }, []);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await institutionApi.updateMine({
        name: form.name,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        country: form.country,
        postalCode: form.postalCode,
        logoUrl: form.logoUrl,
        primaryColor: form.primaryColor,
      });
      setForm(data.data);
      toast({ title: "Settings saved", variant: "success" });
    } catch (err) {
      toast({ title: "Failed to save", description: extractErrorMessage(err), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) return <Spinner full />;

  return (
    <div>
      <PageHeader title="Organization Settings" description="Update your organization's public profile" />
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{form.name}</CardTitle>
          <CardDescription>Code: {form.code} · Type: {form.type}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label>Organization Name</Label>
                <Input value={form.name || ""} onChange={(e) => update("name", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={form.phone || ""} onChange={(e) => update("phone", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Brand Color</Label>
                <Input type="color" value={form.primaryColor || "#4338ca"} onChange={(e) => update("primaryColor", e.target.value)} className="h-9 p-1" />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Address</Label>
                <Input value={form.address || ""} onChange={(e) => update("address", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input value={form.city || ""} onChange={(e) => update("city", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>State</Label>
                <Input value={form.state || ""} onChange={(e) => update("state", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Country</Label>
                <Input value={form.country || ""} onChange={(e) => update("country", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Postal Code</Label>
                <Input value={form.postalCode || ""} onChange={(e) => update("postalCode", e.target.value)} />
              </div>
            </div>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
