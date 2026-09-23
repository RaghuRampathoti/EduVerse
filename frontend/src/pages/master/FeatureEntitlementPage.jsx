import React, { useEffect, useState } from "react";
import { SlidersHorizontal, Check, X, Shield, Layers } from "lucide-react";
import { masterAdminApi } from "@/api/masterAdmin";
import { useToast } from "@/context/ToastContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { Spinner } from "@/components/shared/Spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export default function FeatureEntitlementPage() {
  const { toast } = useToast();
  const [entitlements, setEntitlements] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    masterAdminApi
      .getFeatureEntitlements()
      .then(({ data }) => setEntitlements(data.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleToggle(id, currentStatus) {
    try {
      await masterAdminApi.updateFeatureEntitlement(id, { enabled: !currentStatus });
      toast({ title: "Feature entitlement updated", variant: "success" });
      load();
    } catch (err) {
      toast({ title: "Failed to update entitlement", variant: "destructive" });
    }
  }

  if (loading) return <Spinner full />;

  const planTiers = ["FREE_TRIAL", "BASIC", "STANDARD", "PREMIUM", "ENTERPRISE"];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feature Entitlements & Module Controls"
        description="Enable or disable specific platform feature modules according to subscription plan tiers or custom organization overrides"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" /> Master Feature Access Matrix
          </CardTitle>
          <CardDescription>
            Modules marked as enabled can be accessed by organizations subscribed to the designated plan tier.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature Module</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Global Status</TableHead>
                {planTiers.map((tier) => (
                  <TableHead key={tier} className="text-center">{tier.replace("_", " ")}</TableHead>
                ))}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entitlements.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-semibold text-foreground">{item.moduleName}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{item.code}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded ${item.enabledGlobal ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}>
                      {item.enabledGlobal ? "Active" : "Disabled"}
                    </span>
                  </TableCell>
                  {planTiers.map((tier) => {
                    const isAllowed = (item.plansAllowed || []).includes(tier);
                    return (
                      <TableCell key={tier} className="text-center">
                        {isAllowed ? (
                          <span className="inline-flex p-1 rounded bg-emerald-500/10 text-emerald-600">
                            <Check className="h-4 w-4" />
                          </span>
                        ) : (
                          <span className="inline-flex p-1 rounded bg-muted text-muted-foreground">
                            <X className="h-4 w-4" />
                          </span>
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggle(item.id, item.enabledGlobal)}
                    >
                      Toggle Status
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
