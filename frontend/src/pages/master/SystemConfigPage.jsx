import React, { useEffect, useState } from "react";
import { Server, Mail, MessageSquare, HardDrive, Shield, Check } from "lucide-react";
import { masterAdminApi } from "@/api/masterAdmin";
import { useToast } from "@/context/ToastContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { Spinner } from "@/components/shared/Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SystemConfigPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    masterAdminApi
      .getSystemConfig()
      .then(({ data }) => setConfig(data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await masterAdminApi.updateSystemConfig(config);
      toast({ title: "System configuration updated", variant: "success" });
    } catch (err) {
      toast({ title: "Failed to update configuration", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Spinner full />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Configuration & Platform Policies"
        description="Configure SMTP email providers, SMS gateway integrations, storage quotas, academic defaults, and security policies"
      />

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" /> Global SMTP Email Gateway
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>SMTP Host</Label>
                <Input
                  value={config?.smtpHost || ""}
                  onChange={(e) => setConfig({ ...config, smtpHost: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>SMTP Port</Label>
                  <Input
                    type="number"
                    value={config?.smtpPort || 587}
                    onChange={(e) => setConfig({ ...config, smtpPort: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Sender Email Address</Label>
                  <Input
                    value={config?.senderEmail || ""}
                    onChange={(e) => setConfig({ ...config, senderEmail: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SMS & Storage Provider */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Server className="h-4 w-4 text-amber-500" /> Infrastructure Providers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>SMS Gateway Service</Label>
                <Input
                  value={config?.smsGatewayProvider || ""}
                  onChange={(e) => setConfig({ ...config, smsGatewayProvider: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>File Storage Provider</Label>
                <Input
                  value={config?.storageProvider || ""}
                  onChange={(e) => setConfig({ ...config, storageProvider: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Academic & Platform Defaults */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-500" /> Academic Defaults & Maintenance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Default Academic Year</Label>
                  <Input
                    value={config?.defaultAcademicYear || "2026-2027"}
                    onChange={(e) => setConfig({ ...config, defaultAcademicYear: e.target.value })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                  <div>
                    <p className="font-semibold text-sm">Platform Maintenance Mode</p>
                    <p className="text-xs text-muted-foreground">Restrict login access during platform upgrades</p>
                  </div>
                  <Button
                    type="button"
                    variant={config?.maintenanceMode ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => setConfig({ ...config, maintenanceMode: !config?.maintenanceMode })}
                  >
                    {config?.maintenanceMode ? "Enabled" : "Disabled"}
                  </Button>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button type="submit" disabled={submitting}>
                  <Check className="h-4 w-4" />
                  {submitting ? "Saving Config..." : "Save System Configuration"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
